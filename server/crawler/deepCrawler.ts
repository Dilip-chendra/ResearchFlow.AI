import crypto from 'crypto';
import { logger } from '../utils/logger';
import { validateSafeUrl } from './ssrfGuard';
import { inspectRobotsTxt, discoverSitemapUrls, categorizeUrlPath } from './sitemapParser';
import { CrawlPageRecord, DeepCrawlJob } from '../types';

export interface CrawledPageData {
  url: string;
  title: string;
  category: string;
  metaDescription?: string;
  cleanText: string;
  headings: string[];
  structuredDataJson?: any;
  wordCount: number;
  sha256Hash: string;
  httpStatus: number;
  retrievedAt: string;
}

export interface DeepCrawlOptions {
  maxPageBudget?: number; // default: 25
  maxDepth?: number; // default: 2
  timeoutMs?: number; // default: 10000
  concurrency?: number; // default: 3
  additionalSeedUrls?: string[];
  onProgress?: (progress: { discovered: number; analyzed: number; currentUrl?: string }) => void;
}

export class DeepCompanyCrawler {
  private userAgent = 'ResearchFlow/2.0 (+https://researchflow.ai; company-intelligence-crawler)';

  async runCrawl(
    rootUrl: string,
    workspaceId: string,
    options: DeepCrawlOptions = {}
  ): Promise<{
    job: DeepCrawlJob;
    pages: CrawledPageData[];
  }> {
    const budget = options.maxPageBudget || 25;
    const timeoutMs = options.timeoutMs || 10000;
    const startTime = new Date().toISOString();
    const jobId = `crawl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const crawlJob: DeepCrawlJob = {
      id: jobId,
      workspaceId,
      rootUrl,
      status: 'DISCOVERING',
      pagesDiscovered: 0,
      pagesAnalyzed: 0,
      pagesSkipped: 0,
      pagesFailed: 0,
      maxPageBudget: budget,
      maxDepth: options.maxDepth || 2,
      crawlInventory: [],
      startedAt: startTime,
    };

    // 1. Validate root URL against SSRF
    const rootCheck = await validateSafeUrl(rootUrl);
    if (!rootCheck.isValid) {
      crawlJob.status = 'FAILED';
      crawlJob.errorMessage = rootCheck.reason || 'Root URL failed security validation.';
      crawlJob.completedAt = new Date().toISOString();
      return { job: crawlJob, pages: [] };
    }

    const baseParsed = new URL(rootCheck.sanitizedUrl!);
    const baseHost = baseParsed.hostname.toLowerCase();

    // 2. Robots.txt check
    const robots = await inspectRobotsTxt(rootCheck.sanitizedUrl!);
    if (!robots.isAllowed) {
      logger.warn(`Crawling disallowed by robots.txt for ${rootUrl}`);
      crawlJob.status = 'FAILED';
      crawlJob.errorMessage = 'Crawling disallowed by target website robots.txt directive.';
      crawlJob.completedAt = new Date().toISOString();
      return { job: crawlJob, pages: [] };
    }

    // 3. Queue initialization & Sitemap discovery
    const urlQueue: { url: string; category: string; priority: number; depth: number }[] = [];
    const queuedSet = new Set<string>();

    const enqueue = (u: string, cat?: string, prio?: number, depth = 1) => {
      try {
        const p = new URL(u);
        // Normalize: strip hash, trailing slash
        p.hash = '';
        let norm = p.toString();
        if (norm.endsWith('/') && p.pathname !== '/') {
          norm = norm.slice(0, -1);
        }

        if (queuedSet.has(norm)) return;
        if (p.hostname.toLowerCase() !== baseHost && !p.hostname.toLowerCase().endsWith(`.${baseHost}`)) {
          return; // Ignore external domains during company crawl
        }

        // Avoid media/binary extensions
        if (norm.match(/\.(jpg|jpeg|png|gif|webp|svg|pdf|zip|tar|gz|mp4|mp3|exe|woff|woff2|css|js)$/i)) {
          return;
        }

        queuedSet.add(norm);
        const autoCat = categorizeUrlPath(norm);
        urlQueue.push({
          url: norm,
          category: cat || autoCat.category,
          priority: prio !== undefined ? prio : autoCat.priority,
          depth,
        });
      } catch {}
    };

    // Enqueue root URL with maximum priority
    enqueue(rootCheck.sanitizedUrl!, 'OFFICIAL_WEBSITE', 100, 0);

    // Enqueue additional seed URLs (e.g. user provided pricing/about/docs links)
    if (options.additionalSeedUrls) {
      for (const extra of options.additionalSeedUrls) {
        if (extra && extra.trim()) {
          enqueue(extra.trim(), undefined, undefined, 1);
        }
      }
    }

    // Discover XML sitemap URLs
    try {
      const sitemapEntries = await discoverSitemapUrls(rootCheck.sanitizedUrl!, robots.sitemapUrls);
      for (const entry of sitemapEntries.slice(0, 80)) {
        enqueue(entry.url, entry.category, entry.priority, 1);
      }
    } catch (e: any) {
      logger.info(`Sitemap discovery non-fatal error: ${e.message}`);
    }

    crawlJob.pagesDiscovered = urlQueue.length;
    crawlJob.status = 'CRAWLING';

    // Sort queue by priority descending (pricing > product > about > case-studies > others)
    urlQueue.sort((a, b) => b.priority - a.priority);

    const crawledPages: CrawledPageData[] = [];
    const visitedSet = new Set<string>();

    // 4. Crawl loop respecting budget
    while (urlQueue.length > 0 && crawledPages.length < budget) {
      const current = urlQueue.shift()!;
      if (visitedSet.has(current.url)) continue;
      visitedSet.add(current.url);

      // Validate URL against SSRF before opening connection
      const safeCheck = await validateSafeUrl(current.url);
      if (!safeCheck.isValid) {
        crawlJob.pagesFailed++;
        crawlJob.crawlInventory.push({
          url: current.url,
          title: 'Blocked Security Invariant',
          category: current.category,
          httpStatus: 400,
          wordCount: 0,
          sha256Hash: '',
          status: 'FAILED',
          failureReason: safeCheck.reason,
          crawledAt: new Date().toISOString(),
        });
        continue;
      }

      options.onProgress?.({
        discovered: crawlJob.pagesDiscovered,
        analyzed: crawledPages.length,
        currentUrl: current.url,
      });

      try {
        const response = await fetch(safeCheck.sanitizedUrl!, {
          headers: {
            'User-Agent': this.userAgent,
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: AbortSignal.timeout(timeoutMs),
          redirect: 'follow',
        });

        const status = response.status;
        if (!response.ok) {
          crawlJob.pagesFailed++;
          crawlJob.crawlInventory.push({
            url: current.url,
            title: `HTTP ${status}`,
            category: current.category,
            httpStatus: status,
            wordCount: 0,
            sha256Hash: '',
            status: 'FAILED',
            failureReason: `Server returned HTTP ${status}`,
            crawledAt: new Date().toISOString(),
          });
          continue;
        }

        const html = await response.text();
        const extracted = this.extractHtml(html, current.url, current.category, status);

        if (extracted.wordCount < 30) {
          crawlJob.pagesSkipped++;
          crawlJob.crawlInventory.push({
            url: current.url,
            title: extracted.title || 'Empty Page',
            category: current.category,
            httpStatus: status,
            wordCount: extracted.wordCount,
            sha256Hash: extracted.sha256Hash,
            status: 'SKIPPED_DUPLICATE',
            failureReason: 'Page content under minimum threshold (< 30 words).',
            crawledAt: new Date().toISOString(),
          });
          continue;
        }

        crawledPages.push(extracted);
        crawlJob.pagesAnalyzed++;
        crawlJob.crawlInventory.push({
          url: current.url,
          title: extracted.title,
          category: current.category,
          httpStatus: status,
          wordCount: extracted.wordCount,
          sha256Hash: extracted.sha256Hash,
          status: 'SUCCESS',
          crawledAt: new Date().toISOString(),
        });

        // 5. Discover internal links on homepage and high-value pages if queue is under budget
        if (current.depth < (options.maxDepth || 2) && urlQueue.length < budget * 2) {
          const discoveredLinks = this.extractInternalLinks(html, current.url, baseHost);
          for (const link of discoveredLinks) {
            if (!queuedSet.has(link)) {
              enqueue(link, undefined, undefined, current.depth + 1);
            }
          }
          crawlJob.pagesDiscovered = queuedSet.size;
        }
      } catch (fetchErr: any) {
        crawlJob.pagesFailed++;
        crawlJob.crawlInventory.push({
          url: current.url,
          title: 'Fetch Error',
          category: current.category,
          httpStatus: 500,
          wordCount: 0,
          sha256Hash: '',
          status: 'FAILED',
          failureReason: fetchErr.name === 'TimeoutError' ? 'Timeout' : fetchErr.message,
          crawledAt: new Date().toISOString(),
        });
      }
    }

    crawlJob.status = crawledPages.length > 0 ? 'COMPLETED' : 'FAILED';
    crawlJob.completedAt = new Date().toISOString();

    logger.info(
      `Deep crawl finished for ${rootUrl}: ${crawledPages.length} analyzed, ${crawlJob.pagesSkipped} skipped, ${crawlJob.pagesFailed} failed.`
    );

    return { job: crawlJob, pages: crawledPages };
  }

  private extractHtml(html: string, url: string, category: string, status: number): CrawledPageData {
    // 1. Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : '';

    if (!title) {
      const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
      title = ogTitle ? ogTitle[1].trim() : new URL(url).pathname;
    }

    // 2. Meta description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const metaDescription = descMatch ? descMatch[1].trim() : undefined;

    // 3. Headings
    const headings: string[] = [];
    const headingMatches = Array.from(html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi));
    for (const h of headingMatches.slice(0, 15)) {
      const cleanH = h[1].replace(/<[^>]+>/g, '').trim();
      if (cleanH && cleanH.length > 3 && cleanH.length < 140) {
        headings.push(cleanH);
      }
    }

    // 4. JSON-LD structured data
    let structuredDataJson: any = undefined;
    const jsonLdMatch = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        structuredDataJson = JSON.parse(jsonLdMatch[1].trim());
      } catch {}
    }

    // 5. Clean text content (strip boilerplate)
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

    const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
    const sha256Hash = crypto.createHash('sha256').update(cleanText).digest('hex');

    return {
      url,
      title: title.slice(0, 120),
      category,
      metaDescription,
      cleanText: cleanText.slice(0, 20000), // Max 20k chars per page for memory efficiency
      headings,
      structuredDataJson,
      wordCount,
      sha256Hash,
      httpStatus: status,
      retrievedAt: new Date().toISOString(),
    };
  }

  private extractInternalLinks(html: string, currentUrl: string, baseHost: string): string[] {
    const internalLinks: string[] = [];
    const hrefMatches = Array.from(html.matchAll(/href=["']([^"'#\s]+)["']/gi));

    for (const match of hrefMatches) {
      const rawHref = match[1];
      if (rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
        continue;
      }

      try {
        const resolved = new URL(rawHref, currentUrl);
        const resolvedHost = resolved.hostname.toLowerCase();

        if (resolvedHost === baseHost || resolvedHost.endsWith(`.${baseHost}`)) {
          // Internal link
          resolved.hash = '';
          internalLinks.push(resolved.toString());
        }
      } catch {}
    }

    return Array.from(new Set(internalLinks));
  }
}

export const deepCrawler = new DeepCompanyCrawler();
