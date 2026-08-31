import {
  AIOrchestrationOptions,
  OrchestrationResult,
  AIProviderResponse
} from './types';
import {
  AITaskType,
  AIRun,
  AIHealthStatus,
  AIRoutingMode,
  FailureCategory,
  ModelCapabilityProfile
} from '../../src/types/index';
import { openRouterProvider } from './providers/openrouterProvider';
import { geminiProvider } from './providers/geminiProvider';
import { freeModelRegistry } from './openrouter/registry';
import { openRouterCatalog } from './openrouter/catalog';
import { injectionDefense } from './security/injectionDefense';
import { db } from '../db/store';
import { logger } from '../utils/logger';

export class AIOrchestrator {
  private routingMode: AIRoutingMode = 'BALANCED';
  private testMode: {
    failureInjectionEnabled: boolean;
    simulatedFailureType?: FailureCategory;
  } = {
    failureInjectionEnabled: false,
  };

  constructor() {
    // Initial catalog sync in background
    setTimeout(() => {
      this.syncCatalog().catch(err => logger.warn('Initial OpenRouter catalog sync failed:', err));
    }, 1000);
  }

  public getRoutingMode(): AIRoutingMode {
    return this.routingMode;
  }

  public setRoutingMode(mode: AIRoutingMode): void {
    this.routingMode = mode;
    logger.info(`AI Orchestration routing mode updated to: ${mode}`);
  }

  public setTestMode(enabled: boolean, failureType?: FailureCategory): void {
    this.testMode = {
      failureInjectionEnabled: enabled,
      simulatedFailureType: failureType,
    };
    logger.info(`AI Test failure injection mode: ${enabled ? `ENABLED (${failureType || 'RATE_LIMIT'})` : 'DISABLED'}`);
  }

  public getTestMode() {
    return { ...this.testMode };
  }

  public async syncCatalog(): Promise<ModelCapabilityProfile[]> {
    const models = await openRouterCatalog.fetchAndSyncCatalog(process.env.OPENROUTER_API_KEY);
    freeModelRegistry.updateCatalog(models);
    return freeModelRegistry.getAllModels();
  }

  public getHealthStatus(): AIHealthStatus {
    const models = freeModelRegistry.getAllModels();
    const freeModels = models.filter(m => m.free);
    const healthyFreeModels = freeModels.filter(m => m.health === 'HEALTHY');
    const quarantinedModels = models.filter(m => m.health === 'QUARANTINED');

    const openRouterConfigured = openRouterProvider.isConfigured();
    const geminiConfigured = geminiProvider.isConfigured();

    let openRouterStatus: 'CONNECTED' | 'DEGRADED' | 'OFFLINE' | 'UNCONFIGURED' = 'UNCONFIGURED';
    if (openRouterConfigured) {
      openRouterStatus = healthyFreeModels.length > 0 ? 'CONNECTED' : 'DEGRADED';
    }

    let geminiStatus: 'CONNECTED' | 'DEGRADED' | 'OFFLINE' | 'UNCONFIGURED' = 'UNCONFIGURED';
    if (geminiConfigured) {
      geminiStatus = 'CONNECTED';
    }

    let overallStatus: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' = 'OFFLINE';
    if (openRouterStatus === 'CONNECTED' || geminiStatus === 'CONNECTED') {
      overallStatus = (openRouterStatus === 'CONNECTED' && geminiStatus === 'CONNECTED') ? 'HEALTHY' : 'DEGRADED';
    }

    const recentRuns = db.listAIRuns(undefined, 25);

    return {
      overallStatus,
      openRouterStatus,
      geminiStatus,
      routingMode: this.routingMode,
      freeModelCount: freeModels.length,
      healthyFreeModelCount: healthyFreeModels.length,
      quarantinedModelCount: quarantinedModels.length,
      lastCatalogSync: openRouterCatalog.getLastSyncTime(),
      models,
      recentRuns,
      testMode: this.testMode,
    };
  }

  /**
   * Main unified structured orchestration pipeline with multi-model fallback chain.
   */
  public async orchestrateStructured<T>(
    options: AIOrchestrationOptions,
    heuristicFallback: (prompt: string) => T
  ): Promise<OrchestrationResult<T>> {
    const startTime = Date.now();
    const workspaceId = options.workspaceId || 'ws_default_prod';

    // 1. Build prompt with context budgeting and injection defense
    const budgeted = injectionDefense.budgetPrompt(
      options.systemInstruction || 'You are an expert market intelligence and campaign strategist.',
      options.prompt,
      options.untrustedWebData,
      12000
    );

    // 2. Determine Candidate Model Chain
    const candidateChain = this.buildCandidateChain(options);
    const fallbackChainUsed: string[] = [];
    let lastError: string | undefined;
    let successfulData: T | null = null;
    let usedModel = 'heuristic';
    let usedProvider: 'openrouter' | 'gemini' | 'heuristic' = 'heuristic';
    let attemptsCount = 0;
    let validationStatus: 'VALID' | 'WARNING' | 'REPAIRED' | 'INVALID' = 'VALID';
    let inputTokens = 0;
    let outputTokens = 0;

    db.recordAudit({
      workspaceId,
      eventType: 'ai_routing_started',
      summary: `AI routing initiated for task ${options.taskType} across candidate chain [${candidateChain.slice(0, 3).join(', ')}...]`,
      details: { taskType: options.taskType, mode: this.routingMode, candidates: candidateChain },
    });

    // 3. Iterate through candidate chain
    for (let i = 0; i < candidateChain.length; i++) {
      const modelId = candidateChain[i];
      attemptsCount++;
      fallbackChainUsed.push(modelId);

      // Check test failure injection simulation for the first attempt if active
      if (this.testMode.failureInjectionEnabled && i === 0) {
        const failureCategory = this.testMode.simulatedFailureType || 'RATE_LIMIT';
        logger.info(`[SIMULATION TEST] Injected failure ${failureCategory} on model ${modelId}`);
        lastError = `Simulated failure injection: ${failureCategory}`;
        db.recordAudit({
          workspaceId,
          eventType: 'ai_model_failed',
          summary: `Simulated failure on model ${modelId} (${failureCategory}). Tripping fallback.`,
          details: { model: modelId, failureCategory, isSimulation: true },
        });
        continue;
      }

      const isGeminiModel = modelId.startsWith('gemini') || modelId.includes('gemini-');
      const isOpenRouterModel = !isGeminiModel && modelId !== 'heuristic';

      try {
        let res: AIProviderResponse<T>;

        if (isOpenRouterModel && openRouterProvider.isConfigured()) {
          res = await openRouterProvider.generateStructured<T>(modelId, {
            taskType: options.taskType,
            prompt: budgeted.finalUserPrompt,
            systemInstruction: budgeted.systemPrompt,
            schema: options.schema,
            temperature: options.temperature ?? 0.2,
            workspaceId,
            timeoutMs: options.timeoutPerModelMs || 22000,
          });
        } else if (isGeminiModel && geminiProvider.isConfigured()) {
          res = await geminiProvider.generateStructured<T>(modelId, {
            taskType: options.taskType,
            prompt: budgeted.finalUserPrompt,
            systemInstruction: budgeted.systemPrompt,
            schema: options.schema,
            temperature: options.temperature ?? 0.2,
            workspaceId,
            timeoutMs: options.timeoutPerModelMs || 22000,
          });
        } else {
          // Provider not configured, skip
          continue;
        }

        if (res.success && res.structuredData) {
          // Validate schema compliance
          const validated = this.validateStructuredOutput<T>(res.structuredData, options.taskType);
          if (validated.isValid) {
            successfulData = validated.data;
            usedModel = modelId;
            usedProvider = isOpenRouterModel ? 'openrouter' : 'gemini';
            validationStatus = res.repaired ? 'REPAIRED' : 'VALID';
            inputTokens = res.inputTokens || 0;
            outputTokens = res.outputTokens || 0;

            if (i > 0) {
              db.recordAudit({
                workspaceId,
                eventType: 'ai_fallback',
                summary: `Fallback successful on attempt ${i + 1} using ${usedProvider} (${modelId})`,
                details: { model: modelId, attempts: i + 1, taskType: options.taskType },
              });
            }

            break;
          } else {
            logger.warn(`Model ${modelId} returned incomplete schema for ${options.taskType}: ${validated.missingFields.join(', ')}`);
            lastError = `Schema validation failed: missing ${validated.missingFields.join(', ')}`;
          }
        } else {
          lastError = res.errorMessage || `Model ${modelId} failed with category ${res.failureCategory || 'UNKNOWN'}`;
          db.recordAudit({
            workspaceId,
            eventType: 'ai_model_failed',
            summary: `AI model ${modelId} failed for task ${options.taskType}: ${lastError}`,
            details: { model: modelId, error: lastError, failureCategory: res.failureCategory },
          });
        }
      } catch (err: any) {
        lastError = err.message;
        logger.warn(`Exception during AI model execution (${modelId}):`, err);
      }
    }

    // 4. If all AI models failed, use verified heuristic fallback
    if (!successfulData) {
      logger.info(`All candidate AI models failed for task ${options.taskType}. Activating heuristic fallback.`);
      successfulData = heuristicFallback(options.prompt);
      usedModel = 'heuristic-engine-v2';
      usedProvider = 'heuristic';
      validationStatus = 'REPAIRED';

      db.recordAudit({
        workspaceId,
        eventType: 'ai_repair',
        summary: `Activated heuristic synthesis fallback for task ${options.taskType} after ${candidateChain.length} model attempts.`,
        details: { lastError, fallbackChainUsed },
      });
    }

    const totalLatencyMs = Date.now() - startTime;
    const fallbackUsed = fallbackChainUsed.length > 1 || usedProvider === 'heuristic';

    // 5. Record persistent AIRun
    const runRecord: AIRun = {
      id: `airun_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      workspaceId,
      taskType: options.taskType,
      provider: usedProvider,
      model: usedModel,
      attempt: attemptsCount,
      status: usedProvider === 'heuristic' ? 'REPAIRED' : (fallbackUsed ? 'FALLBACK_SUCCESS' : 'SUCCESS'),
      latencyMs: totalLatencyMs,
      inputTokens,
      outputTokens,
      fallbackUsed,
      fallbackChain: fallbackChainUsed,
      validationStatus,
      promptSummary: options.prompt.slice(0, 120),
      createdAt: new Date().toISOString(),
    };

    db.recordAIRun(runRecord);

    db.recordAudit({
      workspaceId,
      eventType: 'ai_run_completed',
      summary: `AI task ${options.taskType} completed with ${usedProvider}/${usedModel} in ${totalLatencyMs}ms (Status: ${runRecord.status})`,
      details: { runId: runRecord.id, provider: usedProvider, model: usedModel, latencyMs: totalLatencyMs },
    });

    return {
      success: true,
      data: successfulData,
      usedModel,
      usedProvider,
      fallbackChainUsed,
      fallbackUsed,
      totalLatencyMs,
      attemptsCount,
      runRecord,
      error: lastError,
    };
  }

  private buildCandidateChain(options: AIOrchestrationOptions): string[] {
    if (options.customFallbackModels && options.customFallbackModels.length > 0) {
      return options.customFallbackModels;
    }

    const chain: string[] = [];
    const hasGemini = geminiProvider.isConfigured();
    const hasOpenRouter = openRouterProvider.isConfigured();

    if (this.routingMode === 'BALANCED') {
      if (hasGemini) {
        chain.push('gemini-3.6-flash');
      }
      if (hasOpenRouter) {
        const freeModels = freeModelRegistry.getCandidateChainForTask(options.taskType, options.preferredModel);
        chain.push(...freeModels.slice(0, 3));
      }
      if (hasGemini && !chain.includes('gemini-3.7-flash')) {
        chain.push('gemini-3.7-flash');
      }
    } else if (this.routingMode === 'FREE_ONLY') {
      if (hasOpenRouter) {
        const freeModels = freeModelRegistry.getCandidateChainForTask(options.taskType, options.preferredModel);
        chain.push(...freeModels.slice(0, 3));
      }
      if (hasGemini) {
        chain.push('gemini-3.6-flash', 'gemini-3.7-flash');
      }
    } else {
      if (options.preferredModel) chain.push(options.preferredModel);
      if (hasGemini) chain.push('gemini-3.6-flash');
      if (hasOpenRouter) chain.push('openrouter/free');
    }

    if (chain.length === 0) {
      chain.push('gemini-3.6-flash', 'openrouter/free');
    }

    return Array.from(new Set(chain));
  }

  private validateStructuredOutput<T>(data: any, taskType: AITaskType): { isValid: boolean; data: T; missingFields: string[] } {
    if (!data || typeof data !== 'object') {
      return { isValid: false, data: data as T, missingFields: ['root_object'] };
    }

    const missing: string[] = [];

    switch (taskType) {
      case 'RESEARCH_EXTRACTION':
        if (!Array.isArray(data) && !Array.isArray(data.evidence) && !Array.isArray(data.items)) {
          missing.push('evidence_array');
        }
        break;

      case 'INTELLIGENCE_SYNTHESIS':
        if (!data.positioningGaps && !data.findings) missing.push('positioningGaps/findings');
        if (!data.marketOpportunities) missing.push('marketOpportunities');
        break;

      case 'CAMPAIGN_STRATEGY':
        if (!data.campaignAngle) missing.push('campaignAngle');
        if (!data.targetPersona) missing.push('targetPersona');
        break;

      case 'CONTENT_GENERATION':
        if (!data.linkedin && !data.email && !data.seo) missing.push('channel_content');
        break;

      default:
        break;
    }

    const isValid = missing.length === 0;
    return { isValid, data: data as T, missingFields: missing };
  }
}

export const aiOrchestrator = new AIOrchestrator();
