import { ResearchSource, SourceFailureReason } from '../types';
import { logger } from '../utils/logger';
import { generateContentWithRetryAndFallback } from '../ai/gemini';

export interface ExtractedSourceData {
  title: string;
  canonicalUrl?: string;
  rawTextSnippet: string;
  wordCount: number;
  httpStatus: number;
  success: boolean;
  failureReason?: SourceFailureReason;
  errorMessage?: string;
  groundedSearch?: boolean;
}

export interface IResearchTool {
  fetchUrl(url: string, businessContext?: string): Promise<ExtractedSourceData>;
}

export class HttpResearchTool implements IResearchTool {
  private timeoutMs: number;
  private maxContentLength: number;

  constructor(timeoutMs = 12000, maxContentLength = 15000) {
    this.timeoutMs = timeoutMs;
    this.maxContentLength = maxContentLength;
  }

  async fetchUrl(url: string, businessContext?: string): Promise<ExtractedSourceData> {
    logger.info(`Fetching research source URL: ${url}`);

    // URL validation
    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        return {
          title: 'Invalid Protocol',
          rawTextSnippet: '',
          wordCount: 0,
          httpStatus: 400,
          success: false,
          failureReason: 'INVALID_URL',
          errorMessage: 'Only HTTP and HTTPS URLs are allowed.',
        };
      }
    } catch {
      return {
        title: 'Malformed URL',
        rawTextSnippet: '',
        wordCount: 0,
        httpStatus: 400,
        success: false,
        failureReason: 'INVALID_URL',
        errorMessage: 'Invalid URL syntax.',
      };
    }

    // Attempt real HTTP fetch with abort controller
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(validUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (compatible; MarketResearchEngine/2.0)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
      });

      clearTimeout(timer);

      if (response.ok) {
        const html = await response.text();
        const parsed = this.parseHtml(html, validUrl.toString(), response.status);
        if (parsed.success && parsed.wordCount > 40) {
          return parsed;
        }
      }

      // If direct scrape was blocked (403, 401, JS-SPA empty content), try live Google Search Grounding
      const searchFallback = await this.fetchViaGoogleSearch(validUrl.toString(), businessContext);
      if (searchFallback.success) {
        return searchFallback;
      }

      if (response.status === 401 || response.status === 403) {
        return {
          title: `Access Protected (${validUrl.hostname})`,
          rawTextSnippet: '',
          wordCount: 0,
          httpStatus: response.status,
          success: false,
          failureReason: response.status === 401 ? 'AUTH_REQUIRED' : 'BLOCKED',
          errorMessage: `Source returned HTTP ${response.status}: Access restricted by anti-bot firewall.`,
        };
      }

      return {
        title: `${validUrl.hostname} (HTTP ${response.status})`,
        rawTextSnippet: '',
        wordCount: 0,
        httpStatus: response.status,
        success: false,
        failureReason: 'UNREACHABLE',
        errorMessage: `Source returned HTTP status ${response.status}.`,
      };
    } catch (err: any) {
      clearTimeout(timer);

      // Attempt Google Search Grounding fallback before failing
      const searchFallback = await this.fetchViaGoogleSearch(validUrl.toString(), businessContext);
      if (searchFallback.success) {
        return searchFallback;
      }

      if (err.name === 'AbortError') {
        return {
          title: `${validUrl.hostname} (Timeout)`,
          rawTextSnippet: '',
          wordCount: 0,
          httpStatus: 504,
          success: false,
          failureReason: 'TIMEOUT',
          errorMessage: `Connection timed out after ${this.timeoutMs / 1000}s.`,
        };
      }

      logger.warn(`Fetch error for ${url}: ${err.message}`);
      return {
        title: `${validUrl.hostname} (Offline)`,
        rawTextSnippet: '',
        wordCount: 0,
        httpStatus: 502,
        success: false,
        failureReason: 'UNREACHABLE',
        errorMessage: `Failed to connect to ${validUrl.hostname}: ${err.message}`,
      };
    }
  }

  /**
   * Live Google Search Grounding for JS-heavy, protected, or blocked web sources
   */
  private async fetchViaGoogleSearch(url: string, businessContext?: string): Promise<ExtractedSourceData> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        title: '',
        rawTextSnippet: '',
        wordCount: 0,
        httpStatus: 0,
        success: false,
      };
    }

    try {
      const prompt = `Perform a live web search on the target website/domain "${url}" in the context of: ${businessContext || 'competitive intelligence, product offerings, features, pricing, and positioning'}.
Retrieve exact factual descriptions, pricing tiers, core claims, features, target audience signals, and company background from the live web.`;

      const result = await generateContentWithRetryAndFallback({
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      if (result && result.response) {
        const text = result.response.text || '';
        const domain = new URL(url).hostname;
        const grounding = result.response.candidates?.[0]?.groundingMetadata;
        const chunks = grounding?.groundingChunks || [];
        const primarySource = chunks.find((c: any) => c.web?.title) as any;
        const title = primarySource?.web?.title || `${domain} Intelligence (Live Search Grounded)`;

        if (text.length > 50) {
          return {
            title,
            canonicalUrl: primarySource?.web?.uri || url,
            rawTextSnippet: text.slice(0, this.maxContentLength),
            wordCount: text.split(/\s+/).length,
            httpStatus: 200,
            success: true,
            groundedSearch: true,
          };
        }
      }
    } catch (e: any) {
      logger.info(`Google Search grounding fallback failed for ${url}: ${e.message}`);
    }

    return {
      title: '',
      rawTextSnippet: '',
      wordCount: 0,
      httpStatus: 0,
      success: false,
    };
  }

  private parseHtml(html: string, url: string, status: number): ExtractedSourceData {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : '';

    if (!title) {
      const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
      title = ogTitle ? ogTitle[1].trim() : new URL(url).hostname;
    }

    // Extract meta description
    const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';

    // Extract canonical URL if available
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : undefined;

    // Clean HTML
    let cleaned = html
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

    if (metaDesc && !cleaned.includes(metaDesc)) {
      cleaned = `${metaDesc}\n\n${cleaned}`;
    }

    if (!cleaned || cleaned.length < 50) {
      return {
        title,
        canonicalUrl,
        rawTextSnippet: '',
        wordCount: 0,
        httpStatus: status,
        success: false,
        failureReason: 'EMPTY_CONTENT',
        errorMessage: 'Source loaded but contains no visible readable content (possible JS SPA without SSR).',
      };
    }

    // Truncate to maximum bound for token efficiency & memory safety
    const rawTextSnippet = cleaned.slice(0, this.maxContentLength);
    const wordCount = cleaned.split(/\s+/).length;

    return {
      title,
      canonicalUrl,
      rawTextSnippet,
      wordCount,
      httpStatus: status,
      success: true,
    };
  }
}

export const researchTool: IResearchTool = new HttpResearchTool();

