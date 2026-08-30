import { AIProvider, AIProviderRequestOptions, AIProviderResponse } from '../types';
import { FailureCategory } from '../../../src/types/index';
import { freeModelRegistry } from '../openrouter/registry';
import { extractAndParseJson } from '../../utils/jsonParser';
import { logger } from '../../utils/logger';

export class OpenRouterProvider implements AIProvider {
  public readonly name = 'openrouter' as const;

  private getApiKey(): string | undefined {
    return process.env.OPENROUTER_API_KEY;
  }

  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.trim().length > 5);
  }

  public async generateText(
    modelId: string,
    options: AIProviderRequestOptions
  ): Promise<AIProviderResponse<string>> {
    return this.callOpenRouter(modelId, options, false);
  }

  public async generateStructured<T>(
    modelId: string,
    options: AIProviderRequestOptions
  ): Promise<AIProviderResponse<T>> {
    const response = await this.callOpenRouter(modelId, options, true);
    if (!response.success) {
      return response as unknown as AIProviderResponse<T>;
    }

    try {
      const parsed = extractAndParseJson<T>(response.content);
      return {
        ...response,
        structuredData: parsed.data,
        repaired: parsed.repaired,
      };
    } catch (err: any) {
      freeModelRegistry.recordFailure(modelId, 'SCHEMA_FAILURE', err.message);
      return {
        ...response,
        success: false,
        failureCategory: 'SCHEMA_FAILURE',
        errorMessage: `JSON parse failed: ${err.message}`,
      } as unknown as AIProviderResponse<T>;
    }
  }

  public async healthCheck(modelId = 'openrouter/free'): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    if (!this.isConfigured()) {
      return { healthy: false, latencyMs: 0, error: 'OPENROUTER_API_KEY is not configured in server environment.' };
    }
    const start = Date.now();
    try {
      const res = await this.callOpenRouter(modelId, {
        taskType: 'VALIDATION',
        prompt: 'Respond with exactly: {"status":"ok"}',
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

  private async callOpenRouter(
    modelId: string,
    options: AIProviderRequestOptions,
    jsonMode: boolean
  ): Promise<AIProviderResponse<string>> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return {
        success: false,
        content: '',
        model: modelId,
        provider: 'openrouter',
        latencyMs: 0,
        failureCategory: 'PROVIDER_UNAVAILABLE',
        errorMessage: 'OPENROUTER_API_KEY is not configured.',
      };
    }

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];

    let systemText = options.systemInstruction || '';
    if (jsonMode) {
      systemText = `${systemText}\n\nIMPORTANT: You must respond ONLY with valid JSON. Do not include introductory text, explanations, or markdown codeblocks outside the JSON structure.`.trim();
    }

    if (systemText) {
      messages.push({ role: 'system', content: systemText });
    }
    messages.push({ role: 'user', content: options.prompt });

    const timeoutMs = options.timeoutMs || 25000;
    const startTime = Date.now();

    const maxRetries = 2;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const body: Record<string, any> = {
          model: modelId,
          messages,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.maxTokens || 4000,
        };

        // If JSON mode and model supports structured outputs, hint json_object format
        if (jsonMode && !modelId.includes('deepseek-r1')) {
          body.response_format = { type: 'json_object' };
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://researchflow.ai',
            'X-Title': 'ResearchFlow AI',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const latencyMs = Date.now() - startTime;

        if (!res.ok) {
          const errorText = await res.text().catch(() => '');
          const failureCategory = this.categorizeHttpError(res.status, errorText);

          // Retry on 429 or 5xx with jitter
          if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
            const jitterMs = 300 + Math.random() * 500;
            await new Promise(resolve => setTimeout(resolve, jitterMs));
            continue;
          }

          freeModelRegistry.recordFailure(modelId, failureCategory, `HTTP ${res.status}: ${errorText.slice(0, 150)}`);

          return {
            success: false,
            content: '',
            model: modelId,
            provider: 'openrouter',
            latencyMs,
            failureCategory,
            errorMessage: `OpenRouter HTTP ${res.status}: ${errorText.slice(0, 200)}`,
          };
        }

        const json = await res.json();
        const choice = json?.choices?.[0];
        let content = choice?.message?.content || '';

        // Handle DeepSeek R1 reasoning tag removal if present
        if (content.includes('</think>')) {
          content = content.split('</think>')[1].trim();
        }

        const inputTokens = json?.usage?.prompt_tokens;
        const outputTokens = json?.usage?.completion_tokens;

        if (!content || content.trim().length === 0) {
          freeModelRegistry.recordFailure(modelId, 'INVALID_RESPONSE', 'Empty generation received');
          return {
            success: false,
            content: '',
            model: modelId,
            provider: 'openrouter',
            latencyMs,
            failureCategory: 'INVALID_RESPONSE',
            errorMessage: 'OpenRouter returned an empty message content.',
          };
        }

        freeModelRegistry.recordSuccess(modelId, latencyMs);

        return {
          success: true,
          content,
          model: modelId,
          provider: 'openrouter',
          latencyMs,
          inputTokens,
          outputTokens,
          rawResponse: json,
        };
      } catch (err: any) {
        lastError = err;
        const latencyMs = Date.now() - startTime;
        const isTimeout = err.name === 'AbortError' || err.message?.includes('timeout') || err.message?.includes('aborted');
        const failureCategory: FailureCategory = isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR';

        if (attempt < maxRetries) {
          const jitterMs = 400 + Math.random() * 400;
          await new Promise(resolve => setTimeout(resolve, jitterMs));
          continue;
        }

        freeModelRegistry.recordFailure(modelId, failureCategory, err.message);

        return {
          success: false,
          content: '',
          model: modelId,
          provider: 'openrouter',
          latencyMs,
          failureCategory,
          errorMessage: `OpenRouter call failed: ${err.message}`,
        };
      }
    }

    return {
      success: false,
      content: '',
      model: modelId,
      provider: 'openrouter',
      latencyMs: Date.now() - startTime,
      failureCategory: 'UNKNOWN',
      errorMessage: `Exhausted retries: ${lastError?.message || 'Unknown error'}`,
    };
  }

  private categorizeHttpError(status: number, errorBody: string): FailureCategory {
    const lower = errorBody.toLowerCase();
    if (status === 429 || lower.includes('rate limit') || lower.includes('quota') || lower.includes('rate-limited')) {
      return 'RATE_LIMIT';
    }
    if (
      status === 403 ||
      status === 404 ||
      lower.includes('only available on agentic harnesses') ||
      lower.includes('not found') ||
      lower.includes('model not available') ||
      lower.includes('disabled') ||
      lower.includes('unauthorized') ||
      lower.includes('access denied')
    ) {
      return 'MODEL_UNAVAILABLE';
    }
    if (status === 400 && (lower.includes('context') || lower.includes('too large') || lower.includes('maximum context'))) {
      return 'CONTEXT_TOO_LARGE';
    }
    if (status === 400 && (lower.includes('safety') || lower.includes('refusal') || lower.includes('policy'))) {
      return 'CONTENT_REFUSAL';
    }
    if (status === 502 || status === 503 || status === 504 || status === 500) {
      return 'PROVIDER_UNAVAILABLE';
    }
    return 'UNKNOWN';
  }

  private parseJsonContent<T>(rawContent: string): { data: T; repaired: boolean } {
    let clean = rawContent.trim();

    // 1. Direct parse attempt
    try {
      return { data: JSON.parse(clean), repaired: false };
    } catch {
      // Continue to heuristics
    }

    // 2. Strip Markdown code fences
    if (clean.includes('```')) {
      clean = clean.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').replace(/```/g, '').trim();
      try {
        return { data: JSON.parse(clean), repaired: true };
      } catch {
        // Continue
      }
    }

    // 3. Extract outermost JSON object or array bounds
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    const firstBracket = clean.indexOf('[');
    const lastBracket = clean.lastIndexOf(']');

    if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      const candidate = clean.substring(firstBrace, lastBrace + 1);
      try {
        return { data: JSON.parse(candidate), repaired: true };
      } catch {
        // Try fixing trailing commas before closing braces
        const noTrailing = candidate.replace(/,\s*([}\]])/g, '$1');
        try {
          return { data: JSON.parse(noTrailing), repaired: true };
        } catch {
          // Continue
        }
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

    throw new Error('Unable to extract valid JSON payload from model response');
  }
}

export const openRouterProvider = new OpenRouterProvider();
