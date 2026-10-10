import { db } from '../db/store';
import { aiOrchestrator } from './orchestrator';
import { openaiProvider } from './providers/openaiProvider';
import { anthropicProvider } from './providers/anthropicProvider';
import { geminiProvider } from './providers/geminiProvider';
import { openRouterProvider } from './providers/openrouterProvider';
import { encryptSecret, decryptSecret, maskApiKey } from './security/cryptoVault';
import { entitlementEngine } from '../billing/entitlementEngine';
import {
  AIProviderType,
  BYOKKeyRecord,
  BYOKPublicSummary,
  WorkspaceAIConfig,
  AIMode,
  AIRun,
} from '../types';
import { AIOrchestrationOptions, OrchestrationResult, AIProviderRequestOptions } from './types';
import { logger } from '../utils/logger';

export class AIGateway {
  /**
   * Resolves effective AI mode for a workspace.
   */
  public getEffectiveMode(workspaceId: string): AIMode {
    const sub = db.getSubscription(workspaceId);
    const config = db.getWorkspaceAIConfig(workspaceId);

    // If subscription is strictly BYOK, workspace must use BYOK
    if (sub.aiMode === 'BYOK') return 'BYOK';

    // If workspace config explicitly requested BYOK and has a key, allow BYOK
    if (config.mode === 'BYOK') return 'BYOK';

    return 'MANAGED';
  }

  /**
   * Tests an API key connection without persisting.
   */
  public async testConnection(
    provider: AIProviderType,
    apiKey: string,
    modelId?: string
  ): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      return { healthy: false, latencyMs: 0, error: 'API key cannot be empty' };
    }

    try {
      switch (provider) {
        case 'OPENAI':
          return await openaiProvider.healthCheck(trimmedKey, modelId || 'gpt-4o-mini');
        case 'ANTHROPIC':
          return await anthropicProvider.healthCheck(trimmedKey, modelId || 'claude-3-5-haiku-20241022');
        case 'GEMINI':
          return await geminiProvider.healthCheck(trimmedKey, modelId);
        case 'OPENROUTER':
          return await openRouterProvider.healthCheck(trimmedKey, modelId);
        default:
          return { healthy: false, latencyMs: 0, error: `Unsupported provider: ${provider}` };
      }
    } catch (err: any) {
      return { healthy: false, latencyMs: 0, error: err.message };
    }
  }

  /**
   * Encrypts and saves a BYOK key for a workspace.
   */
  public async saveKey(
    workspaceId: string,
    provider: AIProviderType,
    apiKey: string,
    preferredModel?: string
  ): Promise<BYOKPublicSummary> {
    const testResult = await this.testConnection(provider, apiKey, preferredModel);
    if (!testResult.healthy) {
      throw new Error(`Validation failed for ${provider}: ${testResult.error || 'Connection failed'}`);
    }

    const encryptedKey = encryptSecret(apiKey.trim());
    const keyMask = maskApiKey(apiKey.trim());

    const record: BYOKKeyRecord = {
      id: `byok_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      workspaceId,
      provider,
      encryptedKey,
      keyMask,
      preferredModel,
      isActive: true,
      isValidated: true,
      lastValidatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveBYOKKey(record);

    // Update workspace AI config to point to this provider
    db.updateWorkspaceAIConfig(workspaceId, {
      activeProvider: provider,
      activeModel: preferredModel,
      lastTestedAt: new Date().toISOString(),
    });

    logger.info(`BYOK key securely saved for workspace ${workspaceId}, provider ${provider}`);

    return {
      provider: record.provider,
      keyMask: record.keyMask,
      preferredModel: record.preferredModel,
      isActive: record.isActive,
      isValidated: record.isValidated,
      lastValidatedAt: record.lastValidatedAt,
    };
  }

  /**
   * Lists public summaries of all configured BYOK keys for a workspace.
   */
  public listKeys(workspaceId: string): BYOKPublicSummary[] {
    const keys = db.listBYOKKeys(workspaceId);
    return keys.map((k) => ({
      provider: k.provider,
      keyMask: k.keyMask,
      preferredModel: k.preferredModel,
      isActive: k.isActive,
      isValidated: k.isValidated,
      lastValidatedAt: k.lastValidatedAt,
      lastError: k.lastError,
    }));
  }

  /**
   * Deletes a BYOK key for a workspace.
   */
  public deleteKey(workspaceId: string, provider: AIProviderType): boolean {
    return db.deleteBYOKKey(workspaceId, provider);
  }

  /**
   * Central unified AI execution entrypoint.
   * Resolves Managed vs BYOK mode and executes safely without cross-contamination.
   */
  public async execute<T = any>(options: AIOrchestrationOptions): Promise<OrchestrationResult<T>> {
    const workspaceId = options.workspaceId || 'ws_default_prod';
    const effectiveMode = this.getEffectiveMode(workspaceId);

    if (effectiveMode === 'BYOK') {
      return this.executeBYOK<T>(workspaceId, options);
    } else {
      return this.executeManaged<T>(workspaceId, options);
    }
  }

  /**
   * Executes AI generation using Platform Managed AI keys with quota metering.
   */
  private async executeManaged<T>(workspaceId: string, options: AIOrchestrationOptions): Promise<OrchestrationResult<T>> {
    // Check token quota
    const tokenCheck = entitlementEngine.check(workspaceId, 'AI_TOKENS', 1500);
    if (!tokenCheck.allowed) {
      throw new Error(`Managed AI quota exceeded: ${tokenCheck.reason}`);
    }

    const result = await aiOrchestrator.orchestrateStructured<T>(options, () => ({} as T));

    // Record token usage if successful
    if (result.success && result.runRecord) {
      const tokensUsed = (result.runRecord.inputTokens || 0) + (result.runRecord.outputTokens || 0) || 1200;
      entitlementEngine.consume(workspaceId, 'AI_TOKENS', tokensUsed);
    }

    return result;
  }

  /**
   * Executes AI generation using User's Bring Your Own Key.
   * STRICT GUARANTEE: Never falls back to platform-paid keys on failure.
   */
  private async executeBYOK<T>(workspaceId: string, options: AIOrchestrationOptions): Promise<OrchestrationResult<T>> {
    const config = db.getWorkspaceAIConfig(workspaceId);
    const provider = config.activeProvider || 'OPENROUTER';

    const keyRecord = db.getBYOKKey(workspaceId, provider);
    if (!keyRecord || !keyRecord.isActive) {
      throw new Error(
        `BYOK mode is active, but no verified API key is configured for ${provider}. Please configure your API key in Settings -> AI Providers.`
      );
    }

    let plainApiKey = '';
    try {
      plainApiKey = decryptSecret(keyRecord.encryptedKey);
    } catch (err: any) {
      logger.error(`Failed to decrypt BYOK key for workspace ${workspaceId}:`, err);
      throw new Error('Cryptographic vault failed to decrypt stored provider key. Please re-enter your key in Settings.');
    }

    const modelId = options.preferredModel || config.activeModel || this.getDefaultModelForProvider(provider);
    const reqOptions: AIProviderRequestOptions = {
      taskType: options.taskType,
      prompt: options.prompt,
      systemInstruction: options.systemInstruction,
      schema: options.schema,
      temperature: options.temperature,
      workspaceId,
    };

    const startTime = Date.now();
    logger.info(`Routing BYOK execution to ${provider} model ${modelId} for workspace ${workspaceId}`);

    let providerResponse: any;

    if (provider === 'OPENAI') {
      providerResponse = await openaiProvider.generateStructured<T>(modelId, reqOptions, plainApiKey);
    } else if (provider === 'ANTHROPIC') {
      providerResponse = await anthropicProvider.generateStructured<T>(modelId, reqOptions, plainApiKey);
    } else if (provider === 'GEMINI') {
      providerResponse = await geminiProvider.generateStructured<T>(modelId, reqOptions, plainApiKey);
    } else {
      providerResponse = await openRouterProvider.generateStructured<T>(modelId, reqOptions, plainApiKey);
    }

    const latencyMs = Date.now() - startTime;

    if (!providerResponse.success) {
      logger.error(`BYOK Provider ${provider} failed: ${providerResponse.errorMessage}`);
      // Record failure on key record for UI feedback
      keyRecord.lastError = providerResponse.errorMessage;
      db.saveBYOKKey(keyRecord);

      throw new Error(
        `BYOK Provider Error (${provider}): ${providerResponse.errorMessage || 'Execution failed'}. Verify your API key balance and permissions in Settings -> AI Providers.`
      );
    }

    const runRecord: AIRun = {
      id: `run_byok_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      workspaceId,
      taskType: options.taskType,
      provider: provider.toLowerCase(),
      model: modelId,
      attempt: 1,
      status: 'SUCCESS',
      latencyMs,
      inputTokens: providerResponse.inputTokens || 0,
      outputTokens: providerResponse.outputTokens || 0,
      fallbackUsed: false,
      fallbackChain: [modelId],
      validationStatus: providerResponse.repaired ? 'REPAIRED' : 'VALID',
      aiMode: 'BYOK',
      requestedProvider: provider,
      credentialRef: keyRecord.keyMask,
      promptSummary: options.prompt.slice(0, 120),
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    db.recordAIRun(runRecord);

    db.recordAudit({
      workspaceId,
      eventType: 'ai_run_completed',
      summary: `BYOK AI task ${options.taskType} completed via ${provider} (${modelId}) in ${latencyMs}ms [Credential: ${keyRecord.keyMask}]`,
      details: { runId: runRecord.id, provider, model: modelId, latencyMs, keyMask: keyRecord.keyMask, mode: 'BYOK' },
    });

    return {
      success: true,
      data: providerResponse.structuredData,
      usedModel: modelId,
      usedProvider: provider.toLowerCase() as any,
      fallbackChainUsed: [modelId],
      fallbackUsed: false,
      totalLatencyMs: latencyMs,
      attemptsCount: 1,
      runRecord,
    };
  }

  private getDefaultModelForProvider(provider: AIProviderType): string {
    switch (provider) {
      case 'OPENAI':
        return 'gpt-4o-mini';
      case 'ANTHROPIC':
        return 'claude-3-5-sonnet-20241022';
      case 'GEMINI':
        return 'gemini-2.0-flash';
      case 'OPENROUTER':
      default:
        return 'google/gemini-2.0-flash-001';
    }
  }
}

export const aiGateway = new AIGateway();
