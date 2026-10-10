import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import {
  AIProviderType,
  BYOKPublicSummary,
  WorkspaceAIConfig,
  AIMode,
} from '../../types';
import {
  KeyRound,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  ExternalLink,
  Sparkles,
  Zap,
  Sliders,
  Check,
} from 'lucide-react';

const PROVIDER_METADATA: Record<
  AIProviderType,
  {
    name: string;
    description: string;
    docsUrl: string;
    keyPlaceholder: string;
    models: { id: string; label: string; badge?: string }[];
  }
> = {
  OPENAI: {
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4o-mini, and high-reasoning o3-mini models via direct OpenAI API.',
    docsUrl: 'https://platform.openai.com/api-keys',
    keyPlaceholder: 'sk-proj-...',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini (Fast & Low Cost)', badge: 'Recommended' },
      { id: 'gpt-4o', label: 'GPT-4o (Omni High Quality)' },
      { id: 'o3-mini', label: 'o3-mini (High Reasoning)' },
    ],
  },
  ANTHROPIC: {
    name: 'Anthropic Claude',
    description: 'Claude 3.7 Sonnet, 3.5 Sonnet, and 3.5 Haiku via direct Anthropic Messages API.',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    keyPlaceholder: 'sk-ant-api03-...',
    models: [
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (State-of-the-art)', badge: 'Top Strategy' },
      { id: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet (Hybrid Reasoning)' },
      { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Lightning Fast)' },
    ],
  },
  GEMINI: {
    name: 'Google Gemini',
    description: 'Gemini 2.0 Flash and 1.5 Pro via Google AI Studio API.',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    keyPlaceholder: 'AIzaSy...',
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Fast Multi-Modal)', badge: 'Default' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Deep Context)' },
    ],
  },
  OPENROUTER: {
    name: 'OpenRouter',
    description: 'Unified multi-model aggregator with unified balance and fallback failover.',
    docsUrl: 'https://openrouter.ai/keys',
    keyPlaceholder: 'sk-or-v1-...',
    models: [
      { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash (OpenRouter)' },
      { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (OpenRouter)' },
      { id: 'openai/gpt-4o-mini', label: 'GPT-4o mini (OpenRouter)' },
    ],
  },
};

export const AIProvidersSettingsTab: React.FC = () => {
  const { addToast } = useWorkspace();

  const [keys, setKeys] = useState<BYOKPublicSummary[]>([]);
  const [config, setConfig] = useState<WorkspaceAIConfig | null>(null);
  const [effectiveMode, setEffectiveMode] = useState<AIMode>('MANAGED');
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>('OPENAI');
  const [inputApiKey, setInputApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ healthy: boolean; latencyMs: number; error?: string } | null>(null);
  const [savingKey, setSavingKey] = useState(false);
  const [strictBYOK, setStrictBYOK] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [keysRes, configRes] = await Promise.all([
        api.getBYOKKeys(),
        api.getAIConfig(),
      ]);

      if (keysRes.success) setKeys(keysRes.keys);
      if (configRes.success) {
        setConfig(configRes.config);
        setEffectiveMode(configRes.effectiveMode);
        setSelectedProvider(configRes.config.activeProvider || 'OPENAI');
        setSelectedModel(configRes.config.activeModel || '');
        setStrictBYOK(configRes.config.strictBYOKOnly ?? true);
      }
    } catch (err: any) {
      console.error('Failed to load BYOK data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTestConnection = async () => {
    if (!inputApiKey.trim()) {
      addToast('Please enter an API key to test.', 'error');
      return;
    }

    setTestingKey(true);
    setTestResult(null);

    try {
      const res = await api.testBYOKKey(selectedProvider, inputApiKey.trim(), selectedModel);
      setTestResult(res);
      if (res.healthy) {
        addToast(`Connection verified with ${selectedProvider} (${res.latencyMs}ms)`, 'success');
      } else {
        addToast(`Verification failed: ${res.error}`, 'error');
      }
    } catch (err: any) {
      setTestResult({ healthy: false, latencyMs: 0, error: err.message });
      addToast(`Test error: ${err.message}`, 'error');
    } finally {
      setTestingKey(false);
    }
  };

  const handleSaveKey = async () => {
    if (!inputApiKey.trim()) {
      addToast('Please enter an API key to save.', 'error');
      return;
    }

    setSavingKey(true);
    try {
      const res = await api.saveBYOKKey(
        selectedProvider,
        inputApiKey.trim(),
        selectedModel || PROVIDER_METADATA[selectedProvider].models[0].id
      );

      if (res.success) {
        setInputApiKey('');
        setTestResult(null);
        addToast(`API Key securely encrypted & saved for ${selectedProvider}!`, 'success');
        await loadData();
      }
    } catch (err: any) {
      addToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setSavingKey(false);
    }
  };

  const handleDeleteKey = async (provider: AIProviderType) => {
    if (!confirm(`Are you sure you want to remove the stored key for ${provider}?`)) return;

    try {
      const res = await api.deleteBYOKKey(provider);
      if (res.success) {
        addToast(`Key removed for ${provider}.`, 'info');
        await loadData();
      }
    } catch (err: any) {
      addToast(`Failed to delete key: ${err.message}`, 'error');
    }
  };

  const handleSwitchMode = async (mode: AIMode) => {
    try {
      const res = await api.updateAIConfig({
        mode,
        activeProvider: selectedProvider,
        activeModel: selectedModel,
        strictBYOKOnly: strictBYOK,
      });
      if (res.success) {
        setConfig(res.config);
        setEffectiveMode(res.effectiveMode);
        addToast(`AI Usage Mode switched to ${mode}.`, 'success');
      }
    } catch (err: any) {
      addToast(`Failed to update mode: ${err.message}`, 'error');
    }
  };

  const handleToggleStrict = async (enabled: boolean) => {
    setStrictBYOK(enabled);
    try {
      await api.updateAIConfig({
        strictBYOKOnly: enabled,
      });
      addToast(`Strict BYOK isolation ${enabled ? 'enabled' : 'disabled'}.`, 'info');
    } catch (err: any) {
      console.error(err);
    }
  };

  const existingKeyForSelected = keys.find((k) => k.provider === selectedProvider);

  return (
    <div className="space-y-6">
      {/* AI Usage Mode Selector Banner */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">AI Compute & Billing Mode</h3>
              <p className="text-xs text-zinc-500">
                Choose how your market research pipelines consume and route AI models.
              </p>
            </div>
          </div>

          <div className="inline-flex p-1 bg-zinc-100 rounded-xl border border-zinc-200">
            <button
              onClick={() => handleSwitchMode('MANAGED')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                effectiveMode === 'MANAGED'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Managed AI</span>
            </button>
            <button
              onClick={() => handleSwitchMode('BYOK')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                effectiveMode === 'BYOK'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>BYOK (Your Keys)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div
            onClick={() => handleSwitchMode('MANAGED')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              effectiveMode === 'MANAGED'
                ? 'border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-500/20'
                : 'border-zinc-200 bg-zinc-50/50 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>Mode A: Platform Managed AI</span>
              </span>
              {effectiveMode === 'MANAGED' && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Zero configuration required. All AI model costs and API rate limits are covered by ResearchFlow AI. Billed
              directly via subscription quota.
            </p>
          </div>

          <div
            onClick={() => handleSwitchMode('BYOK')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              effectiveMode === 'BYOK'
                ? 'border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-500/20'
                : 'border-zinc-200 bg-zinc-50/50 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Mode B: Bring Your Own Key (BYOK)</span>
              </span>
              {effectiveMode === 'BYOK' && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Connect your OpenAI, Anthropic, or Gemini API keys. Tokens are billed directly by your provider at cost with zero
              platform markup and 60% discounted subscriptions.
            </p>
          </div>
        </div>
      </div>

      {/* Provider Selector Cards */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-6">
        <div>
          <h4 className="text-sm font-bold text-zinc-900">Supported AI Providers</h4>
          <p className="text-xs text-zinc-500 mt-0.5">
            Select a provider to inspect, test, or update its credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(PROVIDER_METADATA) as AIProviderType[]).map((prov) => {
            const meta = PROVIDER_METADATA[prov];
            const isSelected = selectedProvider === prov;
            const existingKey = keys.find((k) => k.provider === prov);

            return (
              <button
                key={prov}
                onClick={() => {
                  setSelectedProvider(prov);
                  setSelectedModel(existingKey?.preferredModel || meta.models[0].id);
                  setTestResult(null);
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-600/20 shadow-2xs'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-zinc-900">{meta.name}</span>
                    {existingKey ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Connected</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-medium">Not configured</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                    {meta.description}
                  </p>
                </div>

                {existingKey && (
                  <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Key: {existingKey.keyMask}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Provider Key Input Card */}
        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/60 pb-3">
            <div>
              <h5 className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                <span>Configure {PROVIDER_METADATA[selectedProvider].name} Credentials</span>
                {existingKeyForSelected && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Encrypted AES-256-GCM
                  </span>
                )}
              </h5>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Obtain your API key from the{' '}
                <a
                  href={PROVIDER_METADATA[selectedProvider].docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline font-semibold inline-flex items-center gap-0.5"
                >
                  <span>{PROVIDER_METADATA[selectedProvider].name} Console</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </p>
            </div>

            {existingKeyForSelected && (
              <button
                onClick={() => handleDeleteKey(selectedProvider)}
                className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Key</span>
              </button>
            )}
          </div>

          {/* Model Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">Preferred Default Model</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PROVIDER_METADATA[selectedProvider].models.map((m) => {
                const isCurrentModel = (selectedModel || PROVIDER_METADATA[selectedProvider].models[0].id) === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                      isCurrentModel
                        ? 'border-indigo-600 bg-white shadow-2xs font-bold text-zinc-900'
                        : 'border-zinc-200 bg-white/60 text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{m.label}</span>
                      {m.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                          {m.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Input */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">
              {existingKeyForSelected ? 'Update API Key (or leave blank to keep current)' : 'Enter API Key'}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputApiKey}
                onChange={(e) => setInputApiKey(e.target.value)}
                placeholder={
                  existingKeyForSelected
                    ? `Currently set to ${existingKeyForSelected.keyMask}`
                    : PROVIDER_METADATA[selectedProvider].keyPlaceholder
                }
                className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Test connection results banner */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                testResult.healthy
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.healthy ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>
                  {testResult.healthy
                    ? `Live Ping Succeeded: Provider responded in ${testResult.latencyMs}ms.`
                    : `Connection Error: ${testResult.error}`}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleTestConnection}
              disabled={testingKey || !inputApiKey.trim()}
              className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-semibold text-zinc-700 flex items-center gap-2 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingKey ? 'animate-spin text-indigo-600' : ''}`} />
              <span>Test Connection</span>
            </button>

            <button
              onClick={handleSaveKey}
              disabled={savingKey || !inputApiKey.trim()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{savingKey ? 'Encrypting & Saving...' : 'Save & Encrypt Key'}</span>
            </button>
          </div>
        </div>

        {/* Strict BYOK Guarantee Toggle */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-start gap-3">
          <input
            type="checkbox"
            id="strictBYOKCheckbox"
            checked={strictBYOK}
            onChange={(e) => handleToggleStrict(e.target.checked)}
            className="mt-0.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="strictBYOKCheckbox" className="text-xs cursor-pointer">
            <span className="font-bold text-zinc-900 block">Strict BYOK Isolation Guarantee</span>
            <span className="text-zinc-500 block leading-relaxed mt-0.5">
              Never fall back silently to platform managed keys if my API key runs out of balance or errors. Show a clear
              failure alert instead to avoid unintended usage.
            </span>
          </label>
        </div>

        {/* Cryptographic Vault Guarantee Banner */}
        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-900">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Enterprise Cryptographic Vault: </span>
            <span>
              All Bring Your Own Key tokens are encrypted at rest using AES-256-GCM authenticated cipher with a dedicated
              server-side master key. Plaintext tokens are strictly never exposed via client API endpoints and are only decrypted
              in transient Node.js memory during outbound research API calls.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
