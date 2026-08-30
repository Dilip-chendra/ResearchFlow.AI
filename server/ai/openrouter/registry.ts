import { AITaskType, ModelCapabilityProfile, ModelHealthStatus, FailureCategory } from '../../../src/types/index';
import { openRouterCatalog } from './catalog';
import { logger } from '../../utils/logger';

export class FreeModelRegistry {
  private models: Map<string, ModelCapabilityProfile> = new Map();
  private readonly QUARANTINE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_CONSECUTIVE_FAILURES = 3;

  constructor() {
    this.init();
  }

  public init(): void {
    const cached = openRouterCatalog.getCachedFreeModels();
    for (const m of cached) {
      this.models.set(m.id, { ...m });
    }
  }

  public getAllModels(): ModelCapabilityProfile[] {
    this.checkQuarantineExpirations();
    return Array.from(this.models.values());
  }

  public getModel(id: string): ModelCapabilityProfile | undefined {
    this.checkQuarantineExpirations();
    return this.models.get(id);
  }

  public updateCatalog(profiles: ModelCapabilityProfile[]): void {
    for (const p of profiles) {
      const existing = this.models.get(p.id);
      if (existing) {
        // preserve live health stats
        this.models.set(p.id, {
          ...p,
          health: existing.health,
          quarantinedUntil: existing.quarantinedUntil,
          consecutiveFailures: existing.consecutiveFailures,
          totalRequests: existing.totalRequests,
          totalSuccesses: existing.totalSuccesses,
          avgLatencyMs: existing.avgLatencyMs,
        });
      } else {
        this.models.set(p.id, { ...p });
      }
    }
  }

  /**
   * Automatically un-quarantines models once their quarantine duration expires.
   */
  private checkQuarantineExpirations(): void {
    const now = Date.now();
    for (const model of this.models.values()) {
      if (model.health === 'QUARANTINED' && model.quarantinedUntil) {
        const expires = new Date(model.quarantinedUntil).getTime();
        if (now >= expires) {
          logger.info(`Quarantine period expired for model ${model.id}. Restoring to HEALTHY for probing.`);
          model.health = 'HEALTHY';
          model.quarantinedUntil = undefined;
          model.consecutiveFailures = 0;
        }
      }
    }
  }

  /**
   * Records successful generation for a model.
   */
  public recordSuccess(modelId: string, latencyMs: number): void {
    let model = this.models.get(modelId);
    if (!model) {
      model = {
        id: modelId,
        name: modelId,
        provider: 'openrouter',
        contextWindow: 64000,
        supportsStructuredOutput: true,
        supportsJsonSchema: true,
        reasoningLevel: 'MEDIUM',
        free: true,
        health: 'HEALTHY',
        lastHealthCheck: new Date().toISOString(),
        consecutiveFailures: 0,
        totalRequests: 0,
        totalSuccesses: 0,
        avgLatencyMs: latencyMs,
        pricing: { prompt: 0, completion: 0 },
        strengths: ['dynamic'],
      };
      this.models.set(modelId, model);
    }

    model.health = 'HEALTHY';
    model.consecutiveFailures = 0;
    model.quarantinedUntil = undefined;
    model.totalRequests += 1;
    model.totalSuccesses += 1;
    model.lastHealthCheck = new Date().toISOString();
    model.avgLatencyMs = Math.round((model.avgLatencyMs * 0.8) + (latencyMs * 0.2));
  }

  /**
   * Records failure for a model and triggers quarantine if threshold reached.
   */
  public recordFailure(modelId: string, failureCategory: FailureCategory = 'UNKNOWN', reason?: string): void {
    let model = this.models.get(modelId);
    if (!model) return;

    model.totalRequests += 1;
    model.consecutiveFailures += 1;
    model.lastHealthCheck = new Date().toISOString();

    if (failureCategory === 'MODEL_UNAVAILABLE' || model.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
      model.health = 'QUARANTINED';
      model.quarantinedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min for unavailable
      logger.warn(`Model ${modelId} quarantined for 30 min due to ${failureCategory}. Reason: ${reason || 'N/A'}`);
    } else if (failureCategory === 'RATE_LIMIT') {
      // 5-minute temporary cool-off for rate-limited free models
      model.health = 'QUARANTINED';
      model.quarantinedUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      logger.warn(`Model ${modelId} temporarily cooled-down (5 min) due to upstream rate limit (429).`);
    } else {
      model.health = 'DEGRADED';
    }
  }

  /**
   * Resets quarantine and health for all or a specific model.
   */
  public resetModelHealth(modelId?: string): void {
    if (modelId) {
      const model = this.models.get(modelId);
      if (model) {
        model.health = 'HEALTHY';
        model.quarantinedUntil = undefined;
        model.consecutiveFailures = 0;
      }
    } else {
      for (const model of this.models.values()) {
        model.health = 'HEALTHY';
        model.quarantinedUntil = undefined;
        model.consecutiveFailures = 0;
      }
    }
  }

  /**
   * Selects task-aware candidate model chain for a given task type.
   */
  public getCandidateChainForTask(taskType: AITaskType, preferredModel?: string): string[] {
    this.checkQuarantineExpirations();

    const candidates: string[] = [];

    // If user or caller explicitly preferred a model, put it first if healthy
    if (preferredModel) {
      const pref = this.models.get(preferredModel);
      if (pref && pref.health !== 'QUARANTINED' && pref.health !== 'OFFLINE') {
        candidates.push(preferredModel);
      }
    }

    // Always ensure the official OpenRouter Free auto-router is candidate #1 or #2
    const autoRouter = this.models.get('openrouter/free');
    if (autoRouter && autoRouter.health !== 'QUARANTINED' && !candidates.includes('openrouter/free')) {
      candidates.push('openrouter/free');
    }

    const all = Array.from(this.models.values()).filter(
      m => m.health !== 'QUARANTINED' && m.health !== 'OFFLINE'
    );

    // Score and rank models based on task suitability
    const ranked = all.sort((a, b) => {
      const scoreA = this.calculateTaskScore(a, taskType);
      const scoreB = this.calculateTaskScore(b, taskType);
      return scoreB - scoreA;
    });

    for (const m of ranked) {
      if (!candidates.includes(m.id)) {
        candidates.push(m.id);
      }
      if (candidates.length >= 4) break;
    }

    // Ensure universal fallback 'openrouter/free' is always present
    if (!candidates.includes('openrouter/free')) {
      candidates.push('openrouter/free');
    }

    return candidates;
  }

  private calculateTaskScore(model: ModelCapabilityProfile, taskType: AITaskType): number {
    let score = 100;

    // Proven high-reliability free models receive priority
    const PROVEN_MODELS = [
      'openrouter/free',
      'google/gemini-2.0-flash-exp:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'mistralai/mistral-small-24b-instruct-2501:free',
      'qwen/qwen-2.5-coder-32b-instruct:free',
      'deepseek/deepseek-r1:free',
      'meta-llama/llama-3.2-3b-instruct:free',
    ];

    if (PROVEN_MODELS.includes(model.id)) {
      score += 60;
    }

    // Favor low latency and high success rate
    if (model.totalRequests > 0) {
      const successRate = model.totalSuccesses / model.totalRequests;
      score += successRate * 50;
    }
    if (model.avgLatencyMs < 1000) score += 20;

    switch (taskType) {
      case 'RESEARCH_EXTRACTION':
      case 'EVIDENCE_NORMALIZATION':
        if (model.strengths.includes('fast-extraction')) score += 40;
        if (model.strengths.includes('structured-output')) score += 30;
        if (model.contextWindow >= 64000) score += 20;
        break;

      case 'CONFLICT_ANALYSIS':
      case 'INTELLIGENCE_SYNTHESIS':
      case 'CAMPAIGN_STRATEGY':
      case 'EXECUTIVE_SUMMARY':
        if (model.reasoningLevel === 'HIGH') score += 50;
        if (model.strengths.includes('deep-reasoning')) score += 40;
        if (model.strengths.includes('synthesis')) score += 30;
        break;

      case 'CONTENT_GENERATION':
      case 'TASK_IDENTIFICATION':
        if (model.strengths.includes('content-generation')) score += 35;
        if (model.reasoningLevel === 'HIGH' || model.reasoningLevel === 'MEDIUM') score += 25;
        break;

      case 'STRUCTURED_REPAIR':
        if (model.strengths.includes('json-formatting')) score += 50;
        if (model.strengths.includes('structured-output')) score += 30;
        break;

      default:
        break;
    }

    if (model.health === 'DEGRADED') score -= 50;

    return score;
  }
}

export const freeModelRegistry = new FreeModelRegistry();
