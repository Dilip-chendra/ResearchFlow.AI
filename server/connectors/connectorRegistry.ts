import { DigitalPropertyCategory, DigitalConnectionStatus } from '../types';

export interface ConnectorReport {
  sourceType: DigitalPropertyCategory;
  name: string;
  connectionStatus: DigitalConnectionStatus;
  authStatus: 'NONE' | 'AUTHORIZED' | 'EXPIRED' | 'UNAUTHORIZED';
  availableAccessScope: string;
  supportedDataTypes: string[];
  refreshBehavior: 'ON_DEMAND' | 'SCHEDULED_DAILY' | 'MANUAL_ONLY';
  dataFreshness: string;
  lastSuccessfulRetrieval?: string;
  lastError?: string;
  recommendedAlternative?: string;
}

export interface ISourceConnector {
  category: DigitalPropertyCategory;
  inspectUrl(url: string): Promise<ConnectorReport>;
}

/**
 * Standardized connector for Company Official Website & Web Pages
 */
export class WebsiteConnector implements ISourceConnector {
  category: DigitalPropertyCategory = 'OFFICIAL_WEBSITE';

  async inspectUrl(url: string): Promise<ConnectorReport> {
    return {
      sourceType: this.category,
      name: 'Website & Web Properties',
      connectionStatus: 'CONNECTED',
      authStatus: 'NONE',
      availableAccessScope: 'Public Web HTML, Sitemap & Robots.txt Directives',
      supportedDataTypes: ['Headings', 'Text Content', 'JSON-LD Structured Data', 'Meta Tags'],
      refreshBehavior: 'ON_DEMAND',
      dataFreshness: 'Live Web (On-Demand Fetch)',
    };
  }
}

/**
 * Standardized connector for LinkedIn Company & Profiles
 * Strictly adheres to LinkedIn Developer Policy: Public page metadata only without scraping login-walled user data.
 */
export class LinkedInConnector implements ISourceConnector {
  category: DigitalPropertyCategory = 'LINKEDIN_COMPANY';

  async inspectUrl(url: string): Promise<ConnectorReport> {
    const isCompany = url.includes('/company/');
    return {
      sourceType: isCompany ? 'LINKEDIN_COMPANY' : 'FOUNDER_PROFILE',
      name: isCompany ? 'LinkedIn Company Page' : 'LinkedIn Executive Profile',
      connectionStatus: 'PUBLIC_ACCESSIBLE',
      authStatus: 'NONE',
      availableAccessScope: 'Public OpenGraph metadata & brand description. Private employee data and member connections require OAuth 2.0 Community Management API approval.',
      supportedDataTypes: ['Brand Headline', 'Industry Category', 'Public About Snippet'],
      refreshBehavior: 'MANUAL_ONLY',
      dataFreshness: 'Public Snapshot',
      recommendedAlternative: 'Connect LinkedIn OAuth Organization account for verified follower analytics and direct post publishing.',
    };
  }
}

/**
 * Standardized connector for GitHub Organizations & Repositories
 */
export class GitHubConnector implements ISourceConnector {
  category: DigitalPropertyCategory = 'GITHUB';

  async inspectUrl(url: string): Promise<ConnectorReport> {
    return {
      sourceType: 'GITHUB',
      name: 'GitHub Organization / Repository',
      connectionStatus: 'CONNECTED',
      authStatus: 'NONE',
      availableAccessScope: 'Public Repository README, Releases, Issue counts & Topics via Public REST API v3.',
      supportedDataTypes: ['Documentation', 'Release Notes', 'Tech Stack / Languages', 'Open Source Community Signals'],
      refreshBehavior: 'ON_DEMAND',
      dataFreshness: 'Real-Time Public API',
    };
  }
}

/**
 * Standardized connector for Review Portals (G2, Capterra, Trustpilot, Product Hunt)
 */
export class ReviewsConnector implements ISourceConnector {
  category: DigitalPropertyCategory = 'PUBLIC_REVIEWS';

  async inspectUrl(url: string): Promise<ConnectorReport> {
    return {
      sourceType: 'PUBLIC_REVIEWS',
      name: 'Public Review Profile',
      connectionStatus: 'PUBLIC_ACCESSIBLE',
      authStatus: 'NONE',
      availableAccessScope: 'Public verified user quotes, review summaries, rating aggregations.',
      supportedDataTypes: ['Customer Testimonials', 'Reported Pros & Cons', 'Rating Metrics'],
      refreshBehavior: 'ON_DEMAND',
      dataFreshness: 'Public Web Retrieval',
      recommendedAlternative: 'Upload raw customer satisfaction export (CSV) or Zendesk/Intercom support tags in Customer Intelligence tab for 100% verified internal data.',
    };
  }
}

/**
 * Standardized connector for Social Channels (X/Twitter, YouTube, Instagram)
 */
export class SocialChannelConnector implements ISourceConnector {
  category: DigitalPropertyCategory = 'TWITTER_X';

  async inspectUrl(url: string): Promise<ConnectorReport> {
    let channelName = 'Social Channel';
    if (url.includes('twitter.com') || url.includes('x.com')) channelName = 'X (formerly Twitter)';
    else if (url.includes('youtube.com')) channelName = 'YouTube Channel';
    else if (url.includes('instagram.com')) channelName = 'Instagram Profile';

    return {
      sourceType: 'TWITTER_X',
      name: channelName,
      connectionStatus: 'PUBLIC_ACCESSIBLE',
      authStatus: 'NONE',
      availableAccessScope: 'Public bio, channel description, and public video titles/transcripts. Direct message data and follower demographics require official OAuth application authorization.',
      supportedDataTypes: ['Channel Bio', 'Published Video Transcripts', 'Public Content Themes'],
      refreshBehavior: 'MANUAL_ONLY',
      dataFreshness: 'Public Web Snapshot',
    };
  }
}

/**
 * Unified Connector Registry
 */
export class ConnectorRegistry {
  private connectors: Map<string, ISourceConnector> = new Map();

  constructor() {
    this.register(new WebsiteConnector());
    this.register(new LinkedInConnector());
    this.register(new GitHubConnector());
    this.register(new ReviewsConnector());
    this.register(new SocialChannelConnector());
  }

  register(connector: ISourceConnector) {
    this.connectors.set(connector.category, connector);
  }

  async inspect(category: DigitalPropertyCategory, url: string): Promise<ConnectorReport> {
    return this.inspectProperty(category, url);
  }

  async inspectProperty(category: DigitalPropertyCategory, url: string): Promise<ConnectorReport> {
    if (url.includes('linkedin.com')) {
      return new LinkedInConnector().inspectUrl(url);
    }
    if (url.includes('github.com')) {
      return new GitHubConnector().inspectUrl(url);
    }
    if (url.includes('g2.com') || url.includes('capterra.com') || url.includes('producthunt.com') || url.includes('trustpilot.com')) {
      return new ReviewsConnector().inspectUrl(url);
    }
    if (url.includes('twitter.com') || url.includes('x.com') || url.includes('youtube.com') || url.includes('instagram.com')) {
      return new SocialChannelConnector().inspectUrl(url);
    }

    const matched = this.connectors.get(category) || new WebsiteConnector();
    return matched.inspectUrl(url);
  }
}

export const connectorRegistry = new ConnectorRegistry();
