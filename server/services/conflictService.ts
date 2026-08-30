import { Evidence, ConflictItem, ConflictSeverity, ResearchCategory } from '../types';
import { db } from '../db/store';
import { logger } from '../utils/logger';

export const conflictService = {
  /**
   * Scans evidence from a research job and identifies conflicting claims across sources
   */
  detectConflicts(jobId: string, workspaceId: string, evidenceList: Evidence[]): ConflictItem[] {
    const detected: ConflictItem[] = [];

    // Group evidence by category
    const byCategory = new Map<ResearchCategory, Evidence[]>();
    for (const item of evidenceList) {
      if (!byCategory.has(item.category)) {
        byCategory.set(item.category, []);
      }
      byCategory.get(item.category)!.push(item);
    }

    // Check Pricing conflicts
    const pricingItems = byCategory.get('Pricing') || [];
    if (pricingItems.length >= 2) {
      // Look for distinct dollar figures or free vs paid discrepancies
      const distinctPrices: { price: string; evidence: Evidence }[] = [];

      for (const p of pricingItems) {
        const match = p.claim.match(/\$(\d+(?:\.\d{2})?)/);
        if (match) {
          const val = match[1];
          // Check if we already have this exact price or a different one
          if (!distinctPrices.some(dp => dp.price === val)) {
            distinctPrices.push({ price: val, evidence: p });
          }
        }
      }

      if (distinctPrices.length >= 2) {
        const conflict: ConflictItem = {
          id: `conf_${Date.now()}_pricing`,
          researchJobId: jobId,
          workspaceId,
          category: 'Pricing',
          description: `Discrepancy in advertised pricing across sources ($${distinctPrices[0].price} vs $${distinctPrices[1].price}).`,
          severity: 'HIGH',
          status: 'UNRESOLVED',
          conflictingValues: distinctPrices.map(dp => ({
            sourceId: dp.evidence.sourceId,
            sourceUrl: dp.evidence.sourceUrl,
            sourceTitle: dp.evidence.sourceTitle,
            value: `$${dp.price} (${dp.evidence.claim})`,
            evidenceId: dp.evidence.id,
          })),
          detectedAt: new Date().toISOString(),
        };
        detected.push(conflict);
      }

      // Check Free Tier contradiction
      const hasFreeClaim = pricingItems.find(p => /free\s*(plan|tier|trial|forever)/i.test(p.claim));
      const hasNoFreeClaim = pricingItems.find(p => /no\s*free|paid\s*only|credit\s*card\s*required/i.test(p.claim));

      if (hasFreeClaim && hasNoFreeClaim && hasFreeClaim.sourceId !== hasNoFreeClaim.sourceId) {
        const conflict: ConflictItem = {
          id: `conf_${Date.now()}_freetier`,
          researchJobId: jobId,
          workspaceId,
          category: 'Pricing',
          description: 'Contradiction regarding free plan availability between analyzed sources.',
          severity: 'MEDIUM',
          status: 'UNRESOLVED',
          conflictingValues: [
            {
              sourceId: hasFreeClaim.sourceId,
              sourceUrl: hasFreeClaim.sourceUrl,
              sourceTitle: hasFreeClaim.sourceTitle,
              value: hasFreeClaim.claim,
              evidenceId: hasFreeClaim.id,
            },
            {
              sourceId: hasNoFreeClaim.sourceId,
              sourceUrl: hasNoFreeClaim.sourceUrl,
              sourceTitle: hasNoFreeClaim.sourceTitle,
              value: hasNoFreeClaim.claim,
              evidenceId: hasNoFreeClaim.id,
            },
          ],
          detectedAt: new Date().toISOString(),
        };
        detected.push(conflict);
      }
    }

    // Save detected conflicts to database store
    for (const c of detected) {
      db.saveConflict(c);
      db.recordAudit({
        workspaceId,
        researchJobId: jobId,
        eventType: 'conflict_detected',
        summary: `Conflict detected in ${c.category}: ${c.description}`,
        details: { conflictId: c.id, severity: c.severity },
      });
    }

    logger.info(`Conflict detection completed for job ${jobId}. Found ${detected.length} conflict(s).`);
    return detected;
  },

  resolveConflict(conflictId: string, status: 'HUMAN_VERIFIED' | 'DISMISSED', resolutionNotes: string): ConflictItem | null {
    const all = Array.from((db as any).conflicts.values()) as ConflictItem[];
    const target = all.find(c => c.id === conflictId);
    if (!target) return null;

    target.status = status;
    target.resolutionNotes = resolutionNotes;
    target.resolvedAt = new Date().toISOString();
    db.updateConflict(target);

    db.recordAudit({
      workspaceId: target.workspaceId,
      researchJobId: target.researchJobId,
      eventType: 'conflict_detected',
      summary: `Conflict ${conflictId} resolved by user as ${status}.`,
      details: { resolutionNotes },
    });

    return target;
  },
};
