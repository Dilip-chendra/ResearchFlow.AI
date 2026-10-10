import { logger } from '../utils/logger';
import { validateSafeUrl } from './ssrfGuard';

export interface SitemapEntry {
  url: string;
  category: string;
  priority: number;
  lastMod?: string;
}

export interface RobotsCheckResult {
  isAllowed: boolean;
  sitemapUrls: string[];
}

/**
 * Categorizes a URL path into strategic business intelligence categories.
 */
export function categorizeUrlPath(urlStr: string): { category: string; priority: number } {
  try {
    const parsed = new URL(urlStr);
    const path = parsed.pathname.toLowerCase();

    // 1. Pricing & Plans (Highest Strategic Value)
    if (path.includes('/pricing') || path.includes('/plans') || path.includes('/billing') || path.includes('/tier')) {
      return { category: 'PRICING_PAGE', priority: 100 };
    }

    // 2. Product, Features & Capabilities
    if (path.includes('/product') || path.includes('/feature') || path.includes('/platform') || path.includes('/solution') || path.includes('/capability')) {
      return { category: 'PRODUCT_PAGE', priority: 90 };
    }

    // 3. About, Company, Story, Team & Leadership
    if (path.includes('/about') || path.includes('/company') || path.includes('/team') || path.includes('/leadership') || path.includes('/story')) {
      return { category: 'ABOUT_PAGE', priority: 85 };
    }

    // 4. Case Studies, Customers, Testimonials & Social Proof
    if (path.includes('/customer') || path.includes('/case-stud') || path.includes('/testimonial') || path.includes('/client') || path.includes('/stories')) {
      return { category: 'CASE_STUDIES', priority: 80 };
    }

    // 5. Documentation, API & Help Center
    if (path.includes('/docs') || path.includes('/help') || path.includes('/api') || path.includes('/developers') || path.includes('/guide')) {
      return { category: 'DOCS_HELP', priority: 75 };
    }

    // 6. Careers, Jobs & Hiring Signals
    if (path.includes('/career') || path.includes('/jobs') || path.includes('/hiring') || path.includes('/join-us')) {
      return { category: 'CAREERS', priority: 65 };
    }

    // 7. Blog, Newsroom & Announcements
    if (path.includes('/blog') || path.includes('/news') || path.includes('/press') || path.includes('/announcement')) {
      return { category: 'BLOG_NEWS', priority: 60 };
    }

    // 8. Homepage / Root
    if (path === '/' || path === '' || path === '/index.html') {
      return { category: 'OFFICIAL_WEBSITE', priority: 95 };
    }

    return { category: 'OTHER', priority: 50 };
  } catch {
    return { category: 'OTHER', priority: 30 };
  }
}

/**
 * Fetches and parses robots.txt for a given base URL.
 */
export async function inspectRobotsTxt(baseUrlStr: string): Promise<RobotsCheckResult> {
  const result: RobotsCheckResult = {
    isAllowed: true,
    sitemapUrls: [],
  };

  try {
    const base = new URL(baseUrlStr);
    const robotsUrl = `${base.protocol}//${base.host}/robots.txt`;

    const validation = await validateSafeUrl(robotsUrl);
    if (!validation.isValid) return result;

    const res = await fetch(robotsUrl, {
      headers: {
        'User-Agent': 'ResearchFlow/2.0 (+https://researchflow.ai; company-intelligence-bot)',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return result;

    const content = await res.text();
    const lines = content.split('\n');

    let isCurrentAgentApplicable = true;
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const [directive, ...valParts] = line.split(':');
      const key = directive.trim().toLowerCase();
      const val = valParts.join(':').trim();

      if (key === 'user-agent') {
        const agent = val.toLowerCase();
        isCurrentAgentApplicable = agent === '*' || agent.includes('researchflow') || agent.includes('bot');
      } else if (key === 'sitemap') {
        if (val.startsWith('http')) {
          result.sitemapUrls.push(val);
        }
      } else if (key === 'disallow' && isCurrentAgentApplicable) {
        if (val === '/') {
          result.isAllowed = false;
        }
      }
    }
  } catch (err: any) {
    logger.info(`robots.txt check skipped for ${baseUrlStr}: ${err.message}`);
  }

  return result;
}

/**
 * Discovers and extracts internal URLs from XML sitemaps.
 */
export async function discoverSitemapUrls(baseUrlStr: string, customSitemaps?: string[]): Promise<SitemapEntry[]> {
  const discovered: SitemapEntry[] = [];
  const visitedSitemaps = new Set<string>();

  const base = new URL(baseUrlStr);
  const candidateSitemaps = customSitemaps && customSitemaps.length > 0
    ? customSitemaps
    : [
        `${base.protocol}//${base.host}/sitemap.xml`,
        `${base.protocol}//${base.host}/sitemap_index.xml`,
        `${base.protocol}//${base.host}/sitemap/sitemap.xml`,
      ];

  for (const sitemapUrl of candidateSitemaps) {
    if (visitedSitemaps.has(sitemapUrl)) continue;
    visitedSitemaps.add(sitemapUrl);

    try {
      const validation = await validateSafeUrl(sitemapUrl);
      if (!validation.isValid) continue;

      const res = await fetch(sitemapUrl, {
        headers: {
          'User-Agent': 'ResearchFlow/2.0 (+https://researchflow.ai; company-intelligence-bot)',
          Accept: 'application/xml,text/xml,*/*',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) continue;

      const xml = await res.text();

      // Check if it's a sitemap index containing child sitemaps
      const sitemapIndexMatches = Array.from(xml.matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/sitemap>/gi));
      if (sitemapIndexMatches.length > 0) {
        for (const match of sitemapIndexMatches.slice(0, 5)) {
          const childSitemap = match[1].trim();
          if (childSitemap.startsWith('http') && !visitedSitemaps.has(childSitemap)) {
            candidateSitemaps.push(childSitemap);
          }
        }
        continue;
      }

      // Extract url entries: <url><loc>...</loc><lastmod>...</lastmod></url>
      const urlMatches = Array.from(xml.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>(?:[\s\S]*?<lastmod>([^<]+)<\/lastmod>)?[\s\S]*?<\/url>/gi));
      for (const match of urlMatches) {
        const pageUrl = match[1].trim();
        const lastMod = match[2]?.trim();

        // Ensure pageUrl is on same host or subdomain
        try {
          const parsed = new URL(pageUrl);
          if (parsed.hostname.toLowerCase() === base.hostname.toLowerCase() || parsed.hostname.endsWith(`.${base.hostname}`)) {
            const { category, priority } = categorizeUrlPath(pageUrl);
            discovered.push({
              url: pageUrl,
              category,
              priority,
              lastMod,
            });
          }
        } catch {}
      }

      if (discovered.length > 0) {
        logger.info(`Discovered ${discovered.length} URLs from sitemap ${sitemapUrl}`);
        break; // Successfully gathered from primary sitemap
      }
    } catch (err: any) {
      logger.info(`Sitemap parse failed for ${sitemapUrl}: ${err.message}`);
    }
  }

  // Deduplicate and sort by priority descending
  const uniqueMap = new Map<string, SitemapEntry>();
  for (const item of discovered) {
    if (!uniqueMap.has(item.url)) {
      uniqueMap.set(item.url, item);
    }
  }

  return Array.from(uniqueMap.values()).sort((a, b) => b.priority - a.priority);
}
