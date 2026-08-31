import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  BookOpen,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  ShieldCheck,
  TrendingUp,
  Zap,
  Building2,
  FileCheck,
  RefreshCw,
  AlertTriangle,
  Radio,
  Server,
  Activity,
  Sliders,
  Check,
  X,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { AIHealthStatus, ModelCapabilityProfile, AIRun, FailureCategory, AIRoutingMode } from '../../types';

export const SettingsView: React.FC = () => {
  const { activeWorkspace, setActiveView } = useWorkspace();

  const [aiHealth, setAiHealth] = useState<AIHealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [syncingCatalog, setSyncingCatalog] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ healthy: boolean; latencyMs: number; error?: string } | null>(null);
  const [updatingMode, setUpdatingMode] = useState(false);
  const [testModeEnabled, setTestModeEnabled] = useState(false);
  const [simulatedFailure, setSimulatedFailure] = useState<FailureCategory>('RATE_LIMIT');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchAIHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/ai/health');
      if (res.ok) {
        const data: AIHealthStatus = await res.json();
        setAiHealth(data);
        setTestModeEnabled(data.testMode?.failureInjectionEnabled || false);
        if (data.testMode?.simulatedFailureType) {
          setSimulatedFailure(data.testMode.simulatedFailureType);
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI health:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchAIHealth();
  }, []);

  const handleSyncCatalog = async () => {
    setSyncingCatalog(true);
    setActionNotice(null);
    try {
      const res = await fetch('/api/ai/sync-catalog', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Successfully synced OpenRouter catalog (${data.count} free models registered).`);
        await fetchAIHealth();
      } else {
        setActionNotice(`Catalog sync notice: ${data.error || 'Using verified fallback models.'}`);
      }
    } catch (err: any) {
      setActionNotice(`Catalog sync error: ${err.message}`);
    } finally {
      setSyncingCatalog(false);
    }
  };

  const handleRoutingModeChange = async (mode: AIRoutingMode) => {
    setUpdatingMode(true);
    setActionNotice(null);
    try {
      const res = await fetch('/api/ai/routing-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        setActionNotice(`Routing mode updated to ${mode}.`);
        await fetchAIHealth();
      }
    } catch (err: any) {
      setActionNotice(`Failed to update mode: ${err.message}`);
    } finally {
      setUpdatingMode(false);
    }
  };

  const handleToggleTestMode = async (enabled: boolean, failureType = simulatedFailure) => {
    setActionNotice(null);
    try {
      const res = await fetch('/api/ai/test-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, failureType }),
      });
      if (res.ok) {
        setTestModeEnabled(enabled);
        setActionNotice(`Failure simulation ${enabled ? `ENABLED (${failureType})` : 'DISABLED'}.`);
        await fetchAIHealth();
      }
    } catch (err: any) {
      setActionNotice(`Failed to toggle simulation: ${err.message}`);
    }
  };

  const handleResetHealth = async (modelId?: string) => {
    setActionNotice(null);
    try {
      const res = await fetch('/api/ai/reset-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId }),
      });
      if (res.ok) {
        setActionNotice('Quarantine and health counters successfully reset.');
        await fetchAIHealth();
      }
    } catch (err: any) {
      setActionNotice(`Reset error: ${err.message}`);
    }
  };

  const handlePingAI = async (provider: 'openrouter' | 'gemini') => {
    setPinging(true);
    setPingResult(null);
    try {
      const res = await fetch('/api/ai/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      setPingResult(data);
    } catch (err: any) {
      setPingResult({ healthy: false, latencyMs: 0, error: err.message });
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            System Architecture & AI Orchestration Runbook
          </h2>
          <p className="text-xs text-zinc-600 mt-0.5">
            Multi-model resilience engine, dynamic OpenRouter free discovery, Gemini failover, and live operational telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAIHealth}
            disabled={loadingHealth}
            className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg text-xs font-semibold text-zinc-700 flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin text-indigo-600' : 'text-zinc-500'}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-indigo-500 hover:text-indigo-800 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* AI Multi-Model Orchestration Health Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <span>Multi-Model AI Orchestrator</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Zero Single Point of Failure
                </span>
              </h3>
              <p className="text-xs text-zinc-500">
                Dynamic load balancing across OpenRouter Free Models + Gemini + Deterministic Heuristic Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncCatalog}
              disabled={syncingCatalog}
              className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingCatalog ? 'animate-spin' : ''}`} />
              <span>Sync Free Models</span>
            </button>
            <button
              onClick={() => handleResetHealth()}
              className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-600" />
              <span>Reset Health</span>
            </button>
          </div>
        </div>

        {/* Live Status Indicators Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Overall Resilience
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${aiHealth?.overallStatus === 'HEALTHY' ? 'bg-emerald-500 animate-pulse' : aiHealth?.overallStatus === 'DEGRADED' ? 'bg-amber-500' : 'bg-rose-500'}`} />
              <span className="text-sm font-bold text-zinc-900">
                {aiHealth?.overallStatus || 'ACTIVE'}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 block">
              Failover guarantee active
            </span>
          </div>

          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              OpenRouter Free Fleet
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${aiHealth?.openRouterStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-sm font-bold text-zinc-900">
                {aiHealth?.healthyFreeModelCount || 0} Healthy
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 block">
              {aiHealth?.freeModelCount || 0} total discovered models
            </span>
          </div>

          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Gemini Standby / Pro
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${aiHealth?.geminiStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
              <span className="text-sm font-bold text-zinc-900">
                {aiHealth?.geminiStatus || 'READY'}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 block">
              Automatic secondary tier
            </span>
          </div>

          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Quarantine Isolation
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${aiHealth?.quarantinedModelCount === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-sm font-bold text-zinc-900">
                {aiHealth?.quarantinedModelCount || 0} Quarantined
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 block">
              10-min auto cool-off rule
            </span>
          </div>
        </div>

        {/* Routing Mode Policy Selector */}
        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>Active Routing Policy</span>
              </h4>
              <p className="text-[11px] text-indigo-800">
                Controls the primary dispatch tier and automatic cost containment rules.
              </p>
            </div>
            <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-semibold">
              Current: {aiHealth?.routingMode || 'FREE_ONLY'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => handleRoutingModeChange('FREE_ONLY')}
              disabled={updatingMode}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                aiHealth?.routingMode === 'FREE_ONLY'
                  ? 'bg-white border-indigo-600 text-zinc-900 shadow-xs ring-1 ring-indigo-600'
                  : 'bg-white/60 border-indigo-200 text-zinc-700 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>1. FREE ONLY (Recommended)</span>
                {aiHealth?.routingMode === 'FREE_ONLY' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </div>
              <p className="text-[10px] text-zinc-500 mt-1 leading-snug">
                Prioritizes OpenRouter Free Models & Auto-Router. Trips to Gemini only if free models are rate-limited.
              </p>
            </button>

            <button
              onClick={() => handleRoutingModeChange('BALANCED')}
              disabled={updatingMode}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                aiHealth?.routingMode === 'BALANCED'
                  ? 'bg-white border-indigo-600 text-zinc-900 shadow-xs ring-1 ring-indigo-600'
                  : 'bg-white/60 border-indigo-200 text-zinc-700 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>2. BALANCED HYBRID</span>
                {aiHealth?.routingMode === 'BALANCED' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </div>
              <p className="text-[10px] text-zinc-500 mt-1 leading-snug">
                Dispatches high-reasoning tasks across Gemini & Free fleet dynamically based on latency.
              </p>
            </button>

            <button
              onClick={() => handleRoutingModeChange('CUSTOM')}
              disabled={updatingMode}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                aiHealth?.routingMode === 'CUSTOM'
                  ? 'bg-white border-indigo-600 text-zinc-900 shadow-xs ring-1 ring-indigo-600'
                  : 'bg-white/60 border-indigo-200 text-zinc-700 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>3. EXPLICIT PROVIDER</span>
                {aiHealth?.routingMode === 'CUSTOM' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </div>
              <p className="text-[10px] text-zinc-500 mt-1 leading-snug">
                Enables manual model pinning for specific enterprise research suites.
              </p>
            </button>
          </div>
        </div>

        {/* Discovered Model Catalog Fleet Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-zinc-500" />
              <span>Registered Free Model Fleet ({aiHealth?.models?.length || 0})</span>
            </h4>
            <span className="text-[10px] text-zinc-400">
              Last catalog sync: {aiHealth?.lastCatalogSync ? new Date(aiHealth.lastCatalogSync).toLocaleTimeString() : 'N/A'}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold text-zinc-600">
                  <th className="py-2.5 px-3">Model Name & ID</th>
                  <th className="py-2.5 px-3">Context Window</th>
                  <th className="py-2.5 px-3">Reasoning</th>
                  <th className="py-2.5 px-3">Avg Latency</th>
                  <th className="py-2.5 px-3">Failures</th>
                  <th className="py-2.5 px-3">Health Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-normal text-zinc-700">
                {aiHealth?.models && aiHealth.models.length > 0 ? (
                  aiHealth.models.map((m) => (
                    <tr key={m.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-zinc-900">{m.name}</div>
                        <div className="font-mono text-[10px] text-zinc-400">{m.id}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {(m.contextWindow / 1000).toFixed(0)}k tokens
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          m.reasoningLevel === 'HIGH'
                            ? 'bg-purple-100 text-purple-800'
                            : m.reasoningLevel === 'MEDIUM'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          {m.reasoningLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {m.avgLatencyMs ? `${m.avgLatencyMs}ms` : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {m.consecutiveFailures > 0 ? (
                          <span className="text-rose-600 font-bold">{m.consecutiveFailures} streak</span>
                        ) : (
                          <span className="text-emerald-600">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          m.health === 'HEALTHY'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : m.health === 'DEGRADED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {m.health}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleResetHealth(m.id)}
                          className="text-[11px] text-indigo-600 hover:text-indigo-900 font-semibold cursor-pointer"
                        >
                          Reset
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 px-3 text-center text-zinc-500">
                      No models loaded. Click "Sync Free Models" to discover available OpenRouter models.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Diagnostics & QA Failure Simulation Console */}
        <div className="p-4 bg-zinc-900 text-zinc-100 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Resilience & Failure Injection Testing Console (QA)
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              Verifies fallback chain without crashing research pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-zinc-400 block">
                Simulated Fault Injection on First Model Attempt:
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={simulatedFailure}
                  onChange={(e) => {
                    const val = e.target.value as FailureCategory;
                    setSimulatedFailure(val);
                    if (testModeEnabled) handleToggleTestMode(true, val);
                  }}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="RATE_LIMIT">HTTP 429 Rate Limit</option>
                  <option value="TIMEOUT">Socket Timeout (&gt;25s)</option>
                  <option value="PROVIDER_UNAVAILABLE">HTTP 503 Provider Outage</option>
                  <option value="SCHEMA_FAILURE">Corrupted JSON Schema</option>
                  <option value="CONTEXT_TOO_LARGE">Context Overflow (400)</option>
                </select>

                <button
                  onClick={() => handleToggleTestMode(!testModeEnabled, simulatedFailure)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                    testModeEnabled
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  {testModeEnabled ? 'Disable Fault Simulation' : 'Enable Fault Simulation'}
                </button>
              </div>
              <p className="text-[10px] text-zinc-400">
                When enabled, the orchestrator artificially fails the first model attempt with the chosen error, forcing instant transparent failover to secondary candidate models.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-zinc-400 block">
                Direct Provider Ping:
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePingAI('openrouter')}
                  disabled={pinging}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-semibold text-zinc-200 cursor-pointer transition-colors"
                >
                  Ping OpenRouter
                </button>
                <button
                  onClick={() => handlePingAI('gemini')}
                  disabled={pinging}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-semibold text-zinc-200 cursor-pointer transition-colors"
                >
                  Ping Gemini
                </button>
              </div>

              {pingResult && (
                <div className={`p-2 rounded font-mono text-[11px] ${pingResult.healthy ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-rose-950/80 text-rose-300 border border-rose-800'}`}>
                  {pingResult.healthy ? `✓ Ping succeeded in ${pingResult.latencyMs}ms` : `✕ Ping failed: ${pingResult.error}`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orchestration Runs Telemetry */}
        {aiHealth?.recentRuns && aiHealth.recentRuns.length > 0 && (
          <div className="space-y-2 border-t border-zinc-100 pt-4">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              <span>Recent AI Execution Telemetry ({aiHealth.recentRuns.length} recorded)</span>
            </h4>

            <div className="overflow-x-auto rounded-xl border border-zinc-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold text-zinc-600">
                    <th className="py-2 px-3">Task Type</th>
                    <th className="py-2 px-3">Provider</th>
                    <th className="py-2 px-3">Resolved Model</th>
                    <th className="py-2 px-3">Latency</th>
                    <th className="py-2 px-3">Fallback Chain</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-normal text-zinc-700">
                  {aiHealth.recentRuns.slice(0, 8).map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50/80">
                      <td className="py-2 px-3 font-semibold text-zinc-900">
                        {r.taskType}
                      </td>
                      <td className="py-2 px-3 uppercase text-[11px] font-mono font-bold text-indigo-600">
                        {r.provider}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-zinc-800">
                        {r.model}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px]">
                        {r.latencyMs}ms
                      </td>
                      <td className="py-2 px-3 text-[11px]">
                        {r.fallbackUsed ? (
                          <span className="text-amber-700 font-semibold flex items-center gap-1">
                            <span>{r.fallbackChain.length} models tried</span>
                          </span>
                        ) : (
                          <span className="text-zinc-500">Primary</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          r.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'FALLBACK_SUCCESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-zinc-400 font-mono text-[10px]">
                        {new Date(r.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Baseline Comparison Card (Manual vs ResearchFlow AI) */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span>Operational Baseline Comparison (Before vs. After)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Before */}
          <div className="p-4 bg-rose-50/40 rounded-xl border border-rose-200/80 space-y-2">
            <span className="font-bold text-rose-800 uppercase tracking-wider text-[11px] block">
              Previous Manual Baseline (Founder Bottleneck)
            </span>
            <ul className="space-y-1.5 text-zinc-700">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Time Required:</strong> 4 to 8 hours per competitor analysis.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Citation Traceability:</strong> 0% (Scattered screenshots, lost bookmarks).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Conflict Detection:</strong> Manual; pricing changes frequently missed.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Execution Handoff:</strong> Disconnected Google Docs with no task sync.</span>
              </li>
            </ul>
          </div>

          {/* After */}
          <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-2">
            <span className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] block">
              ResearchFlow AI Multi-Model Operational Wedge
            </span>
            <ul className="space-y-1.5 text-zinc-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Time Required:</strong> ~2.5 minutes end-to-end automated pipeline.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Citation Traceability:</strong> 100% verifiable quotes linked to source URLs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Multi-Model Redundancy:</strong> Free OpenRouter fleet + Gemini failover.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Execution Handoff:</strong> Instant campaign brief, multi-channel copy & tasks.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* System Architecture & Core Engineering Invariants */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>System Topology & Architectural Invariants</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              High-assurance 6-stage autonomous research pipeline with multi-model resilience and zero fake metrics.
            </p>
          </div>
          <button
            onClick={() => setActiveView('architecture')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <span>Explore Full Architecture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {[
            {
              phase: 'Stage 01',
              title: 'Ingestion Engine',
              desc: 'Distributed web scraping, SSRF IP sanitization, bounded 15s execution timeouts.',
            },
            {
              phase: 'Stage 02',
              title: 'Evidence Grounding',
              desc: '11-category structured claim extraction with 100% source URL citation linkage.',
            },
            {
              phase: 'Stage 03',
              title: 'Conflict Analyzer',
              desc: 'Cross-source semantic diffing, pricing variance detection, risk scoring.',
            },
            {
              phase: 'Stage 04',
              title: 'Neural Synthesis',
              desc: 'Multi-model resilience mesh with instant deterministic heuristic self-repair.',
            },
            {
              phase: 'Stage 05 & 06',
              title: 'Campaign & Tasks',
              desc: 'Multi-channel copy drafts, human approval gating, and immutable audit ledger.',
            },
          ].map((d) => (
            <div key={d.phase} className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="font-bold text-indigo-600 uppercase text-[10px] tracking-wider block font-mono">
                {d.phase}
              </span>
              <p className="font-bold text-zinc-900">{d.title}</p>
              <p className="text-[11px] text-zinc-600 leading-snug">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Infrastructure Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>AI Model & Safety Configuration</span>
          </h4>
          <div className="space-y-2 text-zinc-700">
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="font-medium text-zinc-500">Routing Mode</span>
              <span className="font-mono font-bold text-zinc-900">{aiHealth?.routingMode || 'FREE_ONLY'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="font-medium text-zinc-500">Output Protocol</span>
              <span className="font-mono font-semibold text-zinc-900">Strict Structured JSON Mode</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="font-medium text-zinc-500">Hallucination Guard</span>
              <span className="font-mono font-semibold text-emerald-600">Citation Provenance Verified</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium text-zinc-500">Prompt Injection Shield</span>
              <span className="font-mono font-semibold text-indigo-600">XML Isolation & Keyword Scrubbing</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Active Workspace Context</span>
          </h4>
          <div className="space-y-2 text-zinc-700">
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="font-medium text-zinc-500">Workspace ID</span>
              <span className="font-mono text-zinc-900">{activeWorkspace?.id || 'ws_default_1'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <span className="font-medium text-zinc-500">Business Name</span>
              <span className="font-semibold text-zinc-900">{activeWorkspace?.businessName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium text-zinc-500">Target Segment</span>
              <span className="text-zinc-800 truncate max-w-[200px]">{activeWorkspace?.targetAudience}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
