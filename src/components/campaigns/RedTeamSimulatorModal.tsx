import React, { useState, useEffect } from 'react';
import { RedTeamAnalysis, CampaignBrief } from '../../types';
import { api } from '../../lib/api';
import { X, ShieldAlert, Sparkles, AlertTriangle, RefreshCw, Check, Copy, Swords, ArrowRight } from 'lucide-react';

interface Props {
  brief: CampaignBrief;
  businessName: string;
  onClose: () => void;
}

export const RedTeamSimulatorModal: React.FC<Props> = ({ brief, businessName, onClose }) => {
  const [analysis, setAnalysis] = useState<RedTeamAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const runSimulation = async () => {
    try {
      setLoading(true);
      const res = await api.runRedTeamSimulation(brief.id);
      setAnalysis(res);
    } catch (err) {
      console.error('Failed to run red team simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [brief.id]);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score > 60) return { bg: 'bg-rose-500', text: 'text-rose-600', badge: 'bg-rose-100 text-rose-800' };
    if (score > 35) return { bg: 'bg-amber-500', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-800' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-800' };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 shadow-2xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900">AI Red-Team Counter-Strategy Simulator</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full">
                  Adversarial AI
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Simulating competitor executive counter-attacks against: <span className="font-semibold text-zinc-700">"{brief.campaignAngle}"</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runSimulation}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 shadow-2xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-Simulate</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-200/80 rounded-xl text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-6">
          {loading || !analysis ? (
            <div className="p-12 text-center text-zinc-500 text-xs">
              <div className="animate-spin w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full mx-auto mb-3" />
              <span className="font-semibold text-zinc-700 block">Deploying Competitor Red-Team Agents...</span>
              <span className="text-zinc-400 text-[11px] mt-1 block">
                Simulating competitor marketing counter-narratives and sales objection traps.
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score & Counter-Attack Banner */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* Vulnerability Score Card */}
                <div className="md:col-span-4 p-5 rounded-2xl bg-zinc-950 text-white flex flex-col justify-between space-y-4 shadow-md">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Campaign Vulnerability Score
                    </span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-3xl font-black">{analysis.vulnerabilityScore}</span>
                      <span className="text-zinc-500 text-xs font-bold">/ 100</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ml-auto ${getScoreColor(analysis.vulnerabilityScore).badge}`}>
                        {analysis.vulnerabilityLevel} RISK
                      </span>
                    </div>

                    <div className="w-full bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getScoreColor(analysis.vulnerabilityScore).bg}`}
                        style={{ width: `${analysis.vulnerabilityScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-3">
                    <span className="font-semibold text-zinc-300 block">Identified Exposure:</span>
                    <p className="leading-snug">{analysis.vulnerabilityReasons[0]}</p>
                  </div>
                </div>

                {/* Anticipated Counter Attack */}
                <div className="md:col-span-8 p-5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-950 flex items-center gap-1.5">
                        <Swords className="w-4 h-4 text-rose-600" />
                        <span>Anticipated Competitor Counter-Attack Narrative</span>
                      </h4>
                      <button
                        onClick={() => handleCopy('counterAngle', analysis.counterAttackAngle)}
                        className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1"
                      >
                        {copiedKey === 'counterAngle' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Narrative</span>
                      </button>
                    </div>
                    <p className="text-xs text-zinc-800 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-rose-200/60 mt-2">
                      "{analysis.counterAttackAngle}"
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wide block">
                      3 Tactical Moves Competitor Will Make:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {analysis.anticipatedDefensiveMoves.map((m, idx) => (
                        <div key={idx} className="p-2 bg-white rounded-lg border border-rose-200/60 text-[11px] text-zinc-700 flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">{idx + 1}.</span>
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preemptive Defense Counter-Measures */}
              <div className="p-5 bg-indigo-50/40 rounded-2xl border border-indigo-200/80 space-y-3 text-xs">
                <h4 className="font-bold text-indigo-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Recommended Preemptive Fortifications (Implement Before Launch)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {analysis.preemptiveCountermeasures.map((p, idx) => (
                    <div key={idx} className="p-3.5 bg-white rounded-xl border border-indigo-100 space-y-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                        Action Vector {idx + 1}
                      </span>
                      <p className="text-zinc-800 font-medium">{p}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prospect Sales Objection & Verified Rebuttals */}
              <div className="space-y-3 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Anticipated Prospect Pushback &amp; Verified Rebuttal Talk Tracks</span>
                </h4>

                <div className="space-y-3">
                  {analysis.salesObjectionTalkTracks.map((talk, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                            Prospect Pushback #{idx + 1}
                          </span>
                          <p className="font-semibold text-zinc-900 mt-0.5">"{talk.objection}"</p>
                        </div>
                        <button
                          onClick={() => handleCopy(`rebuttal_${idx}`, talk.verifiedRebuttal)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
                        >
                          {copiedKey === `rebuttal_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Copy Script</span>
                        </button>
                      </div>

                      <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 space-y-1 text-emerald-950">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                          Verified Sales Rebuttal:
                        </span>
                        <p className="font-medium">{talk.verifiedRebuttal}</p>
                        <div className="text-[11px] text-emerald-800 pt-1 font-semibold flex items-center gap-1">
                          <span className="text-emerald-600">Proof Anchor:</span> {talk.evidenceProofPoint}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
