import React, { useState } from 'react';
import { api } from '../../lib/api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ResearchJob } from '../../types';
import {
  X,
  ArrowRightLeft,
  Layers,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  jobs: ResearchJob[];
}

export const CompareRunsModal: React.FC<Props> = ({ isOpen, onClose, jobs }) => {
  const { addToast } = useWorkspace();
  const [jobAId, setJobAId] = useState<string>(jobs[0]?.id || '');
  const [jobBId, setJobBId] = useState<string>(jobs[1]?.id || jobs[0]?.id || '');
  const [comparison, setComparison] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCompare = async () => {
    if (!jobAId || !jobBId) {
      addToast('Please select two distinct research jobs to compare', 'warning');
      return;
    }
    if (jobAId === jobBId) {
      addToast('Please select two different runs to compare changes', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await api.compareResearchRuns(jobAId, jobBId);
      setComparison(res);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Compare Research Runs & Shifts</h2>
              <p className="text-xs text-zinc-500">Cross-diff two research runs to observe competitor changes, new evidence, and pricing delta.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection bar */}
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Baseline Run (Job A)</label>
            <select
              value={jobAId}
              onChange={(e) => setJobAId(e.target.value)}
              className="w-full p-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium text-zinc-900 outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.businessName} ({new Date(j.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex justify-center pt-2 sm:pt-4">
            <div className="p-2 bg-white rounded-full border border-zinc-200 text-zinc-400 shadow-2xs">
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
            </div>
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">Comparison Run (Job B)</label>
            <select
              value={jobBId}
              onChange={(e) => setJobBId(e.target.value)}
              className="w-full p-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium text-zinc-900 outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.businessName} ({new Date(j.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-12 flex justify-end pt-2">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Analyzing Delta...' : 'Run Comparative Diff'}</span>
            </button>
          </div>
        </div>

        {/* Diff Results Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {!comparison ? (
            <div className="p-12 text-center text-zinc-500 text-xs space-y-2">
              <ArrowRightLeft className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="font-semibold text-zinc-800">Select two research runs above and click "Run Comparative Diff"</p>
              <p className="text-zinc-600 max-w-md mx-auto">
                Evaluate changes in competitor messaging, newly added evidence claims, and campaign strategy divergence.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              {/* Summary Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Run A Evidence</span>
                  <p className="text-lg font-extrabold text-zinc-900 mt-0.5">{comparison.evidenceCountA}</p>
                  <p className="text-[10px] text-zinc-500">{comparison.jobA?.businessName}</p>
                </div>
                <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Run B Evidence</span>
                  <p className="text-lg font-extrabold text-indigo-600 mt-0.5">{comparison.evidenceCountB}</p>
                  <p className="text-[10px] text-zinc-500">{comparison.jobB?.businessName}</p>
                </div>
                <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Evidence Delta</span>
                  <p className={`text-lg font-extrabold mt-0.5 ${comparison.evidenceDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {comparison.evidenceDelta > 0 ? `+${comparison.evidenceDelta}` : comparison.evidenceDelta}
                  </p>
                  <p className="text-[10px] text-zinc-500">Net claim change</p>
                </div>
                <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">New In Run B</span>
                  <p className="text-lg font-extrabold text-amber-600 mt-0.5">{comparison.newEvidenceInB?.length || 0}</p>
                  <p className="text-[10px] text-zinc-500">Unmatched claims</p>
                </div>
              </div>

              {/* Side-by-Side Objectives & Intelligence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-500" />
                    <h4 className="font-bold text-xs text-zinc-900 truncate">Run A: {comparison.jobA?.businessName}</h4>
                  </div>
                  <p className="text-xs text-zinc-600"><strong>Objective:</strong> {comparison.jobA?.campaignObjective}</p>
                  <p className="text-xs text-zinc-600"><strong>Audience:</strong> {comparison.jobA?.targetAudience}</p>
                  <div className="pt-2 border-t border-zinc-200 text-xs text-zinc-700">
                    <span className="font-semibold block mb-1">Executive Positioning:</span>
                    <p className="text-[11px] text-zinc-600 line-clamp-3">
                      {comparison.intelA?.executiveSummary || 'No summary generated.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    <h4 className="font-bold text-xs text-indigo-900 truncate">Run B: {comparison.jobB?.businessName}</h4>
                  </div>
                  <p className="text-xs text-zinc-600"><strong>Objective:</strong> {comparison.jobB?.campaignObjective}</p>
                  <p className="text-xs text-zinc-600"><strong>Audience:</strong> {comparison.jobB?.targetAudience}</p>
                  <div className="pt-2 border-t border-indigo-200 text-xs text-zinc-700">
                    <span className="font-semibold block mb-1">Executive Positioning:</span>
                    <p className="text-[11px] text-zinc-600 line-clamp-3">
                      {comparison.intelB?.executiveSummary || 'No summary generated.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Newly Discovered Evidence in Run B */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Newly Discovered Claims & Intelligence in Run B ({comparison.newEvidenceInB?.length || 0})</span>
                </h4>
                {comparison.newEvidenceInB?.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-3 bg-zinc-50 rounded-lg">
                    No unique claims detected in Run B compared to Run A.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {comparison.newEvidenceInB.map((ev: any) => (
                      <div key={ev.id} className="p-3 bg-white rounded-lg border border-amber-200/80 text-xs shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-900">[{ev.category}] {ev.claim}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                            {ev.confidence} Confidence
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 italic">"{ev.supportingText}"</p>
                        <p className="text-[10px] text-zinc-500">Source: {ev.sourceTitle || ev.sourceUrl}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
