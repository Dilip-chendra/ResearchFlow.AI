import React from 'react';
import { UserCheck, ShieldCheck, Check, X, Edit3, ArrowDown } from 'lucide-react';

export const HumanInTheLoopSection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-[#080A10]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">
            Human-in-the-Loop Governance
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            AI moves fast. Humans make the final call.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Autonomous systems that publish unchecked marketing copy create brand risk. ResearchFlow positions AI as a high-velocity intelligence copilot while keeping operators firmly in control of strategic approvals.
          </p>
        </div>

        {/* The Review Governance Flow Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: AI Recommendation Card */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                1. Synthesized AI Recommendation
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                AWAITING HUMAN REVIEW
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Recommended Angle</span>
              <p className="text-sm font-bold text-white leading-snug">
                "Direct challenger positioning against Novoresume's 30% annual billing markup."
              </p>
            </div>

            <div className="p-3.5 bg-zinc-900/70 rounded-xl border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Grounded Evidence Claims</span>
                <span className="text-emerald-400 font-mono font-bold">3 Verified Citations</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Model Confidence Level</span>
                <span className="text-indigo-300 font-mono font-bold">HIGH (94%)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Limitation / Flag</span>
                <span className="text-amber-400 font-mono">Competitor may adjust pricing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Operator Decision Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white font-display">
                Three Decisive Operator Actions
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Reviewers have full autonomy to inspect citations, modify copy, or reject proposals before any execution tasks are generated.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">APPROVE STRATEGY</span>
                  <span className="text-zinc-300 text-[11px]">
                    Locks brief, updates audit log, and automatically generates prioritized execution tasks on the Kanban board.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">EDIT & FINE-TUNE</span>
                  <span className="text-zinc-400 text-[11px]">
                    Manually adjust headlines, target audience segments, or channel copy while preserving citation traceability.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                  <X className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">REJECT WITH NOTES</span>
                  <span className="text-zinc-400 text-[11px]">
                    Reject the brief with operator feedback; no execution tasks are created.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
