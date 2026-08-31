import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { api } from '../../lib/api';
import { ResearchJob, IntelligenceReport } from '../../types';
import { BrainCircuit, Sparkles, Megaphone, ShieldAlert, ArrowRight, Compass, Swords, Play, RefreshCw, Layers } from 'lucide-react';
import { AudioBriefingPlayer } from './AudioBriefingPlayer';
import { PositioningMatrixModal } from './PositioningMatrixModal';
import { BattlecardBuilder } from './BattlecardBuilder';

export const IntelligenceView: React.FC = () => {
  const { activeWorkspace, addToast, selectedJobId, setSelectedJobId, setActiveView } = useWorkspace();
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ResearchJob | null>(null);
  const [intelligence, setIntelligence] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingJob, setLoadingJob] = useState(false);
  const [runningJob, setRunningJob] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const jobsList = await api.getResearchJobs();
      setJobs(jobsList);

      if (jobsList.length > 0) {
        // Look for targeted job or first job
        const target = (selectedJobId && jobsList.find(j => j.id === selectedJobId)) || jobsList[0];
        setSelectedJob(target);
        try {
          const full = await api.getResearchJob(target.id);
          setIntelligence(full.intelligence || null);
        } catch {
          setIntelligence(null);
        }
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspace?.id]);

  const handleSelectJob = async (job: ResearchJob) => {
    setSelectedJob(job);
    setSelectedJobId(job.id);
    setLoadingJob(true);
    try {
      const full = await api.getResearchJob(job.id);
      setIntelligence(full.intelligence || null);
    } catch (err: any) {
      addToast(err.message, 'error');
      setIntelligence(null);
    } finally {
      setLoadingJob(false);
    }
  };

  const handleRunPipeline = async () => {
    if (!selectedJob) return;
    try {
      setRunningJob(true);
      addToast(`Synthesizing competitive intelligence for "${selectedJob.businessName}"...`, 'info');
      await api.runResearchJob(selectedJob.id);
      const full = await api.getResearchJob(selectedJob.id);
      setIntelligence(full.intelligence || null);
      setSelectedJob(full.job || selectedJob);
      addToast('Intelligence synthesized successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to synthesize intelligence', 'error');
    } finally {
      setRunningJob(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-zinc-500 text-xs">
        <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
        <span>Loading intelligence matrix...</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 space-y-4 shadow-2xs">
        <BrainCircuit className="w-10 h-10 text-zinc-400 mx-auto" />
        <h3 className="text-sm font-bold text-zinc-900">No Research Sprints Found</h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Start your first competitive research sprint to automatically synthesize positioning gaps, SWOT analysis, and audience signals.
        </p>
        <button
          onClick={() => setActiveView('research')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
        >
          Create Research Sprint
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header with Persistent Job Selector & 2D Matrix Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Intelligence Matrix &amp; Radar</h2>
          <p className="text-xs text-zinc-600 mt-0.5">
            Cross-competitor positioning gaps, audience sentiment signals, and validated market opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {intelligence && (
            <button
              onClick={() => setShowMatrixModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Interactive 2D Matrix</span>
            </button>
          )}

          {/* Job Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-zinc-500 hidden sm:inline">Sprint:</label>
            <select
              value={selectedJob?.id}
              onChange={(e) => {
                const j = jobs.find((item) => item.id === e.target.value);
                if (j) handleSelectJob(j);
              }}
              className="p-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-800 outline-none shadow-2xs hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-[280px] truncate"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.businessName} — {j.campaignObjective ? j.campaignObjective.slice(0, 30) : 'General Research'}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loadingJob ? (
        <div className="p-12 text-center text-zinc-500 text-xs">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
          <span>Loading intelligence for {selectedJob?.businessName}...</span>
        </div>
      ) : !intelligence ? (
        /* Empty / Pending State for Un-synthesized Job */
        <div className="p-10 sm:p-12 text-center bg-white rounded-2xl border border-zinc-200 space-y-4 shadow-2xs">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              Intelligence Not Yet Synthesized for "{selectedJob?.businessName}"
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1 leading-relaxed">
              This research sprint is currently in <span className="font-semibold text-zinc-800 uppercase px-2 py-0.5 bg-zinc-100 rounded text-[10px]">{selectedJob?.status || 'queued'}</span> status with {selectedJob?.sourcesCount || 0} source(s). Synthesize intelligence with AI or review the evidence collected.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRunPipeline}
              disabled={runningJob}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${runningJob ? 'animate-spin' : ''}`} />
              <span>{runningJob ? 'Synthesizing...' : '🚀 Synthesize Intelligence with AI'}</span>
            </button>
            <button
              onClick={() => {
                if (selectedJob) {
                  setSelectedJobId(selectedJob.id);
                  setActiveView('research');
                }
              }}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Inspect Sources &amp; Evidence
            </button>
          </div>
        </div>
      ) : (
        /* Complete Intelligence Matrix & Radar Content */
        <>
          {/* Daily Voice Executive Briefing */}
          {selectedJob && <AudioBriefingPlayer jobId={selectedJob.id} />}

          {/* Competitive Landscape */}
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                <span>Competitive Landscape Overview</span>
              </h3>
              <button
                onClick={() => {
                  if (selectedJob) {
                    setSelectedJobId(selectedJob.id);
                    setActiveView('research');
                  }
                }}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect Job Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-zinc-800 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-200/80">
              {intelligence.competitiveLandscape}
            </p>
          </div>

          {/* Signals & Patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Audience Signals */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Target Audience Signals</span>
              </h4>
              <ul className="space-y-2 text-xs text-zinc-700">
                {intelligence.audienceSignals.map((sig, idx) => (
                  <li key={idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Messaging Patterns */}
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <span>Competitor Messaging Patterns</span>
              </h4>
              <ul className="space-y-2 text-xs text-zinc-700">
                {intelligence.messagingPatterns.map((pat, idx) => (
                  <li key={idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{pat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sales Enablement Battlecard Module */}
          {selectedJob && <BattlecardBuilder job={selectedJob} />}

          {/* Market Opportunities */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Validated Market Opportunities &amp; Positioning Exploits</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {intelligence.marketOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 text-sm">{opp.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded uppercase">
                      {opp.impact} IMPACT
                    </span>
                  </div>
                  <p className="text-zinc-700 leading-relaxed">{opp.description}</p>
                  <div className="pt-2 border-t border-emerald-200/60 font-semibold text-emerald-950">
                    <span className="text-[11px] text-emerald-700 uppercase tracking-wider block">Recommended Action:</span>
                    {opp.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risks & Limitations */}
          {intelligence.risks && intelligence.risks.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Strategic Risks &amp; Competitive Moats</span>
              </h4>
              <ul className="space-y-2 text-xs text-zinc-700">
                {intelligence.risks.map((r, idx) => (
                  <li key={idx} className="p-3 bg-rose-50/40 rounded-xl border border-rose-200/80 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Positioning Matrix Modal */}
          {showMatrixModal && selectedJob && (
            <PositioningMatrixModal
              jobId={selectedJob.id}
              businessName={selectedJob.businessName}
              onClose={() => setShowMatrixModal(false)}
            />
          )}
        </>
      )}
    </div>
  );
};
