import {
  AITaskType,
  FailureCategory,
  ModelCapabilityProfile,
  AIRun,
  AIHealthStatus,
  AIRoutingMode
} from '../../src/types/index';

export interface AIProviderRequestOptions {
  taskType: AITaskType;
  prompt: string;
  systemInstruction?: string;
  schema?: any;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  contextBudgetTokens?: number;
  workspaceId?: string;
  timeoutMs?: number;
}

export interface AIProviderResponse<T = any> {
  success: boolean;
  content: string;
  structuredData?: T;
  rawResponse?: any;
  model: string;
  provider: 'openrouter' | 'gemini' | 'heuristic';
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  failureCategory?: FailureCategory;
  errorMessage?: string;
  repaired?: boolean;
}

export interface AIProvider {
  readonly name: 'openrouter' | 'gemini' | 'heuristic';
  isConfigured(): boolean;
  generateText(modelId: string, options: AIProviderRequestOptions): Promise<AIProviderResponse<string>>;
  generateStructured<T>(modelId: string, options: AIProviderRequestOptions): Promise<AIProviderResponse<T>>;
  healthCheck(modelId?: string): Promise<{ healthy: boolean; latencyMs: number; error?: string }>;
}

export interface AIOrchestrationOptions {
  taskType: AITaskType;
  prompt: string;
  systemInstruction?: string;
  schema?: any;
  untrustedWebData?: string;
  workspaceId?: string;
  priority?: 'HIGH' | 'NORMAL' | 'BACKGROUND';
  preferredModel?: string;
  customFallbackModels?: string[];
  maxLatencyMs?: number;
  timeoutPerModelMs?: number;
  temperature?: number;
}

export interface OrchestrationResult<T = any> {
  success: boolean;
  data: T;
  usedModel: string;
  usedProvider: 'openrouter' | 'gemini' | 'heuristic';
  fallbackChainUsed: string[];
  fallbackUsed: boolean;
  totalLatencyMs: number;
  attemptsCount: number;
  runRecord: AIRun;
  error?: string;
}
