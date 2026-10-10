import { AIProvider, AIProviderRequestOptions, AIProviderResponse } from '../types';
import { extractAndParseJson } from '../../utils/jsonParser';
import { logger } from '../../utils/logger';

export class AnthropicProvider implements AIProvider {
  public readonly name = 'anthropic' as const;
  private readonly defaultModel = 'claude-3-5-sonnet-20241022';
  private static readonly API_ENDPOINT = 'https://api.anthropic.com/v1/messages';

  public isConfigured(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim().length > 5);
  }

  public async generateText(
    modelId = this.defaultModel,
    options: AIProviderRequestOptions,
    customApiKey?: string
  ): Promise<AIProviderResponse<string>> {
    return this.callAnthropic(modelId, options, false, customApiKey);
  }

  public async generateStructured<T>(
    modelId = this.defaultModel,
    options: AIProviderRequestOptions,
    customApiKey?: string
  ): Promise<AIProviderResponse<T>> {
    const res = await this.callAnthropic(modelId, options, true, customApiKey);
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
        errorMessage: `Anthropic JSON parse failed: ${err.message}`,
      } as unknown as AIProviderResponse<T>;
    }
  }

  public async healthCheck(
    apiKey?: string,
    modelId = 'claude-3-5-haiku-20241022'
  ): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return { healthy: false, latencyMs: 0, error: 'Anthropic API key not provided' };
    }

    const start = Date.now();
    try {
      const response = await fetch(AnthropicProvider.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key.trim(),
          'anthropic-version': '2023-06-01',
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

  private async callAnthropic(
    modelId: string,
    options: AIProviderRequestOptions,
    isJsonMode: boolean,
    customApiKey?: string
  ): Promise<AIProviderResponse<string>> {
    const key = customApiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return {
        success: false,
        content: '',
        model: modelId,
        provider: 'anthropic',
        latencyMs: 0,
        failureCategory: 'PROVIDER_UNAVAILABLE',
        errorMessage: 'Anthropic API key not provided for call.',
      };
    }

    const startTime = Date.now();

    let userPrompt = options.prompt;
    if (isJsonMode) {
      userPrompt += '\n\nIMPORTANT: Respond ONLY with valid, RFC 8259 compliant JSON. Do not wrap with conversational filler.';
    }

    const payload: any = {
      model: modelId,
      max_tokens: options.maxTokens ?? 2500,
      temperature: options.temperature ?? 0.3,
      messages: [{ role: 'user', content: userPrompt }],
    };

    if (options.systemInstruction) {
      payload.system = options.systemInstruction;
    }

    try {
      const response = await fetch(AnthropicProvider.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key.trim(),
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(payload),
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`Anthropic error HTTP ${response.status}:`, errorBody);

        let failureCategory: any = 'PROVIDER_UNAVAILABLE';
        if (response.status === 401) failureCategory = 'PROVIDER_UNAVAILABLE';
        if (response.status === 429) failureCategory = 'RATE_LIMIT';

        return {
          success: false,
          content: '',
          model: modelId,
          provider: 'anthropic',
          latencyMs,
          failureCategory,
          errorMessage: `Anthropic returned status ${response.status}: ${errorBody}`,
        };
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || '';
      const inputTokens = data.usage?.input_tokens;
      const outputTokens = data.usage?.output_tokens;

      return {
        success: true,
        content,
        model: modelId,
        provider: 'anthropic',
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
        provider: 'anthropic',
        latencyMs: Date.now() - startTime,
        failureCategory: 'TIMEOUT',
        errorMessage: err.message,
      };
    }
  }
}

export const anthropicProvider = new AnthropicProvider();
