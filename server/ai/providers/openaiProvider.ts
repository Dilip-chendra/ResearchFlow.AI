import { AIProvider, AIProviderRequestOptions, AIProviderResponse } from '../types';
import { extractAndParseJson } from '../../utils/jsonParser';
import { logger } from '../../utils/logger';

export class OpenAIProvider implements AIProvider {
  public readonly name = 'openai' as const;
  private readonly defaultModel = 'gpt-4o-mini';
  private static readonly API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

  public isConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 5);
  }

  public async generateText(
    modelId = this.defaultModel,
    options: AIProviderRequestOptions,
    customApiKey?: string
  ): Promise<AIProviderResponse<string>> {
    return this.callOpenAI(modelId, options, false, customApiKey);
  }

  public async generateStructured<T>(
    modelId = this.defaultModel,
    options: AIProviderRequestOptions,
    customApiKey?: string
  ): Promise<AIProviderResponse<T>> {
    const res = await this.callOpenAI(modelId, options, true, customApiKey);
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
        errorMessage: `OpenAI JSON parse failed: ${err.message}`,
      } as unknown as AIProviderResponse<T>;
    }
  }

  public async healthCheck(
    apiKey?: string,
    modelId = 'gpt-4o-mini'
  ): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      return { healthy: false, latencyMs: 0, error: 'OpenAI API key not provided' };
    }

    const start = Date.now();
    try {
      const response = await fetch(OpenAIProvider.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key.trim()}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: 'Respond with "PONG"' }],
          max_tokens: 5,
        }),
      });

      const latency = Date.now() - start;
      if (!response.ok) {
        const errorText = await response.text();
        return { healthy: false, latencyMs: latency, error: `HTTP ${response.status}: ${errorText}` };
      }

      return { healthy: true, latencyMs: latency };
    } catch (err: any) {
      return { healthy: false, latencyMs: Date.now() - start, error: err.message };
    }
  }

  private async callOpenAI(
    modelId: string,
    options: AIProviderRequestOptions,
    isJsonMode: boolean,
    customApiKey?: string
  ): Promise<AIProviderResponse<string>> {
    const key = customApiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      return {
        success: false,
        content: '',
        model: modelId,
        provider: 'openai',
        latencyMs: 0,
        failureCategory: 'PROVIDER_UNAVAILABLE',
        errorMessage: 'OpenAI API key not provided for call.',
      };
    }

    const startTime = Date.now();
    const messages: Array<{ role: string; content: string }> = [];

    if (options.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction });
    }
    messages.push({ role: 'user', content: options.prompt });

    const payload: any = {
      model: modelId,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 2500,
    };

    if (isJsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    try {
      const response = await fetch(OpenAIProvider.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key.trim()}`,
        },
        body: JSON.stringify(payload),
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`OpenAI error HTTP ${response.status}:`, errorBody);

        let failureCategory: any = 'PROVIDER_UNAVAILABLE';
        if (response.status === 401) failureCategory = 'PROVIDER_UNAVAILABLE';
        if (response.status === 429) failureCategory = 'RATE_LIMIT';

        return {
          success: false,
          content: '',
          model: modelId,
          provider: 'openai',
          latencyMs,
          failureCategory,
          errorMessage: `OpenAI returned status ${response.status}: ${errorBody}`,
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const inputTokens = data.usage?.prompt_tokens;
      const outputTokens = data.usage?.completion_tokens;

      return {
        success: true,
        content,
        model: modelId,
        provider: 'openai',
        latencyMs,
        inputTokens,
        outputTokens,
        rawResponse: data,
      };
    } catch (err: any) {
      return {
        success: false,
        content: '',
        model: modelId,
        provider: 'openai',
        latencyMs: Date.now() - startTime,
        failureCategory: 'TIMEOUT',
        errorMessage: err.message,
      };
    }
  }
}

export const openaiProvider = new OpenAIProvider();
