import React from 'react';
import { ArrowRight, Layers, Eye, Target, Compass } from 'lucide-react';

export const CompetitiveIntelligenceSection: React.FC = () => {
  return (
    <section id="intelligence" className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-28">
      {/* 09. Competitive Intelligence Matrix */}
      <div className="space-y-10">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#9CCBFF]/70">
            09 &mdash; MARKET RECONNAISSANCE
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight leading-[1.15]">
            See the market as a system.
          </h2>
          <p className="text-base sm:text-lg text-[#A8AFBA] leading-relaxed">
            Competitors do not exist in isolation. ResearchFlow continuously correlates pricing models, feature velocity, audience shifts, and unaddressed market gaps into an active landscape matrix.
          </p>
        </div>

        {/* Matrix Visual: Desktop Table & Mobile Stacked Cards */}
        <div className="border border-[#727A86]/20 rounded-2xl bg-[#07090C]/80 backdrop-blur-md overflow-hidden text-xs">
          {/* Desktop Table Header */}
          <div className="hidden md:grid grid-cols-4 px-6 py-3.5 bg-[#050608] border-b border-[#727A86]/20 font-mono text-[11px] text-[#727A86]">
            <div>COMPETITOR & ENTITY</div>
            <div>POSITIONING ANGLE</div>
            <div>PRICING SPECTRUM</div>
            <div className="text-right">UNCOVERED GAP</div>
          </div>

          {/* Desktop Rows */}
          <div className="hidden md:block divide-y divide-[#727A86]/10">
            <div className="grid grid-cols-4 px-6 py-4 items-center hover:bg-[#9CCBFF]/5 transition-colors">
              <div className="font-medium text-[#F3F5F7]">Legacy Enterprise Suite</div>
              <div className="text-[#A8AFBA]">All-in-one compliance suite</div>
              <div className="font-mono text-[#F3F5F7]">$38,000+ / annual min</div>
              <div className="text-right text-emerald-400 font-mono text-[11px]">Sub-50 team friction</div>
            </div>

            <div className="grid grid-cols-4 px-6 py-4 items-center hover:bg-[#9CCBFF]/5 transition-colors">
              <div className="font-medium text-[#F3F5F7]">AI Point Solution</div>
              <div className="text-[#A8AFBA]">Automated content generator</div>
              <div className="font-mono text-[#F3F5F7]">$49 / user / mo</div>
              <div className="text-right text-emerald-400 font-mono text-[11px]">Zero evidence grounding</div>
            </div>

            <div className="grid grid-cols-4 px-6 py-4 items-center hover:bg-[#9CCBFF]/5 transition-colors">
              <div className="font-medium text-[#F3F5F7]">Scraper Aggregator</div>
              <div className="text-[#A8AFBA]">Raw keyword SERP tracker</div>
              <div className="font-mono text-[#F3F5F7]">$199 / mo flat</div>
              <div className="text-right text-emerald-400 font-mono text-[11px]">No strategic synthesis</div>
            </div>

            <div className="grid grid-cols-4 px-6 py-4 items-center bg-[#9CCBFF]/10 border-t border-[#9CCBFF]/30">
              <div className="font-semibold text-[#9CCBFF] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9CCBFF]" />
                <span>Your Opportunity</span>
              </div>
              <div className="text-[#F3F5F7]">Evidence-backed intelligence OS</div>
              <div className="font-mono text-[#9CCBFF]">Outcome-aligned value</div>
              <div className="text-right font-mono text-[11px] text-[#9CCBFF] font-semibold">
                High-confidence whitespace
              </div>
            </div>
          </div>

          {/* Mobile Stacked Competitor Cards (< 768px) */}
          <div className="block md:hidden divide-y divide-[#727A86]/15">
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#F3F5F7]">Legacy Enterprise Suite</span>
                <span className="text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Sub-50 team friction</span>
              </div>
              <div className="text-xs text-[#A8AFBA]">All-in-one compliance suite</div>
              <div className="text-[11px] font-mono text-[#727A86]">Pricing: <span className="text-[#F3F5F7]">$38,000+ / annual min</span></div>
            </div>

            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#F3F5F7]">AI Point Solution</span>
                <span className="text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Zero evidence grounding</span>
              </div>
              <div className="text-xs text-[#A8AFBA]">Automated content generator</div>
              <div className="text-[11px] font-mono text-[#727A86]">Pricing: <span className="text-[#F3F5F7]">$49 / user / mo</span></div>
            </div>

            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#F3F5F7]">Scraper Aggregator</span>
                <span className="text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">No strategic synthesis</span>
              </div>
              <div className="text-xs text-[#A8AFBA]">Raw keyword SERP tracker</div>
              <div className="text-[11px] font-mono text-[#727A86]">Pricing: <span className="text-[#F3F5F7]">$199 / mo flat</span></div>
            </div>

            <div className="p-4 space-y-2.5 bg-[#9CCBFF]/10 border-t border-[#9CCBFF]/30">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#9CCBFF] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9CCBFF]" />
                  <span>Your Opportunity</span>
                </span>
                <span className="text-[#9CCBFF] font-mono text-[10px] px-2 py-0.5 rounded bg-[#9CCBFF]/20 border border-[#9CCBFF]/30 font-semibold">High-confidence whitespace</span>
              </div>
              <div className="text-xs text-[#F3F5F7]">Evidence-backed intelligence OS</div>
              <div className="text-[11px] font-mono text-[#9CCBFF]">Outcome-aligned value pricing</div>
            </div>
          </div>
        </div>
      </div>

      {/* 10. The Intelligence Layer */}
      <div className="space-y-8 pt-10 border-t border-[#727A86]/20">
        <div className="space-y-3 max-w-2xl">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#727A86]">
            10 &mdash; THE SYNTHESIS ENGINE
          </div>
          <h3 className="text-2xl sm:text-4xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight">
            Raw findings are not intelligence.
          </h3>
          <p className="text-sm sm:text-base text-[#A8AFBA] leading-relaxed">
            Data alone causes decision paralysis. ResearchFlow filters, normalizes, and connects isolated signals into concrete strategic conclusions.
          </p>
        </div>

        {/* 4-Step Synthesis Progression */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-5 rounded-xl border border-[#727A86]/20 bg-[#07090C]/50 space-y-3">
            <div className="w-7 h-7 rounded-lg bg-[#050608] border border-[#727A86]/30 flex items-center justify-center text-[#9CCBFF]">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-[#F3F5F7]">EVIDENCE</div>
              <div className="text-[11px] text-[#727A86] mt-0.5">Atomic verified claims</div>
            </div>
            <p className="text-[11px] text-[#A8AFBA] leading-relaxed">
              Discrete pricing tiers, published feature releases, and verbatim quotes.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[#727A86]/20 bg-[#07090C]/50 space-y-3">
            <div className="w-7 h-7 rounded-lg bg-[#050608] border border-[#727A86]/30 flex items-center justify-center text-[#9CCBFF]">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-[#F3F5F7]">PATTERN</div>
              <div className="text-[11px] text-[#727A86] mt-0.5">Market trend clustering</div>
            </div>
            <p className="text-[11px] text-[#A8AFBA] leading-relaxed">
              Recurring price increases, shifts toward enterprise tiers, and shared positioning tropes.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[#727A86]/20 bg-[#07090C]/50 space-y-3">
            <div className="w-7 h-7 rounded-lg bg-[#050608] border border-[#727A86]/30 flex items-center justify-center text-[#9CCBFF]">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-[#F3F5F7]">INSIGHT</div>
              <div className="text-[11px] text-[#727A86] mt-0.5">Competitive vulnerability</div>
            </div>
            <p className="text-[11px] text-[#A8AFBA] leading-relaxed">
              Incumbents abandoning mid-market teams creates immediate customer acquisition leverage.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[#9CCBFF]/30 bg-[#9CCBFF]/5 space-y-3">
            <div className="w-7 h-7 rounded-lg bg-[#050608] border border-[#9CCBFF]/40 flex items-center justify-center text-[#9CCBFF]">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-[#9CCBFF]">OPPORTUNITY</div>
              <div className="text-[11px] text-[#A8AFBA] mt-0.5">Strategic positioning angle</div>
            </div>
            <p className="text-[11px] text-[#F3F5F7] leading-relaxed">
              Launch targeted campaigns framing your product as the lightweight, modern alternative.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
