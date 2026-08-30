import { GoogleGenAI } from '@google/genai';
import { AIProvider, AIProviderRequestOptions, AIProviderResponse } from '../types';
import { FailureCategory } from '../../../src/types/index';
import { extractAndParseJson } from '../../utils/jsonParser';
import { logger } from '../../utils/logger';

export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini' as const;
  private aiClient: GoogleGenAI | null = null;
  private readonly defaultModel = 'gemini-3.7-flash';

  private getClient(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.trim().length === 0) {
      return null;
    }
    if (!this.aiClient) {
      this.aiClient = new GoogleGenAI({ apiKey: key });
    }
    return this.aiClient;
  }

  public isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
  }

  public async generateText(
    modelId = this.defaultModel,
    options: AIProviderRequestOptions
  ): Promise<AIProviderResponse<string>> {
    return this.callGemini(modelId, options, false);
  }

  public async generateStructured<T>(
    modelId = this.defaultModel,
    options: AIProviderRequestOptions
  ): Promise<AIProviderResponse<T>> {
    const res = await this.callGemini(modelId, options, true);
    if (!res.success) {
      return res as unknown as AIProviderResponse<T>;
    }

    try {
      const parsed = extractAndParseJson<T>(res.content);
      return {
        ...res,
        structuredData: parsed.data,
        repaired: parsed.repaired,
      };
    } catch (err: any) {
      return {
        ...res,
        success: false,
        failureCategory: 'SCHEMA_FAILURE',
        errorMessage: `Gemini JSON parse failed: ${err.message}`,
      } as unknown as AIProviderResponse<T>;
    }
  }

  public async healthCheck(modelId = this.defaultModel): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    if (!this.isConfigured()) {
      return { healthy: false, latencyMs: 0, error: 'GEMINI_API_KEY is not configured in server environment.' };
    }
    const start = Date.now();
    try {
      const res = await this.callGemini(modelId, {
        taskType: 'VALIDATION',
        prompt: 'Return json: {"status":"healthy"}',
        temperature: 0.1,
        maxTokens: 50,
        timeoutMs: 8000,
      }, true);
      const latencyMs = Date.now() - start;
      if (res.success) {
        return { healthy: true, latencyMs };
      }
      return { healthy: false, latencyMs, error: res.errorMessage || 'Failed ping test' };
    } catch (e: any) {
      return { healthy: false, latencyMs: Date.now() - start, error: e.message };
    }
  }

  private async callGemini(
    modelId: string,
    options: AIProviderRequestOptions,
    jsonMode: boolean
  ): Promise<AIProviderResponse<string>> {
    const client = this.getClient();
    if (!client) {
      return {
        success: false,
        content: '',
        model: modelId,
        provider: 'gemini',
        latencyMs: 0,
        failureCategory: 'PROVIDER_UNAVAILABLE',
        errorMessage: 'GEMINI_API_KEY is not configured.',
      };
    }

    const start = Date.now();
    const resolvedModel = this.mapModelName(modelId);

    const config: Record<string, any> = {
      temperature: options.temperature ?? 0.2,
    };

    if (options.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }

    if (jsonMode) {
      config.responseMimeType = 'application/json';
      if (options.schema) {
        config.responseSchema = options.schema;
      }
    }

    try {
      const response = await client.models.generateContent({
        model: resolvedModel,
        contents: options.prompt,
        config,
      });

      const latencyMs = Date.now() - start;
      const text = response.text || '';

      if (!text || text.trim().length === 0) {
        return {
          success: false,
          content: '',
          model: resolvedModel,
          provider: 'gemini',
          latencyMs,
          failureCategory: 'INVALID_RESPONSE',
          errorMessage: 'Gemini returned empty response text.',
        };
      }

      return {
        success: true,
        content: text,
        model: resolvedModel,
        provider: 'gemini',
        latencyMs,
        inputTokens: response.usageMetadata?.promptTokenCount,
        outputTokens: response.usageMetadata?.candidatesTokenCount,
        rawResponse: response,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      const failureCategory = this.categorizeGeminiError(err);

      return {
        success: false,
        content: '',
        model: resolvedModel,
        provider: 'gemini',
        latencyMs,
        failureCategory,
        errorMessage: `Gemini API error: ${err.message}`,
      };
    }
  }

  private mapModelName(model: string): string {
    if (model.includes('3.1-pro') || model.includes('pro')) return 'gemini-3.1-pro-preview';
    if (model.includes('3.6')) return 'gemini-3.6-flash';
    if (model.includes('3.7') || model.includes('flash')) return 'gemini-3.7-flash';
    return this.defaultModel;
  }

  private categorizeGeminiError(err: any): FailureCategory {
    const msg = (err.message || '').toLowerCase();
    const status = err.status || err.statusCode;

    if (status === 429 || msg.includes('quota') || msg.includes('rate limit') || msg.includes('resource_exhausted')) {
      return 'RATE_LIMIT';
    }
    if (status === 404 || msg.includes('not found') || msg.includes('unsupported model')) {
      return 'MODEL_UNAVAILABLE';
    }
    if (status === 400 && (msg.includes('context length') || msg.includes('token count exceeds'))) {
      return 'CONTEXT_TOO_LARGE';
    }
    if (status === 400 && (msg.includes('safety') || msg.includes('blocked') || msg.includes('candidate was blocked'))) {
      return 'CONTENT_REFUSAL';
    }
    if (status >= 500 || msg.includes('internal error') || msg.includes('service unavailable')) {
      return 'PROVIDER_UNAVAILABLE';
    }
    if (msg.includes('timeout') || msg.includes('deadline')) {
      return 'TIMEOUT';
    }
    return 'UNKNOWN';
  }

  private parseJsonContent<T>(rawContent: string): { data: T; repaired: boolean } {
    let clean = rawContent.trim();

    try {
      return { data: JSON.parse(clean), repaired: false };
    } catch {
      // Continue to cleanup
    }

    if (clean.includes('```')) {
      clean = clean.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').replace(/```/g, '').trim();
      try {
        return { data: JSON.parse(clean), repaired: true };
      } catch {
        // Continue
      }
    }

    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    const firstBracket = clean.indexOf('[');
    const lastBracket = clean.lastIndexOf(']');

    if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      const candidate = clean.substring(firstBrace, lastBrace + 1);
      try {
        return { data: JSON.parse(candidate), repaired: true };
      } catch {
        const noTrailing = candidate.replace(/,\s*([}\]])/g, '$1');
        return { data: JSON.parse(noTrailing), repaired: true };
      }
    } else if (firstBracket !== -1 && lastBracket !== -1) {
      const candidate = clean.substring(firstBracket, lastBracket + 1);
      try {
        return { data: JSON.parse(candidate), repaired: true };
      } catch {
        const noTrailing = candidate.replace(/,\s*([}\]])/g, '$1');
        return { data: JSON.parse(noTrailing), repaired: true };
      }
    }

    throw new Error('Unable to extract valid JSON payload from Gemini response');
  }
}

export const geminiProvider = new GeminiProvider();
