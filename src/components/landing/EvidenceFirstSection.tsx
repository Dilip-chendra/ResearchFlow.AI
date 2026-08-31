import React, { useState } from 'react';
import { ShieldCheck, Link2, CheckCircle2, AlertTriangle, Lightbulb, Compass, ArrowRight, ExternalLink } from 'lucide-react';

export const EvidenceFirstSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fact' | 'inference' | 'recommendation'>('fact');

  return (
    <section id="evidence" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-[#080A10]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
            Zero-Hallucination Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            AI that can show its work.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Generic chatbots invent competitor pricing and assert unverified claims. ResearchFlow enforces an immutable citation graph where every strategic insight traces back to raw, extracted source evidence.
          </p>
        </div>

        {/* Evidence Traceability Interactive Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Traceability Chain Visualization */}
          <div className="lg:col-span-7 space-y-4">
            {/* Step A: Atomic Claim */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 relative shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  1. Structured Claim
                </span>
                <span className="text-[10px] font-mono text-zinc-500">ID: ev_job102_1</span>
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">
                "Starter plan is $19/month when billed annually; month-to-month flexibility is $29/seat."
              </h4>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400 font-mono">
                <span>Normalized Value: <strong>$19/mo</strong></span>
                <span>·</span>
                <span>Category: <strong>Pricing</strong></span>
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="flex justify-center -my-2 relative z-10">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-emerald-400 shadow-md">
                <ArrowRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            {/* Step B: Supporting Evidence Quote */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 relative shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  2. Verbatim Supporting Snippet
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Match</span>
              </div>
              <blockquote className="text-xs text-zinc-300 italic bg-black/40 p-3 rounded-xl border border-zinc-800/80 leading-relaxed font-mono">
                "Save 30% with annual billing ($19/mo billed as one payment of $228/year). Monthly plan starts at $29/mo billed monthly."
              </blockquote>
            </div>

            {/* Connecting Arrow */}
            <div className="flex justify-center -my-2 relative z-10">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-emerald-400 shadow-md">
                <ArrowRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            {/* Step C: Provenance Source URL */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                  3. Verified Origin Source
                </span>
                <span className="text-[10px] font-mono text-emerald-400">HTTP 200 OK</span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Link2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-zinc-300 font-mono truncate">
                    https://novoresume.com/career-blog/pricing
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0 font-mono">Crawled 12s ago</span>
              </div>
            </div>
          </div>

          {/* Right Column: Taxonomy of Evidence Types */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white font-display">
                Clear distinction between Facts, Inferences, and Recommendations.
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Many AI tools blur the line between what a competitor actually published and what the AI guessed. ResearchFlow isolates every claim into strict epistemological types.
              </p>
            </div>

            {/* Evidence Type Tabs */}
            <div className="space-y-3">
              <div
                onClick={() => setActiveTab('fact')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all text-xs space-y-1.5 ${
                  activeTab === 'fact'
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>FACT (Direct Verbatim Citation)</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                    High Confidence
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Directly quoted or mathematically normalized from visible source text. Zero creative interpretation.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('inference')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all text-xs space-y-1.5 ${
                  activeTab === 'inference'
                    ? 'bg-indigo-950/30 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-indigo-400" />
                    <span>INFERENCE (Logical Deductions)</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded">
                    Medium Confidence
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Reasoned deductions (e.g. absence of monthly pricing suggests heavy push for annual upfront cashflow).
                </p>
              </div>

              <div
                onClick={() => setActiveTab('recommendation')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all text-xs space-y-1.5 ${
                  activeTab === 'recommendation'
                    ? 'bg-purple-950/30 border-purple-500/50 shadow-md ring-1 ring-purple-500/30'
                    : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-purple-400" />
                    <span>RECOMMENDATION (Strategic Angles)</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                    Actionable Output
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Proposed positioning angles and channel tactics backed by explicit evidence IDs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
