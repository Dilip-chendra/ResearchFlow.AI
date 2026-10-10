import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, ShieldCheck, Zap, FileSpreadsheet, EyeOff, Layers, ArrowRight } from 'lucide-react';

export const ProblemVsSolutionSection: React.FC = () => {
  return (
    <section id="problem" className="relative py-20 sm:py-28 px-5 sm:px-10 md:px-12 max-w-6xl mx-auto w-full">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-[#F5D77F] text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(212,175,55,0.2)]">
          <AlertTriangle className="w-3.5 h-3.5 text-[#F5D77F]" />
          <span>The Market Intelligence Gap</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-stylish-heading italic font-normal text-white tracking-normal leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
          Manual research is broken.{' '}
          <span className="text-gold-gradient block sm:inline">Generic AI hallucinates.</span>
        </h2>

        <p className="text-base sm:text-lg text-white/80 font-editorial leading-relaxed drop-shadow-sm">
          Strategy teams spend 4+ hours per sprint cross-referencing competitor websites, pricing tables, and spreadsheets &mdash; only to build high-stakes GTM campaigns on unverified assertions.
        </p>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* The Broken Way */}
        <div className="relative rounded-3xl border border-rose-500/25 bg-gradient-to-b from-rose-950/20 via-black/60 to-black/80 backdrop-blur-xl p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.7)] flex flex-col justify-between space-y-8 group hover:border-rose-500/40 transition-colors">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-rose-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-sm">
                  &times;
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">The Legacy Approach</h3>
                  <p className="text-xs text-rose-300/80 font-mono">Manual Labor &amp; Unchecked Hallucinations</p>
                </div>
              </div>
              <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold">
                High Risk
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/40 border border-rose-500/15">
                <Clock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">4+ Hours per Sprint</h4>
                  <p className="text-xs text-white/70 leading-relaxed mt-0.5">
                    Product marketing teams manually comb through 20+ competitor URLs, changelogs, and pricing tiers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/40 border border-rose-500/15">
                <EyeOff className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Fabricated AI Pricing &amp; Features</h4>
                  <p className="text-xs text-white/70 leading-relaxed mt-0.5">
                    General-purpose LLMs fabricate competitor pricing, hallucinate non-existent features, and cannot provide sources.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/40 border border-rose-500/15">
                <FileSpreadsheet className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Stale Google Docs &amp; Spreadsheets</h4>
                  <p className="text-xs text-white/70 leading-relaxed mt-0.5">
                    Intelligence sits idle in static spreadsheets that are out of date the minute a competitor changes a tier.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/40 border border-rose-500/15">
                <Layers className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Disconnected from Execution</h4>
                  <p className="text-xs text-white/70 leading-relaxed mt-0.5">
                    Insights never translate into marketing battlecards, campaign copy, or actionable engineering tasks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-rose-500/15 flex items-center justify-between text-xs text-rose-300 font-mono">
            <span>Result: Costly blindspots</span>
            <span>$45,000/yr legacy lock-in</span>
          </div>
        </div>

        {/* The ResearchFlow Standard */}
        <div className="relative rounded-3xl border border-amber-400/40 bg-gradient-to-b from-amber-950/25 via-black/70 to-black/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(212,175,55,0.2)] flex flex-col justify-between space-y-8 group hover:border-amber-400/60 transition-colors">
          {/* Subtle Ambient Gold Glow */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between pb-4 border-b border-amber-400/25">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-[#F5D77F] font-bold text-sm shadow-[0_0_12px_rgba(212,175,55,0.3)]">
                  &check;
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">The ResearchFlow Standard</h3>
                  <p className="text-xs text-[#F5D77F] font-mono">Autonomous Verifiable Grounding &amp; Closed-Loop GTM</p>
                </div>
              </div>
              <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                Autonomous
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/50 border border-amber-400/20 hover:border-amber-400/35 transition-colors">
                <Zap className="w-5 h-5 text-[#F5D77F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">~12 Minutes to Full Intelligence</h4>
                  <p className="text-xs text-white/75 leading-relaxed mt-0.5">
                    Autonomous web crawler visits competitor domains, extracts structured claims, and synthesizes battlecards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/50 border border-amber-400/20 hover:border-amber-400/35 transition-colors">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">100% Cryptographic Claim Citations</h4>
                  <p className="text-xs text-white/75 leading-relaxed mt-0.5">
                    Zero hallucinations. Every claim cites an exact verbatim snippet, character position, and timestamped URL.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/50 border border-amber-400/20 hover:border-amber-400/35 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-[#F5D77F] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Cross-Source Conflict Radar</h4>
                  <p className="text-xs text-white/75 leading-relaxed mt-0.5">
                    Automatically catches contradictions between competitor pricing tiers and their fine-print SLA guarantees.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-black/50 border border-amber-400/20 hover:border-amber-400/35 transition-colors">
                <ArrowRight className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">1-Click Multi-Channel Campaign Handoff</h4>
                  <p className="text-xs text-white/75 leading-relaxed mt-0.5">
                    Approving findings immediately drafts LinkedIn posts, cold outreach sequences, and prioritized Kanban tasks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-amber-400/20 flex items-center justify-between text-xs text-[#F5D77F] font-mono relative z-10">
            <span>Velocity: 95% Faster Research</span>
            <span>Zero Hallucinations</span>
          </div>
        </div>
      </div>
    </section>
  );
};
