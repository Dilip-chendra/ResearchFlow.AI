import React from 'react';
import { ArrowRight, Layers, Eye, Target, Compass } from 'lucide-react';

export const CompetitiveIntelligenceSection: React.FC = () => {
  return (
    <section id="intelligence" className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-28">
      {/* 09. Competitive Intelligence Matrix */}
      {/* 09. Competitive Intelligence Matrix */}
      <div className="space-y-10">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[11px] sm:text-xs font-mono tracking-[0.24em] uppercase text-cyan-300 font-semibold drop-shadow-sm">
            09 &mdash; MARKET RECONNAISSANCE
          </div>
          <h2 className="text-[clamp(2.4rem,6vw,4.25rem)] font-display font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-[0_6px_36px_rgba(0,0,0,0.85)]">
            See the market as a system.
          </h2>
          <p className="text-lg sm:text-xl text-white/85 leading-relaxed font-sans-editorial drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            Competitors do not exist in isolation. ResearchFlow continuously correlates pricing models, feature velocity, audience shifts, and unaddressed market gaps into an active landscape matrix.
          </p>
        </div>

        {/* Matrix Visual: Desktop Table & Mobile Stacked Cards */}
        <div className="border border-white/15 rounded-3xl bg-white/[0.05] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3)] overflow-hidden text-xs">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-4 px-6 py-4 bg-white/[0.08] border-b border-white/15 font-mono text-xs text-white/90 font-semibold">
            <div>COMPETITOR & ENTITY</div>
            <div>POSITIONING ANGLE</div>
            <div>PRICING SPECTRUM</div>
            <div className="text-right">UNCOVERED GAP</div>
          </div>

          {/* Desktop Rows */}
          <div className="hidden md:block divide-y divide-white/10">
            <div className="grid grid-cols-4 px-6 py-4 items-center hover:bg-white/[0.08] transition-colors">
              <div className="font-semibold text-white">Legacy Enterprise Suite</div>
              <div className="text-white/80">All-in-one compliance suite</div>
              <div className="font-mono text-white/90 font-medium">$38,000+ / annual min</div>
              <div className="text-right text-emerald-300 font-mono text-xs font-semibold">Sub-50 team friction</div>
            </div>

            <div className="grid grid-cols-4 px-6 py-4 items-center hover:bg-white/[0.08] transition-colors">
              <div className="font-semibold text-white">AI Point Solution</div>
              <div className="text-white/80">Automated content generator</div>
              <div className="font-mono text-white/90 font-medium">$49 / user / mo</div>
              <div className="text-right text-emerald-300 font-mono text-xs font-semibold">Zero evidence grounding</div>
            </div>

            <div className="grid grid-cols-4 px-6 py-4 items-center hover:bg-white/[0.08] transition-colors">
              <div className="font-semibold text-white">Scraper Aggregator</div>
              <div className="text-white/80">Raw keyword SERP tracker</div>
              <div className="font-mono text-white/90 font-medium">$199 / mo flat</div>
              <div className="text-right text-emerald-300 font-mono text-xs font-semibold">No strategic synthesis</div>
            </div>

            <div className="grid grid-cols-4 px-6 py-4.5 items-center bg-cyan-500/15 border-t border-cyan-400/30">
              <div className="font-bold text-cyan-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                <span className="font-display tracking-wider">Your Opportunity</span>
              </div>
              <div className="text-white font-medium">Evidence-backed intelligence OS</div>
              <div className="font-mono text-cyan-200 font-semibold">Outcome-aligned value</div>
              <div className="text-right font-mono text-xs text-cyan-200 font-bold">
                High-confidence whitespace
              </div>
            </div>
          </div>

          {/* Mobile Stacked Competitor Cards (< 768px) */}
          <div className="block md:hidden divide-y divide-white/10">
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Legacy Enterprise Suite</span>
                <span className="text-emerald-300 font-mono text-[10px] px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/30 font-semibold">Sub-50 team friction</span>
              </div>
              <div className="text-xs text-white/80">All-in-one compliance suite</div>
              <div className="text-[11px] font-mono text-white/70">Pricing: <span className="text-white font-semibold">$38,000+ / annual min</span></div>
            </div>

            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">AI Point Solution</span>
                <span className="text-emerald-300 font-mono text-[10px] px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/30 font-semibold">Zero evidence grounding</span>
              </div>
              <div className="text-xs text-white/80">Automated content generator</div>
              <div className="text-[11px] font-mono text-white/70">Pricing: <span className="text-white font-semibold">$49 / user / mo</span></div>
            </div>

            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Scraper Aggregator</span>
                <span className="text-emerald-300 font-mono text-[10px] px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-400/30 font-semibold">No strategic synthesis</span>
              </div>
              <div className="text-xs text-white/80">Raw keyword SERP tracker</div>
              <div className="text-[11px] font-mono text-white/70">Pricing: <span className="text-white font-semibold">$199 / mo flat</span></div>
            </div>

            <div className="p-4.5 space-y-2.5 bg-cyan-500/15 border-t border-cyan-400/30">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                  <span className="font-display">Your Opportunity</span>
                </span>
                <span className="text-cyan-200 font-mono text-[10px] px-2.5 py-0.5 rounded bg-cyan-400/20 border border-cyan-400/40 font-bold">High-confidence whitespace</span>
              </div>
              <div className="text-xs text-white font-medium">Evidence-backed intelligence OS</div>
              <div className="text-[11px] font-mono text-cyan-200 font-semibold">Outcome-aligned value pricing</div>
            </div>
          </div>
        </div>
      </div>

      {/* 10. The Intelligence Layer */}
      <div className="space-y-8 pt-10 sm:pt-12 border-t border-white/15">
        <div className="space-y-3 max-w-2xl">
          <div className="text-[11px] sm:text-xs font-mono tracking-[0.24em] uppercase text-cyan-300/80 font-semibold drop-shadow-sm">
            10 &mdash; THE SYNTHESIS ENGINE
          </div>
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Raw findings are not intelligence.
          </h3>
          <p className="text-base sm:text-lg text-white/85 leading-relaxed font-sans-editorial drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            Data alone causes decision paralysis. ResearchFlow filters, normalizes, and connects isolated signals into concrete strategic conclusions.
          </p>
        </div>

        {/* 4-Step Synthesis Progression */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg hover:border-white/30 hover:bg-white/[0.08] transition-all space-y-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300 shadow-sm">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white tracking-wider">EVIDENCE</div>
              <div className="text-[11px] text-cyan-200/80 font-mono mt-0.5">Atomic verified claims</div>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-sans-editorial drop-shadow-sm">
              Discrete pricing tiers, published feature releases, and verbatim quotes.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg hover:border-white/30 hover:bg-white/[0.08] transition-all space-y-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300 shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white tracking-wider">PATTERN</div>
              <div className="text-[11px] text-cyan-200/80 font-mono mt-0.5">Market trend clustering</div>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-sans-editorial drop-shadow-sm">
              Recurring price increases, shifts toward enterprise tiers, and shared positioning tropes.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-lg hover:border-white/30 hover:bg-white/[0.08] transition-all space-y-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300 shadow-sm">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white tracking-wider">INSIGHT</div>
              <div className="text-[11px] text-cyan-200/80 font-mono mt-0.5">Competitive vulnerability</div>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-sans-editorial drop-shadow-sm">
              Incumbents abandoning mid-market teams creates immediate customer acquisition leverage.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-cyan-400/35 bg-cyan-500/10 backdrop-blur-xl shadow-[0_0_24px_rgba(56,189,248,0.2)] hover:border-cyan-400/50 transition-all space-y-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-200 shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-cyan-200 tracking-wider">OPPORTUNITY</div>
              <div className="text-[11px] text-cyan-300 font-mono mt-0.5">Strategic positioning angle</div>
            </div>
            <p className="text-xs text-white leading-relaxed font-sans-editorial drop-shadow-sm font-medium">
              Launch targeted campaigns framing your product as the lightweight, modern alternative.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
