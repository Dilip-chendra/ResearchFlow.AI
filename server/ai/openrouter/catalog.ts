import fs from 'fs';
import path from 'path';
import { ModelCapabilityProfile } from '../../../src/types/index';
import { logger } from '../../utils/logger';

// Default curated fallback models in case network is down or API is not reached yet
export const DEFAULT_FREE_MODELS: ModelCapabilityProfile[] = [
  {
    id: 'openrouter/free',
    name: 'OpenRouter Free Auto-Router',
    provider: 'openrouter',
    contextWindow: 128000,
    supportsStructuredOutput: true,
    supportsJsonSchema: true,
    reasoningLevel: 'HIGH',
    free: true,
    health: 'HEALTHY',
    lastHealthCheck: new Date().toISOString(),
    consecutiveFailures: 0,
    totalRequests: 0,
    totalSuccesses: 0,
    avgLatencyMs: 850,
    pricing: { prompt: 0, completion: 0 },
    strengths: ['universal-fallback', 'synthesis', 'extraction', 'campaigns'],
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Google Gemini 2.0 Flash (Free)',
    provider: 'openrouter',
    contextWindow: 1048576,
    supportsStructuredOutput: true,
    supportsJsonSchema: true,
    reasoningLevel: 'HIGH',
    free: true,
    health: 'HEALTHY',
    lastHealthCheck: new Date().toISOString(),
    consecutiveFailures: 0,
    totalRequests: 0,
    totalSuccesses: 0,
    avgLatencyMs: 650,
    pricing: { prompt: 0, completion: 0 },
    strengths: ['fast-extraction', 'structured-output', 'large-context', 'synthesis'],
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Meta Llama 3.3 70B Instruct (Free)',
    provider: 'openrouter',
    contextWindow: 131072,
    supportsStructuredOutput: true,
    supportsJsonSchema: true,
    reasoningLevel: 'HIGH',
    free: true,
    health: 'HEALTHY',
    lastHealthCheck: new Date().toISOString(),
    consecutiveFailures: 0,
    totalRequests: 0,
    totalSuccesses: 0,
    avgLatencyMs: 1200,
    pricing: { prompt: 0, completion: 0 },
    strengths: ['deep-reasoning', 'synthesis', 'campaign-strategy', 'content-generation'],
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 Reasoning (Free)',
    provider: 'openrouter',
    contextWindow: 64000,
    supportsStructuredOutput: true,
    supportsJsonSchema: false,
    reasoningLevel: 'HIGH',
    free: true,
    health: 'HEALTHY',
    lastHealthCheck: new Date().toISOString(),
    consecutiveFailures: 0,
    totalRequests: 0,
    totalSuccesses: 0,
    avgLatencyMs: 1800,
    pricing: { prompt: 0, completion: 0 },
    strengths: ['deep-reasoning', 'conflict-analysis', 'strategic-implications'],
  },
  {
    id: 'mistralai/mistral-small-24b-instruct-2501:free',
    name: 'Mistral Small 24B Instruct (Free)',
    provider: 'openrouter',
    contextWindow: 32768,
    supportsStructuredOutput: true,
    supportsJsonSchema: true,
    reasoningLevel: 'MEDIUM',
    free: true,
    health: 'HEALTHY',
    lastHealthCheck: new Date().toISOString(),
    consecutiveFailures: 0,
    totalRequests: 0,
    totalSuccesses: 0,
    avgLatencyMs: 780,
    pricing: { prompt: 0, completion: 0 },
    strengths: ['fast-extraction', 'content-generation', 'structured-output'],
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct:free',
    name: 'Qwen 2.5 Coder 32B (Free)',
    provider: 'openrouter',
    contextWindow: 32768,
    supportsStructuredOutput: true,
    supportsJsonSchema: true,
    reasoningLevel: 'MEDIUM',
    free: true,
    health: 'HEALTHY',
    lastHealthCheck: new Date().toISOString(),
    consecutiveFailures: 0,
    totalRequests: 0,
    totalSuccesses: 0,
    avgLatencyMs: 720,
    pricing: { prompt: 0, completion: 0 },
    strengths: ['structured-output', 'fast-extraction', 'json-formatting'],
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Meta Llama 3.2 3B Instruct (Free)',
    provider: 'openrouter',
    contextWindow: 131072,
    supportsStructuredOutput: true,
    supportsJsonSchema: false,
    reasoningLevel: 'BASIC',
    free: true,
    health: 'HEALTHY',
    lastHealthCheck: new Date().toISOString(),
    consecutiveFailures: 0,
    totalRequests: 0,
    totalSuccesses: 0,
    avgLatencyMs: 450,
    pricing: { prompt: 0, completion: 0 },
    strengths: ['ultra-fast', 'fast-extraction', 'fallback-speed'],
  },
];

// Models or patterns that are restricted, require specialized agentic harnesses, or are non-chat models
const RESTRICTED_OR_NON_CHAT_PATTERNS = [
  'thinkingmachines/inkling',
  'guard',
  'moderation',
  'embed',
  'whisper',
  'audio',
  'tts',
  'flux',
  'sdxl',
  'image',
  'rerank',
  'vision-only',
];

export class OpenRouterCatalogService {
  private cacheFilePath: string;
  private memoryCache: ModelCapabilityProfile[] = [];
  private lastFetchTime = 0;
  private readonly CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        // ignore
      }
    }
    this.cacheFilePath = path.join(dataDir, 'openrouter_catalog.json');
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const raw = fs.readFileSync(this.cacheFilePath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.models) && data.models.length > 0) {
          this.memoryCache = data.models;
          this.lastFetchTime = data.lastFetchTime || 0;
          logger.info(`Loaded ${this.memoryCache.length} models from OpenRouter local catalog cache.`);
          return;
        }
      }
    } catch (err) {
      logger.warn('Failed to load OpenRouter catalog cache:', err);
    }
    this.memoryCache = [...DEFAULT_FREE_MODELS];
  }

  private saveToDisk(): void {
    try {
      const payload = {
        lastFetchTime: this.lastFetchTime,
        models: this.memoryCache,
      };
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      logger.error('Failed to save OpenRouter catalog cache to disk:', err);
    }
  }

  public getCachedFreeModels(): ModelCapabilityProfile[] {
    if (this.memoryCache.length === 0) {
      this.memoryCache = [...DEFAULT_FREE_MODELS];
    }
    return this.memoryCache;
  }

  public getLastSyncTime(): string {
    return this.lastFetchTime > 0 ? new Date(this.lastFetchTime).toISOString() : new Date().toISOString();
  }

  public async fetchAndSyncCatalog(apiKey?: string): Promise<ModelCapabilityProfile[]> {
    const now = Date.now();
    // Use cache if fresh
    if (this.memoryCache.length > 0 && now - this.lastFetchTime < this.CACHE_TTL_MS && !apiKey) {
      return this.memoryCache;
    }

    try {
      const headers: Record<string, string> = {
        'HTTP-Referer': 'https://researchflow.ai',
        'X-Title': 'ResearchFlow AI',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      logger.info('Syncing OpenRouter live model catalog...');
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers,
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        logger.warn(`OpenRouter catalog fetch returned HTTP ${response.status}. Using cached/fallback models.`);
        return this.getCachedFreeModels();
      }

      const json = await response.json();
      if (!json || !Array.isArray(json.data)) {
        logger.warn('OpenRouter returned invalid catalog schema. Using cached fallback models.');
        return this.getCachedFreeModels();
      }

      const freeModels: ModelCapabilityProfile[] = [];

      // Always include openrouter/free universal auto-router
      freeModels.push(DEFAULT_FREE_MODELS[0]);

      for (const item of json.data) {
        const id = item.id;
        const pricing = item.pricing || {};
        const promptPrice = parseFloat(pricing.prompt || '0');
        const completionPrice = parseFloat(pricing.completion || '0');
        const isFree = id.includes(':free') || (promptPrice === 0 && completionPrice === 0);

        if (isFree && id !== 'openrouter/free') {
          const lowerId = id.toLowerCase();
          const isRestricted = RESTRICTED_OR_NON_CHAT_PATTERNS.some(pat => lowerId.includes(pat));
          if (isRestricted) {
            continue;
          }

          const contextLength = item.context_length || 32768;
          const name = item.name || id;
          const description = (item.description || '').toLowerCase();

          // Determine reasoning level & strengths
          let reasoningLevel: 'HIGH' | 'MEDIUM' | 'BASIC' | 'NONE' = 'MEDIUM';
          const strengths: string[] = ['free-tier'];

          if (id.includes('r1') || id.includes('reasoner') || description.includes('reasoning')) {
            reasoningLevel = 'HIGH';
            strengths.push('deep-reasoning', 'strategic-analysis');
          } else if (id.includes('70b') || id.includes('exp') || contextLength > 64000) {
            reasoningLevel = 'HIGH';
            strengths.push('synthesis', 'campaign-strategy', 'large-context');
          } else if (id.includes('3b') || id.includes('mini') || id.includes('small')) {
            reasoningLevel = 'BASIC';
            strengths.push('fast-extraction', 'speed');
          }

          if (description.includes('code') || id.includes('coder') || id.includes('instruct')) {
            strengths.push('structured-output', 'json-formatting');
          }

          // Preserve existing stats if we already have this model in memory
          const existing = this.memoryCache.find(m => m.id === id);

          freeModels.push({
            id,
            name,
            provider: 'openrouter',
            contextWindow: contextLength,
            supportsStructuredOutput: true,
            supportsJsonSchema: !id.includes('deepseek-r1'),
            reasoningLevel,
            free: true,
            health: existing?.health || 'HEALTHY',
            quarantinedUntil: existing?.quarantinedUntil,
            lastHealthCheck: new Date().toISOString(),
            consecutiveFailures: existing?.consecutiveFailures || 0,
            totalRequests: existing?.totalRequests || 0,
            totalSuccesses: existing?.totalSuccesses || 0,
            avgLatencyMs: existing?.avgLatencyMs || 800,
            pricing: { prompt: 0, completion: 0 },
            strengths,
          });
        }
      }

      if (freeModels.length > 1) {
        this.memoryCache = freeModels;
        this.lastFetchTime = now;
        this.saveToDisk();
        logger.info(`Successfully discovered and registered ${freeModels.length} OpenRouter free models.`);
      }

      return this.memoryCache;
    } catch (err: any) {
      logger.warn(`OpenRouter catalog sync encountered error: ${err.message}. Using cache.`);
      return this.getCachedFreeModels();
    }
  }
}

export const openRouterCatalog = new OpenRouterCatalogService();
