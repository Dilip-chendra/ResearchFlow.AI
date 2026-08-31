import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import { ExecutiveSummaryResult } from '../../types';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  Lightbulb,
  Layers,
  Database,
  ExternalLink,
  Clock
} from 'lucide-react';

interface ResearchInsightsWidgetProps {
  onExploreEvidence?: () => void;
  onViewCampaigns?: () => void;
}

export const ResearchInsightsWidget: React.FC<ResearchInsightsWidgetProps> = ({
  onExploreEvidence,
  onViewCampaigns,
}) => {
  const { activeWorkspace, addToast, setActiveView } = useWorkspace();
  const [summary, setSummary] = useState<ExecutiveSummaryResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  const fetchSummary = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRegenerating(true);
      } else {
        setLoading(true);
      }
      const data = isRefresh
        ? await api.regenerateExecutiveSummary()
        : await api.getExecutiveSummary();
      setSummary(data);
      if (isRefresh) {
        addToast('Executive summary re-synthesized', 'success');
      }
    } catch (err: any) {
      console.error('Failed to load executive summary', err);
      if (isRefresh) {
        addToast('Could not refresh research insights', 'error');
      }
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchSummary(false);
  }, [activeWorkspace?.id]);

  if (loading && !summary) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-200" />
            <div className="space-y-1.5">
              <div className="w-36 h-4 bg-zinc-200 rounded" />
              <div className="w-24 h-3 bg-zinc-100 rounded" />
            </div>
          </div>
          <div className="w-24 h-6 bg-zinc-100 rounded-full" />
        </div>
        <div className="space-y-2 py-2">
          <div className="w-full h-3.5 bg-zinc-100 rounded" />
          <div className="w-11/12 h-3.5 bg-zinc-100 rounded" />
          <div className="w-4/5 h-3.5 bg-zinc-100 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="h-14 bg-zinc-100 rounded-xl" />
          <div className="h-14 bg-zinc-100 rounded-xl" />
          <div className="h-14 bg-zinc-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      id="research-insights-widget"
      className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/20 to-white rounded-2xl border border-indigo-100/80 p-6 shadow-xs hover:border-indigo-200 transition-all duration-200"
    >
      {/* Subtle background ambient highlight */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                Research Insights
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                Neural Synthesis Core
              </span>
              {summary && summary.confidenceScore > 0 ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {summary.confidenceScore}% Grounded
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Clock className="w-3 h-3 text-amber-600" />
                  Awaiting Research Data
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {summary && summary.confidenceScore > 0
                ? 'Live executive synthesis from latest verified evidence & competitor findings'
                : 'Pipeline ready. Run a research job to generate live evidence-backed intelligence.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {summary?.generatedAt && (
            <span className="hidden md:flex items-center gap-1 text-[11px] text-zinc-600 font-mono">
              <Clock className="w-3 h-3 text-zinc-600" />
              {new Date(summary.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchSummary(true)}
            disabled={regenerating}
            className="px-3 py-1.5 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-indigo-600 text-xs font-semibold rounded-lg border border-zinc-200 shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-60"
            title="Re-generate executive summary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{regenerating ? 'Synthesizing...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {/* Main Executive Summary Paragraph */}
      <div className={`mt-4 transition-all duration-200 ${regenerating ? 'opacity-50 blur-[0.5px]' : 'opacity-100'}`}>
        <div className="bg-white/80 backdrop-blur-xs p-4 sm:p-5 rounded-xl border border-zinc-200/80 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 shrink-0 mt-0.5 hidden sm:block">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="space-y-2 text-zinc-800">
              <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                <span>Executive Summary</span>
                {summary?.evidenceItemsAnalyzed ? (
                  <span className="text-zinc-600 font-normal normal-case">
                    Synthesized from {summary.evidenceItemsAnalyzed} verified claims across {summary.jobCountAnalyzed || 1} pipeline{summary.jobCountAnalyzed !== 1 ? 's' : ''}
                  </span>
                ) : null}
              </div>
              <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed font-normal">
                {summary?.paragraph ||
                  'No competitor research jobs have been executed yet for this workspace. Launch a research job to extract live market evidence and synthesize competitive intelligence.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Strategic Signals Grid */}
      {summary?.keySignals && summary.keySignals.length > 0 && (
        <div className={`mt-4 transition-all duration-200 ${regenerating ? 'opacity-50' : 'opacity-100'}`}>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Top Market Signals Identified</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {summary.keySignals.slice(0, 3).map((signal, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-xl border border-zinc-200/80 shadow-2xs hover:border-indigo-200 transition-colors flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-zinc-700 font-medium leading-snug">
                  {signal}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategic Tactical Mandate Banner & Deep Links */}
      <div className="mt-4 pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {summary?.strategicImplication ? (
          <div className="flex items-center gap-2 text-zinc-700">
            <span className="font-bold text-indigo-700 shrink-0">Tactical Posture:</span>
            <span className="text-zinc-600 line-clamp-1 italic">{summary.strategicImplication}</span>
          </div>
        ) : (
          <div className="text-zinc-600">
            Engine: <span className="font-mono font-medium text-zinc-700">Autonomous Intelligence Core</span>
          </div>
        )}

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onExploreEvidence || (() => setActiveView('evidence'))}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>Evidence Base</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-zinc-300">|</span>
          <button
            onClick={onViewCampaigns || (() => setActiveView('campaigns'))}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>Campaign Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
