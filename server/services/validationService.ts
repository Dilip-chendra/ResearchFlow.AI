import {
  ResearchJob,
  ResearchSource,
  Evidence,
  CampaignBrief,
  CampaignAsset,
  ValidationReport,
  ValidationIssue
} from '../types';

export const validationService = {
  validateInput(input: {
    businessName: string;
    businessDescription: string;
    campaignObjective: string;
    targetAudience: string;
    competitorUrls: string[];
    additionalUrls?: string[];
  }): ValidationReport {
    const issues: ValidationIssue[] = [];

    if (!input.businessName || input.businessName.trim().length < 2) {
      issues.push({
        stage: 'INPUT',
        severity: 'CRITICAL',
        field: 'businessName',
        message: 'Business/Product name is required (at least 2 characters).',
        remedy: 'Enter your brand or product name.',
      });
    }

    if (!input.businessDescription || input.businessDescription.trim().length < 10) {
      issues.push({
        stage: 'INPUT',
        severity: 'CRITICAL',
        field: 'businessDescription',
        message: 'Business description must provide sufficient context (minimum 10 characters).',
        remedy: 'Briefly describe your value proposition and core offering.',
      });
    }

    if (!input.campaignObjective || input.campaignObjective.trim().length < 5) {
      issues.push({
        stage: 'INPUT',
        severity: 'CRITICAL',
        field: 'campaignObjective',
        message: 'Campaign objective is required.',
        remedy: 'Specify your strategic goal (e.g., student acquisition, lead generation).',
      });
    }

    if (!input.targetAudience || input.targetAudience.trim().length < 3) {
      issues.push({
        stage: 'INPUT',
        severity: 'CRITICAL',
        field: 'targetAudience',
        message: 'Target audience must be specified.',
        remedy: 'Define who this campaign is intended to reach.',
      });
    }

    const allUrls = [...input.competitorUrls, ...(input.additionalUrls || [])];
    if (allUrls.length === 0) {
      issues.push({
        stage: 'INPUT',
        severity: 'CRITICAL',
        field: 'competitorUrls',
        message: 'At least one competitor or research URL must be provided.',
        remedy: 'Add at least one valid public website URL.',
      });
    } else {
      for (const u of allUrls) {
        try {
          const parsed = new URL(u);
          if (!['http:', 'https:'].includes(parsed.protocol)) {
            issues.push({
              stage: 'INPUT',
              severity: 'CRITICAL',
              field: 'urls',
              message: `URL "${u}" has invalid protocol. Only HTTP and HTTPS are allowed.`,
            });
          }
        } catch {
          issues.push({
            stage: 'INPUT',
            severity: 'CRITICAL',
            field: 'urls',
            message: `URL "${u}" is not a valid web address.`,
            remedy: 'Ensure the URL starts with https:// or http://',
          });
        }
      }
    }

    const hasCritical = issues.some(i => i.severity === 'CRITICAL');
    return {
      isValid: !hasCritical,
      score: hasCritical ? 0 : Math.max(100 - issues.length * 10, 70),
      issues,
      validatedAt: new Date().toISOString(),
    };
  },

  validateEvidence(evidenceList: Evidence[]): ValidationReport {
    const issues: ValidationIssue[] = [];

    if (evidenceList.length === 0) {
      issues.push({
        stage: 'EVIDENCE',
        severity: 'CRITICAL',
        message: 'No evidence could be extracted from the provided sources.',
        remedy: 'Verify that the sources are accessible and contain readable text.',
      });
    }

    for (const e of evidenceList) {
      if (!e.claim || e.claim.trim().length < 5) {
        issues.push({
          stage: 'EVIDENCE',
          severity: 'WARNING',
          message: `Evidence item #${e.id} has an incomplete claim statement.`,
        });
      }
      if (!e.sourceUrl) {
        issues.push({
          stage: 'EVIDENCE',
          severity: 'CRITICAL',
          message: `Evidence item #${e.id} is missing a source URL reference.`,
        });
      }
    }

    const hasCritical = issues.some(i => i.severity === 'CRITICAL');
    return {
      isValid: !hasCritical,
      score: hasCritical ? 20 : Math.max(100 - issues.length * 5, 80),
      issues,
      validatedAt: new Date().toISOString(),
    };
  },

  validateCampaignBrief(brief: CampaignBrief, availableEvidence: Evidence[]): ValidationReport {
    const issues: ValidationIssue[] = [];
    const validEvidenceIds = new Set(availableEvidence.map(e => e.id));

    if (!brief.positioning || brief.positioning.trim().length < 10) {
      issues.push({
        stage: 'CAMPAIGN',
        severity: 'CRITICAL',
        field: 'positioning',
        message: 'Campaign brief lacks a clear positioning statement.',
      });
    }

    if (!brief.primaryMessage || brief.primaryMessage.trim().length < 10) {
      issues.push({
        stage: 'CAMPAIGN',
        severity: 'CRITICAL',
        field: 'primaryMessage',
        message: 'Primary campaign message is missing or too brief.',
      });
    }

    if (!brief.evidenceReferences || brief.evidenceReferences.length === 0) {
      issues.push({
        stage: 'CAMPAIGN',
        severity: 'CRITICAL',
        field: 'evidenceReferences',
        message: 'Campaign brief fails traceability test: zero evidence citations linked.',
        remedy: 'Link recommendations back to verified evidence items.',
      });
    } else {
      // Check if evidence references actually exist
      for (const ref of brief.evidenceReferences) {
        if (!validEvidenceIds.has(ref.evidenceId)) {
          issues.push({
            stage: 'CAMPAIGN',
            severity: 'WARNING',
            message: `Evidence reference ID "${ref.evidenceId}" does not match any current job evidence record.`,
          });
        }
      }
    }

    const hasCritical = issues.some(i => i.severity === 'CRITICAL');
    return {
      isValid: !hasCritical,
      score: hasCritical ? 30 : Math.max(100 - issues.length * 8, 85),
      issues,
      validatedAt: new Date().toISOString(),
    };
  },
};
