import { db } from '../db/store';
import { SearchResultItem, LinkedInAsset, EmailAsset, SEOAsset } from '../types';
import { logger } from '../utils/logger';

export class SearchService {
  search(workspaceId: string, query: string, type?: string, limit = 40): SearchResultItem[] {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];

    const terms = q.split(/\s+/).filter(Boolean);
    const results: SearchResultItem[] = [];

    const matches = (text?: string): boolean => {
      if (!text) return false;
      const lower = text.toLowerCase();
      return terms.every(term => lower.includes(term));
    };

    // 1. Search Research Jobs
    if (!type || type === 'all' || type === 'research') {
      const jobs = db.listResearchJobs(workspaceId);
      for (const job of jobs) {
        const matchField =
          matches(job.businessName) ||
          matches(job.campaignObjective) ||
          matches(job.targetAudience) ||
          matches(job.businessDescription) ||
          matches(job.status) ||
          job.competitorUrls.some(u => matches(u));

        if (matchField) {
          results.push({
            id: job.id,
            type: 'research',
            title: job.businessName || 'Untitled Research Job',
            subtitle: job.campaignObjective || job.businessDescription || 'Competitive Research & Intelligence',
            snippet: job.targetAudience ? `Audience: ${job.targetAudience}` : undefined,
            jobId: job.id,
            badge: (job.status || 'DRAFT').replace(/_/g, ' ').toUpperCase(),
            badgeVariant:
              job.status === 'approved'
                ? 'emerald'
                : job.status === 'awaiting_review'
                ? 'amber'
                : 'blue',
            timestamp: job.createdAt,
            metadata: {
              status: job.status,
              sourcesCount: job.sourcesCount || 0,
              evidenceCount: job.evidenceCount || 0,
            },
          });
        }
      }
    }

    // 2. Search Campaigns & Assets
    if (!type || type === 'all' || type === 'campaign') {
      const jobs = db.listResearchJobs(workspaceId);
      for (const job of jobs) {
        const brief = db.getCampaignBriefByJobId(job.id);
        if (brief) {
          const matchBrief =
            matches(brief.campaignAngle) ||
            matches(brief.primaryMessage) ||
            matches(brief.audience) ||
            matches(brief.positioning) ||
            matches(brief.executiveSummary) ||
            matches(job.businessName) ||
            brief.evidenceReferences?.some(c => matches(c.claim) || matches(c.sourceUrl));

          if (matchBrief) {
            results.push({
              id: brief.id,
              type: 'campaign',
              title: brief.campaignAngle || `Campaign: ${job.businessName}`,
              subtitle: brief.primaryMessage || `Strategy for ${job.businessName}`,
              snippet: brief.audience ? `Audience: ${brief.audience}` : undefined,
              jobId: job.id,
              badge: 'CAMPAIGN STRATEGY',
              badgeVariant: 'purple',
              timestamp: brief.generatedAt,
              metadata: {
                businessName: job.businessName,
                citationsCount: brief.evidenceReferences?.length || 0,
              },
            });
          }
        }

        const assets = db.listCampaignAssets(job.id);
        for (const asset of assets) {
          let assetSnippet = '';
          let assetHook = '';

          if (asset.channel === 'LINKEDIN') {
            const c = asset.content as LinkedInAsset;
            assetHook = c.hook || '';
            assetSnippet = c.body || '';
          } else if (asset.channel === 'EMAIL') {
            const c = asset.content as EmailAsset;
            assetHook = c.subject || '';
            assetSnippet = c.previewText || c.body || '';
          } else if (asset.channel === 'SEO') {
            const c = asset.content as SEOAsset;
            assetHook = c.searchIntent || '';
            assetSnippet = `Keyword: ${c.primaryKeyword || ''}. ${c.topic || ''}`;
          }

          const matchAsset =
            matches(asset.title) ||
            matches(assetHook) ||
            matches(assetSnippet) ||
            matches(asset.channel) ||
            matches(job.businessName);

          if (matchAsset) {
            results.push({
              id: asset.id,
              type: 'campaign',
              title: `${asset.channel}: ${asset.title}`,
              subtitle: assetHook || `Marketing asset for ${job.businessName}`,
              snippet: assetSnippet ? assetSnippet.slice(0, 120) + (assetSnippet.length > 120 ? '...' : '') : undefined,
              jobId: job.id,
              badge: asset.channel,
              badgeVariant: 'purple',
              timestamp: job.createdAt,
              metadata: {
                channel: asset.channel,
                jobBusinessName: job.businessName,
              },
            });
          }
        }
      }
    }

    // 3. Search Execution Tasks
    if (!type || type === 'all' || type === 'task') {
      const tasks = db.listTasks(workspaceId);
      for (const task of tasks) {
        const matchTask =
          matches(task.title) ||
          matches(task.description) ||
          matches(task.category) ||
          matches(task.status) ||
          matches(task.priority) ||
          matches(task.reason);

        if (matchTask) {
          results.push({
            id: task.id,
            type: 'task',
            title: task.title,
            subtitle: `${task.category} • Priority: ${task.priority}`,
            snippet: task.description,
            jobId: task.researchJobId,
            badge: task.status === 'COMPLETED' ? 'COMPLETED' : `${task.priority} PRIORITY`,
            badgeVariant:
              task.status === 'COMPLETED'
                ? 'emerald'
                : task.priority === 'HIGH'
                ? 'amber'
                : 'zinc',
            timestamp: task.createdAt,
            metadata: {
              status: task.status,
              category: task.category,
              priority: task.priority,
            },
          });
        }
      }
    }

    // 4. Search Evidence & Claims
    if (!type || type === 'all' || type === 'evidence') {
      const evidenceList = db.listAllEvidenceForWorkspace(workspaceId);
      for (const ev of evidenceList) {
        const matchEv =
          matches(ev.claim) ||
          matches(ev.supportingText) ||
          matches(ev.sourceTitle) ||
          matches(ev.sourceUrl) ||
          matches(ev.category) ||
          matches(ev.normalizedValue) ||
          matches(ev.evidenceType);

        if (matchEv) {
          results.push({
            id: ev.id,
            type: 'evidence',
            title: ev.claim,
            subtitle: `${ev.sourceTitle || ev.sourceUrl} (${ev.category})`,
            snippet: ev.supportingText ? `"${ev.supportingText.slice(0, 140)}"` : undefined,
            jobId: ev.researchJobId,
            badge: `${ev.category} • ${ev.confidence}`,
            badgeVariant: ev.confidence === 'HIGH' ? 'emerald' : 'amber',
            timestamp: ev.retrievedAt,
            metadata: {
              category: ev.category,
              confidence: ev.confidence,
              sourceUrl: ev.sourceUrl,
              evidenceType: ev.evidenceType,
            },
          });
        }
      }
    }

    logger.info(`Global search query "${query}" yielded ${results.length} items.`);
    return results.slice(0, limit);
  }
}

export const searchService = new SearchService();
