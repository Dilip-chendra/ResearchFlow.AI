import { Request, Response, NextFunction } from 'express';
import { db } from '../db/store';
import { getPlanById, DEFAULT_PLANS } from './planCatalog';
import { SubscriptionPlan, UserSubscription, QuotaUsageRecord } from '../types';
import { logger } from '../utils/logger';

export type EntitlementFeature =
  | 'RESEARCH_RUN'
  | 'CRAWL_PAGE'
  | 'AI_TOKENS'
  | 'WAR_ROOM'
  | 'EXPORT_REPORT'
  | 'BYOK_ACCESS';

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: string;
  feature: EntitlementFeature;
  currentUsage: number;
  limit: number;
  planId: string;
  planName: string;
  tier: string;
  aiMode: string;
}

export class EntitlementEngine {
  /**
   * Retrieves effective plan for a workspace. Falls back to Free Community if plan not found.
   */
  public getEffectivePlan(workspaceId: string): { subscription: UserSubscription; plan: SubscriptionPlan } {
    const subscription = db.getSubscription(workspaceId);
    let plan = getPlanById(subscription.planId);
    if (!plan) {
      plan = DEFAULT_PLANS[0]; // Free tier
    }
    return { subscription, plan };
  }

  /**
   * Evaluates whether a workspace can perform an action based on its subscription & quotas.
   */
  public check(workspaceId: string, feature: EntitlementFeature, count: number = 1): EntitlementCheckResult {
    const { subscription, plan } = this.getEffectivePlan(workspaceId);
    const usage = db.getQuotaUsage(workspaceId);

    // If subscription is canceled, unpaid or past due, check if within grace or restrict
    if (subscription.status === 'UNPAID' || subscription.status === 'EXPIRED') {
      return {
        allowed: false,
        reason: `Subscription is currently ${subscription.status.toLowerCase()}. Please update your payment method.`,
        feature,
        currentUsage: 0,
        limit: 0,
        planId: plan.id,
        planName: plan.name,
        tier: plan.tier,
        aiMode: plan.aiMode,
      };
    }

    switch (feature) {
      case 'RESEARCH_RUN': {
        const limit = plan.quotas.monthlyResearchRuns;
        const current = usage.researchRunsUsed;
        if (current + count > limit) {
          return {
            allowed: false,
            reason: `Monthly research runs limit reached (${current}/${limit}). Upgrade your plan to run more research jobs.`,
            feature,
            currentUsage: current,
            limit,
            planId: plan.id,
            planName: plan.name,
            tier: plan.tier,
            aiMode: plan.aiMode,
          };
        }
        return {
          allowed: true,
          feature,
          currentUsage: current,
          limit,
          planId: plan.id,
          planName: plan.name,
          tier: plan.tier,
          aiMode: plan.aiMode,
        };
      }

      case 'CRAWL_PAGE': {
        const limit = plan.quotas.monthlyCompetitorCrawls;
        const current = usage.competitorCrawlsUsed;
        if (current + count > limit) {
          return {
            allowed: false,
            reason: `Monthly competitor crawl limit reached (${current}/${limit} pages). Upgrade your plan for higher crawl capacity.`,
            feature,
            currentUsage: current,
            limit,
            planId: plan.id,
            planName: plan.name,
            tier: plan.tier,
            aiMode: plan.aiMode,
          };
        }
        return {
          allowed: true,
          feature,
          currentUsage: current,
          limit,
          planId: plan.id,
          planName: plan.name,
          tier: plan.tier,
          aiMode: plan.aiMode,
        };
      }

      case 'AI_TOKENS': {
        // If in BYOK mode, tokens are billed by user's direct provider account
        if (plan.aiMode === 'BYOK') {
          return {
            allowed: true,
            feature,
            currentUsage: usage.aiTokensUsed,
            limit: Infinity,
            planId: plan.id,
            planName: plan.name,
            tier: plan.tier,
            aiMode: plan.aiMode,
          };
        }

        const limit = plan.quotas.monthlyAITokens;
        const current = usage.aiTokensUsed;
        if (current + count > limit) {
          return {
            allowed: false,
            reason: `Monthly managed AI token budget reached (${current.toLocaleString()}/${limit.toLocaleString()} tokens). Upgrade or switch to BYOK.`,
            feature,
            currentUsage: current,
            limit,
            planId: plan.id,
            planName: plan.name,
            tier: plan.tier,
            aiMode: plan.aiMode,
          };
        }
        return {
          allowed: true,
          feature,
          currentUsage: current,
          limit,
          planId: plan.id,
          planName: plan.name,
          tier: plan.tier,
          aiMode: plan.aiMode,
        };
      }

      case 'WAR_ROOM': {
        if (!plan.quotas.warRoomAccess) {
          return {
            allowed: false,
            reason: 'Market War Room & Strategic Matrix is available on Starter, Pro, and Business tiers.',
            feature,
            currentUsage: 0,
            limit: 1,
            planId: plan.id,
            planName: plan.name,
            tier: plan.tier,
            aiMode: plan.aiMode,
          };
        }
        return {
          allowed: true,
          feature,
          currentUsage: 1,
          limit: 1,
          planId: plan.id,
          planName: plan.name,
          tier: plan.tier,
          aiMode: plan.aiMode,
        };
      }

      case 'EXPORT_REPORT': {
        if (!plan.quotas.exportReports) {
          return {
            allowed: false,
            reason: 'Full brief export is available on paid plans.',
            feature,
            currentUsage: 0,
            limit: 1,
            planId: plan.id,
            planName: plan.name,
            tier: plan.tier,
            aiMode: plan.aiMode,
          };
        }
        return {
          allowed: true,
          feature,
          currentUsage: 1,
          limit: 1,
          planId: plan.id,
          planName: plan.name,
          tier: plan.tier,
          aiMode: plan.aiMode,
        };
      }

      case 'BYOK_ACCESS': {
        if (!plan.quotas.byokAllowed) {
          return {
            allowed: false,
            reason: 'BYOK (Bring Your Own Key) is available on BYOK plans and the Free Community tier.',
            feature,
            currentUsage: 0,
            limit: 1,
            planId: plan.id,
            planName: plan.name,
            tier: plan.tier,
            aiMode: plan.aiMode,
          };
        }
        return {
          allowed: true,
          feature,
          currentUsage: 1,
          limit: 1,
          planId: plan.id,
          planName: plan.name,
          tier: plan.tier,
          aiMode: plan.aiMode,
        };
      }

      default:
        return {
          allowed: true,
          feature,
          currentUsage: 0,
          limit: 1,
          planId: plan.id,
          planName: plan.name,
          tier: plan.tier,
          aiMode: plan.aiMode,
        };
    }
  }

  /**
   * Atomically records usage against quota if permitted.
   */
  public consume(workspaceId: string, feature: 'RESEARCH_RUN' | 'CRAWL_PAGE' | 'AI_TOKENS', count: number = 1): boolean {
    const check = this.check(workspaceId, feature, count);
    if (!check.allowed) {
      logger.warn(`Entitlement check failed for workspace ${workspaceId}: ${check.reason}`);
      return false;
    }

    if (feature === 'RESEARCH_RUN') {
      db.recordQuotaUsage(workspaceId, { runs: count });
    } else if (feature === 'CRAWL_PAGE') {
      db.recordQuotaUsage(workspaceId, { crawls: count });
    } else if (feature === 'AI_TOKENS') {
      db.recordQuotaUsage(workspaceId, { tokens: count });
    }

    return true;
  }
}

export const entitlementEngine = new EntitlementEngine();

/**
 * Express middleware to enforce feature access and quota limits.
 */
export function requireEntitlement(feature: EntitlementFeature, count: number = 1) {
  return (req: Request, res: Response, next: NextFunction) => {
    const workspaceId =
      (req.headers['x-workspace-id'] as string) ||
      (req.query.workspaceId as string) ||
      (req.body?.workspaceId as string) ||
      'ws_default_prod';

    const result = entitlementEngine.check(workspaceId, feature, count);
    if (!result.allowed) {
      return res.status(402).json({
        error: 'Payment Required',
        code: 'ENTITLEMENT_LIMIT_EXCEEDED',
        message: result.reason,
        details: {
          feature: result.feature,
          currentUsage: result.currentUsage,
          limit: result.limit,
          planName: result.planName,
          tier: result.tier,
          upgradeUrl: '/settings?tab=billing',
        },
      });
    }

    next();
  };
}
