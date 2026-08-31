import {
  ResearchJob,
  ResearchSource,
  Evidence,
  JobStatus,
  IntelligenceReport,
  CampaignBrief,
  CampaignAsset,
  ExecutionTask,
  AuditEvent
} from '../types';
import { db } from '../db/store';
import { researchTool } from '../research/fetcher';
import { aiService } from '../ai/gemini';
import { conflictService } from './conflictService';
import { validationService } from './validationService';
import { logger } from '../utils/logger';

export interface CreateJobInput {
  businessName: string;
  businessDescription: string;
  campaignObjective: string;
  targetAudience: string;
  competitorUrls: string[];
  additionalUrls?: string[];
  isDemo?: boolean;
}

export const researchService = {
  createJob(input: CreateJobInput, workspaceId: string): ResearchJob {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const allUrls = [
      ...input.competitorUrls.filter(Boolean),
      ...(input.additionalUrls || []).filter(Boolean),
    ];

    // Deduplicate URLs
    const uniqueUrls = Array.from(new Set(allUrls));

    const job: ResearchJob = {
      id: jobId,
      workspaceId,
      businessName: input.businessName,
      businessDescription: input.businessDescription,
      campaignObjective: input.campaignObjective,
      targetAudience: input.targetAudience,
      competitorUrls: input.competitorUrls,
      additionalUrls: input.additionalUrls || [],
      status: 'queued',
      currentStepMessage: 'Job queued for research pipeline',
      progressPercent: 5,
      sourcesCount: uniqueUrls.length,
      evidenceCount: 0,
      conflictsCount: 0,
      isDemo: input.isDemo || false,
      createdAt: new Date().toISOString(),
    };

    db.saveResearchJob(job);

    // Initialize source placeholders
    uniqueUrls.forEach((url, idx) => {
      const source: ResearchSource = {
        id: `src_${jobId}_${idx + 1}`,
        jobId,
        workspaceId,
        url,
        title: url,
        status: 'pending',
        retrievedAt: new Date().toISOString(),
        isCompetitor: input.competitorUrls.includes(url),
      };
      db.saveSource(source);
    });

    db.recordAudit({
      workspaceId,
      researchJobId: jobId,
      eventType: 'research_created',
      summary: `Created research job for "${job.businessName}" with ${uniqueUrls.length} sources.`,
      details: { objective: job.campaignObjective },
    });

    return job;
  },

  async runJob(jobId: string, workspaceId: string): Promise<ResearchJob> {
    const job = db.getResearchJob(jobId, workspaceId) || db.getResearchJob(jobId);
    if (!job) throw new Error(`Research job ${jobId} not found in workspace.`);
    const resolvedWsId = job.workspaceId || workspaceId || 'ws_demo_sandbox';

    const startTime = Date.now();
    job.startedAt = new Date().toISOString();
    job.status = 'validating';
    job.currentStepMessage = 'Validating input parameters and target URLs...';
    job.progressPercent = 10;
    db.saveResearchJob(job);

    db.recordAudit({
      workspaceId: resolvedWsId,
      researchJobId: jobId,
      eventType: 'research_started',
      summary: `Started research pipeline execution for "${job.businessName}".`,
    });

    try {
      // 1. Validation of input
      const inputValidation = validationService.validateInput({
        businessName: job.businessName,
        businessDescription: job.businessDescription,
        campaignObjective: job.campaignObjective,
        targetAudience: job.targetAudience,
        competitorUrls: job.competitorUrls,
        additionalUrls: job.additionalUrls,
      });

      if (!inputValidation.isValid) {
        job.status = 'failed';
        job.currentStepMessage = `Input validation failed: ${inputValidation.issues[0]?.message}`;
        job.errorMessage = inputValidation.issues[0]?.message;
        db.saveResearchJob(job);
        db.recordAudit({
          workspaceId,
          researchJobId: jobId,
          eventType: 'validation_failed',
          summary: `Input validation failed for job ${jobId}`,
          details: { issues: inputValidation.issues },
        });
        return job;
      }

      // 2. Fetch and research sources
      job.status = 'researching';
      job.currentStepMessage = 'Browsing and extracting visible text from sources...';
      job.progressPercent = 25;
      db.saveResearchJob(job);

      const sources = db.listSources(jobId);
      const extractedEvidenceList: Evidence[] = [];
      let completedSourcesCount = 0;
      let failedSourcesCount = 0;

      for (let i = 0; i < sources.length; i++) {
        const src = sources[i];
        src.status = 'fetching';
        db.saveSource(src);

        db.recordAudit({
          workspaceId,
          researchJobId: jobId,
          eventType: 'source_started',
          summary: `Initiated research retrieval for ${src.url}`,
        });

        // Fetch source content with live search grounding context
        const businessContext = `${job.businessName}: ${job.businessDescription}. Objective: ${job.campaignObjective}`;
        const extracted = await researchTool.fetchUrl(src.url, businessContext);

        src.httpStatus = extracted.httpStatus;
        src.title = extracted.title || src.url;
        src.canonicalUrl = extracted.canonicalUrl;
        src.rawTextSnippet = extracted.rawTextSnippet;
        src.wordCount = extracted.wordCount;
        src.retrievedAt = new Date().toISOString();

        if (extracted.success) {
          src.status = 'completed';
          completedSourcesCount++;
          db.saveSource(src);

          db.recordAudit({
            workspaceId,
            researchJobId: jobId,
            eventType: 'source_completed',
            summary: `Successfully retrieved ${src.url} (${extracted.wordCount} words)`,
            details: { title: src.title, wordCount: src.wordCount },
          });

          // 3. Extract evidence from this source
          job.status = 'extracting';
          job.currentStepMessage = `Extracting structured claims and facts from ${src.title}...`;
          job.progressPercent = 30 + Math.round(((i + 1) / sources.length) * 20);
          db.saveResearchJob(job);

          const evidenceItems = await aiService.extractEvidence({
            sourceUrl: src.url,
            sourceTitle: src.title,
            rawText: extracted.rawTextSnippet,
            businessContext: `${job.businessName} - ${job.businessDescription}`,
          });

          for (const item of evidenceItems) {
            const ev: Evidence = {
              id: `ev_${jobId}_${extractedEvidenceList.length + 1}`,
              researchJobId: jobId,
              workspaceId,
              sourceId: src.id,
              category: item.category,
              claim: item.claim,
              supportingText: item.supportingText,
              sourceUrl: src.url,
              sourceTitle: src.title,
              retrievedAt: new Date().toISOString(),
              evidenceType: item.evidenceType,
              confidence: item.confidence,
              normalizedValue: item.normalizedValue,
            };
            db.saveEvidence(ev);
            extractedEvidenceList.push(ev);
          }
        } else {
          src.status = 'failed';
          src.failureReason = extracted.failureReason;
          src.errorMessage = extracted.errorMessage;
          failedSourcesCount++;
          db.saveSource(src);

          db.recordAudit({
            workspaceId,
            researchJobId: jobId,
            eventType: 'source_failed',
            summary: `Failed to retrieve ${src.url}: ${extracted.errorMessage}`,
            details: { failureReason: extracted.failureReason },
          });
        }
      }

      // If all sources failed completely
      if (completedSourcesCount === 0) {
        job.status = 'failed';
        job.currentStepMessage = 'All research sources failed to return readable content.';
        job.errorMessage = 'Zero sources could be accessed. Check URLs and try again.';
        db.saveResearchJob(job);
        return job;
      }

      // 4. Normalize and detect conflicts
      job.status = 'normalizing';
      job.currentStepMessage = 'Normalizing evidence and detecting cross-source conflicts...';
      job.progressPercent = 55;
      job.evidenceCount = extractedEvidenceList.length;
      db.saveResearchJob(job);

      const conflicts = conflictService.detectConflicts(jobId, workspaceId, extractedEvidenceList);
      job.conflictsCount = conflicts.length;
      db.saveResearchJob(job);

      // 5. Synthesize Intelligence
      job.status = 'analyzing';
      job.currentStepMessage = 'Synthesizing competitive intelligence, positioning gaps, and opportunities...';
      job.progressPercent = 70;
      db.saveResearchJob(job);

      const intelData = await aiService.synthesizeIntelligence({
        businessName: job.businessName,
        businessDescription: job.businessDescription,
        campaignObjective: job.campaignObjective,
        targetAudience: job.targetAudience,
        evidenceList: extractedEvidenceList,
      });

      const intelReport: IntelligenceReport = {
        id: `intel_${jobId}`,
        researchJobId: jobId,
        workspaceId,
        ...intelData,
        generatedAt: new Date().toISOString(),
      };
      db.saveIntelligence(intelReport);
      job.intelligenceId = intelReport.id;

      db.recordAudit({
        workspaceId,
        researchJobId: jobId,
        eventType: 'intelligence_generated',
        summary: `Synthesized competitive intelligence with ${intelReport.findings.length} findings and ${intelReport.marketOpportunities.length} opportunities.`,
      });

      // 6. Generate Campaign Strategy Brief & Channel Drafts
      job.status = 'generating';
      job.currentStepMessage = 'Generating evidence-backed campaign strategy and channel drafts...';
      job.progressPercent = 85;
      db.saveResearchJob(job);

      const briefData = await aiService.generateCampaignStrategy({
        businessName: job.businessName,
        businessDescription: job.businessDescription,
        campaignObjective: job.campaignObjective,
        targetAudience: job.targetAudience,
        intelligence: intelData,
        evidenceList: extractedEvidenceList,
      });

      const campaignBrief: CampaignBrief = {
        id: `brief_${jobId}`,
        researchJobId: jobId,
        workspaceId,
        ...briefData,
        status: 'DRAFT',
        generatedAt: new Date().toISOString(),
      };
      db.saveCampaignBrief(campaignBrief);
      job.briefId = campaignBrief.id;

      const channelDrafts = await aiService.generateChannelDrafts({
        businessName: job.businessName,
        campaignBrief: briefData,
        evidenceList: extractedEvidenceList,
      });

      // Save LinkedIn Asset
      const linkedinAsset: CampaignAsset = {
        id: `asset_${jobId}_linkedin`,
        researchJobId: jobId,
        workspaceId,
        channel: 'LINKEDIN',
        title: 'LinkedIn Thought Leadership & Teardown Post',
        content: channelDrafts.linkedin,
        evidenceReferences: briefData.evidenceReferences.map(r => r.evidenceId),
        validationStatus: 'VALID',
        reviewStatus: 'PENDING',
      };
      db.saveCampaignAsset(linkedinAsset);

      // Save Email Asset
      const emailAsset: CampaignAsset = {
        id: `asset_${jobId}_email`,
        researchJobId: jobId,
        workspaceId,
        channel: 'EMAIL',
        title: 'Cold Outreach & Nurture Sequence (ATS Calibrated)',
        content: channelDrafts.email,
        evidenceReferences: briefData.evidenceReferences.map(r => r.evidenceId),
        validationStatus: 'VALID',
        reviewStatus: 'PENDING',
      };
      db.saveCampaignAsset(emailAsset);

      // Save SEO Asset
      const seoAsset: CampaignAsset = {
        id: `asset_${jobId}_seo`,
        researchJobId: jobId,
        workspaceId,
        channel: 'SEO',
        title: 'Long-Tail Comparison & High-Intent Guide',
        content: channelDrafts.seo,
        evidenceReferences: briefData.evidenceReferences.map(r => r.evidenceId),
        validationStatus: 'VALID',
        reviewStatus: 'PENDING',
      };
      db.saveCampaignAsset(seoAsset);

      db.recordAudit({
        workspaceId,
        researchJobId: jobId,
        eventType: 'campaign_generated',
        summary: `Generated Campaign Brief and 3 Channel Drafts (LinkedIn, Email, SEO).`,
      });

      // 7. Validate output
      job.status = 'validating_output';
      job.currentStepMessage = 'Validating campaign outputs against evidence traceability rules...';
      job.progressPercent = 95;
      db.saveResearchJob(job);

      const briefValidation = validationService.validateCampaignBrief(campaignBrief, extractedEvidenceList);

      // 8. Ready for Human Review
      const durationMs = Date.now() - startTime;
      job.durationMs = durationMs;
      job.completedAt = new Date().toISOString();
      job.progressPercent = 100;

      if (failedSourcesCount > 0 && completedSourcesCount > 0) {
        job.status = 'partial';
        job.currentStepMessage = `Research completed with ${completedSourcesCount} source(s) verified and ${failedSourcesCount} failed. Ready for human review.`;
      } else {
        job.status = 'awaiting_review';
        job.currentStepMessage = 'Research & strategy pipeline complete. Awaiting human review & approval.';
      }

      db.saveResearchJob(job);

      db.recordAudit({
        workspaceId,
        researchJobId: jobId,
        eventType: 'review_started',
        summary: `Campaign brief ready for human approval (Duration: ${(durationMs / 1000).toFixed(1)}s)`,
        details: { briefId: campaignBrief.id, validationScore: briefValidation.score },
      });

      return job;
    } catch (err: any) {
      logger.error(`Error in runJob for ${jobId}:`, err);
      job.status = 'failed';
      job.currentStepMessage = `Job encountered an unexpected error: ${err.message}`;
      job.errorMessage = err.message;
      db.saveResearchJob(job);
      return job;
    }
  },

  approveJob(jobId: string, workspaceId: string, reviewNotes?: string, approvedBy = 'Alex Chen'): ResearchJob {
    const job = db.getResearchJob(jobId, workspaceId) || db.getResearchJob(jobId);
    if (!job) throw new Error('Job not found');
    const resolvedWsId = job.workspaceId || workspaceId || 'ws_demo_sandbox';

    const brief = db.getCampaignBriefByJobId(jobId);
    if (brief) {
      brief.status = 'APPROVED';
      brief.reviewNotes = reviewNotes;
      brief.approvedAt = new Date().toISOString();
      brief.approvedBy = approvedBy;
      db.saveCampaignBrief(brief);
    }

    job.status = 'approved';
    job.currentStepMessage = 'Campaign approved by human operator. Execution tasks generated.';
    db.saveResearchJob(job);

    // Generate actionable Execution Tasks
    const tasks: ExecutionTask[] = [
      {
        id: `task_${jobId}_1`,
        researchJobId: jobId,
        workspaceId: resolvedWsId,
        title: 'Verify & align landing page positioning',
        description: `Update landing page hero copy to reflect: "${brief?.campaignAngle || 'Evidence-backed value proposition'}"`,
        priority: 'URGENT',
        category: 'POSITIONING',
        status: 'PENDING',
        reason: 'Align top-of-funnel traffic with verified campaign positioning.',
        evidenceReference: brief?.evidenceReferences[0]?.claim,
        createdAt: new Date().toISOString(),
      },
      {
        id: `task_${jobId}_2`,
        researchJobId: jobId,
        workspaceId: resolvedWsId,
        title: 'Review and schedule LinkedIn teardown post',
        description: 'Review the generated LinkedIn copy, insert customer testimonial or ATS screenshots, and schedule.',
        priority: 'HIGH',
        category: 'CONTENT',
        status: 'PENDING',
        reason: 'Lead top-of-funnel acquisition with evidence teardown.',
        createdAt: new Date().toISOString(),
      },
      {
        id: `task_${jobId}_3`,
        researchJobId: jobId,
        workspaceId: resolvedWsId,
        title: 'Set up Cold/Nurture email sequence in sending tool',
        description: 'Load email draft into outreach software and set recipient list to junior tech talent.',
        priority: 'MEDIUM',
        category: 'DISTRIBUTION',
        status: 'PENDING',
        reason: 'Direct outbound conversion channel.',
        createdAt: new Date().toISOString(),
      },
      {
        id: `task_${jobId}_4`,
        researchJobId: jobId,
        workspaceId: resolvedWsId,
        title: 'Publish SEO Pillar outline & comparison table',
        description: 'Draft the long-form comparison guide addressing competitor pricing and transparency gaps.',
        priority: 'LOW',
        category: 'CONTENT',
        status: 'PENDING',
        reason: 'Capture high-intent organic search traffic.',
        createdAt: new Date().toISOString(),
      },
    ];

    // If there were unresolved conflicts, add a verification task
    const conflicts = db.listConflicts(jobId).filter(c => c.status === 'UNRESOLVED');
    if (conflicts.length > 0) {
      tasks.unshift({
        id: `task_${jobId}_conflict`,
        researchJobId: jobId,
        workspaceId: resolvedWsId,
        title: `Manually verify ${conflicts.length} competitor data conflict(s)`,
        description: `Resolve flagged discrepancy in ${conflicts[0].category}: ${conflicts[0].description}`,
        priority: 'URGENT',
        category: 'VERIFICATION',
        status: 'PENDING',
        reason: 'Ensure zero inaccurate competitor claims are published.',
        createdAt: new Date().toISOString(),
      });
    }

    for (const t of tasks) {
      db.saveTask(t);
      db.recordAudit({
        workspaceId: resolvedWsId,
        researchJobId: jobId,
        eventType: 'task_created',
        summary: `Created execution task: ${t.title}`,
        details: { priority: t.priority, category: t.category },
      });
    }

    db.recordAudit({
      workspaceId: resolvedWsId,
      researchJobId: jobId,
      eventType: 'approved',
      summary: `Research job ${jobId} approved by ${approvedBy}. Generated ${tasks.length} execution tasks.`,
      details: { reviewNotes },
    });

    return job;
  },

  rejectJob(jobId: string, workspaceId: string, reason: string): ResearchJob {
    const job = db.getResearchJob(jobId, workspaceId) || db.getResearchJob(jobId);
    if (!job) throw new Error('Job not found');
    const resolvedWsId = job.workspaceId || workspaceId || 'ws_demo_sandbox';

    const brief = db.getCampaignBriefByJobId(jobId);
    if (brief) {
      brief.status = 'REJECTED';
      brief.reviewNotes = reason;
      db.saveCampaignBrief(brief);
    }

    job.status = 'rejected';
    job.currentStepMessage = `Campaign rejected: ${reason}`;
    db.saveResearchJob(job);

    db.recordAudit({
      workspaceId: resolvedWsId,
      researchJobId: jobId,
      eventType: 'rejected',
      summary: `Research job ${jobId} rejected by operator: ${reason}`,
    });

    return job;
  },

  editCampaignBrief(jobId: string, workspaceId: string, updates: Partial<CampaignBrief>): CampaignBrief {
    const brief = db.getCampaignBriefByJobId(jobId);
    if (!brief || brief.workspaceId !== workspaceId) throw new Error('Brief not found');

    const updated = { ...brief, ...updates };
    db.saveCampaignBrief(updated);

    db.recordAudit({
      workspaceId,
      researchJobId: jobId,
      eventType: 'campaign_generated',
      summary: `Campaign brief manually adjusted by user.`,
    });

    return updated;
  },
};
