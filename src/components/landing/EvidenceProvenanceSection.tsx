import React from 'react';
import { ExternalLink, CheckCircle2, AlertCircle, HelpCircle, AlertTriangle } from 'lucide-react';

export const EvidenceProvenanceSection: React.FC = () => {
  return (
    <section id="evidence" className="relative py-[clamp(4.5rem,10vh,8rem)] px-5 sm:px-10 md:px-12 max-w-5xl mx-auto w-full space-y-20 sm:space-y-24">
      {/* 06. Evidence Provenance */}
      <div className="space-y-8 sm:space-y-10">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[11px] sm:text-xs font-mono tracking-[0.24em] uppercase text-cyan-300 font-semibold drop-shadow-sm">
            06 &mdash; PROVENANCE & GROUNDING
          </div>
          <h2 className="text-[clamp(2.4rem,6vw,4.25rem)] font-display font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-[0_6px_36px_rgba(0,0,0,0.85)]">
            Every important claim needs a trail.
          </h2>
          <p className="text-lg sm:text-xl text-white/85 leading-relaxed font-sans-editorial drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            Market intelligence without verifiable citations is dangerous speculation. ResearchFlow anchors every strategic claim to exact verbatim source text and canonical URLs.
          </p>
        </div>

        {/* Chain of Custody Diagram */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3)] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pb-4 border-b border-white/15">
            <span className="text-white/80 font-semibold tracking-wider">CHAIN OF CUSTODY VERIFICATION</span>
            <span className="px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-200 font-semibold shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              ZERO UNGROUNDED CLAIMS
            </span>
          </div>

          {/* Realistic Verified Evidence Item */}
          <div className="space-y-4 text-xs font-mono min-w-0">
            <div className="flex items-center gap-2.5 text-white/80 min-w-0">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 font-semibold shrink-0">
                SOURCE
              </span>
              <span className="truncate min-w-0 break-all text-xs font-mono text-cyan-100">
                https://workday.com/en-us/products/talent-management/pricing
              </span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto text-white/70 shrink-0" />
            </div>

            <div className="p-5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 space-y-2">
              <div className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider font-semibold">Verbatim Extracted Quote:</div>
              <p className="text-sm sm:text-base font-sans-editorial text-white italic leading-relaxed drop-shadow-sm">
                &ldquo;Enterprise subscription contracts require an annual minimum spend of $42,000 billed annually upfront for core talent modules.&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md space-y-1">
                <div className="text-[10px] font-mono text-white/60">SYNTHESIZED CLAIM</div>
                <div className="text-xs font-sans-editorial text-white font-medium">High entry floor excludes sub-100 employee firms</div>
              </div>
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md space-y-1">
                <div className="text-[10px] font-mono text-cyan-300">EVIDENCE CATEGORY</div>
                <div className="text-xs font-sans-editorial text-cyan-100 font-medium">FACT (Directly grounded)</div>
              </div>
              <div className="p-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 backdrop-blur-md space-y-1">
                <div className="text-[10px] font-mono text-emerald-300">CONFIDENCE LEVEL</div>
                <div className="text-xs font-sans-editorial text-emerald-300 font-bold">HIGH CONFIDENCE</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Classification Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl space-y-2 shadow-lg hover:border-white/30 hover:bg-white/[0.08] transition-all">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 shadow-[0_0_8px_#34d399]" />
              <span>FACT</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-sans-editorial drop-shadow-sm">
              Directly supported by verbatim, verified source text without speculation.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl space-y-2 shadow-lg hover:border-white/30 hover:bg-white/[0.08] transition-all">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300">
              <HelpCircle className="w-4 h-4 text-cyan-300 shrink-0 shadow-[0_0_8px_#67e8f9]" />
              <span>INFERENCE</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-sans-editorial drop-shadow-sm">
              Synthesized logically from cross-source market movement and feature deltas.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl space-y-2 shadow-lg hover:border-white/30 hover:bg-white/[0.08] transition-all">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-blue-300">
              <AlertCircle className="w-4 h-4 text-blue-300 shrink-0 shadow-[0_0_8px_#93c5fd]" />
              <span>RECOMMENDATION</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-sans-editorial drop-shadow-sm">
              Defensible positioning guidance derived directly from validated evidence.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl space-y-2 shadow-lg hover:border-white/30 hover:bg-white/[0.08] transition-all">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 shadow-[0_0_8px_#fcd34d]" />
              <span>WARNING</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-sans-editorial drop-shadow-sm">
              Discrepancy or ambiguous pricing claim requiring human operator inspection.
            </p>
          </div>
        </div>
      </div>

      {/* 07. Confidence Model */}
      <div className="space-y-6 pt-10 sm:pt-12 border-t border-white/15 max-w-3xl">
        <div className="space-y-3">
          <div className="text-[11px] sm:text-xs font-mono tracking-[0.24em] uppercase text-cyan-300/80 font-semibold drop-shadow-sm">
            07 &mdash; CONFIDENCE SCORING
          </div>
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Know what the system knows.
          </h3>
          <p className="text-base sm:text-lg text-white/85 leading-relaxed font-sans-editorial drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            ResearchFlow does not invent pseudo-scientific percentage decimals. Every claim is assigned a categorical confidence tier based on source authority, retrieval recency, and cross-source agreement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 backdrop-blur-xl space-y-1.5 shadow-lg">
            <div className="text-emerald-300 font-bold text-sm">HIGH CONFIDENCE</div>
            <div className="text-white/80 text-xs font-sans-editorial">Primary source verified, recent retrieval date, corroborating quotes</div>
          </div>
          <div className="p-5 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 backdrop-blur-xl space-y-1.5 shadow-lg">
            <div className="text-cyan-200 font-bold text-sm">MEDIUM CONFIDENCE</div>
            <div className="text-white/80 text-xs font-sans-editorial">Secondary directory or partial text match, awaiting confirmation</div>
          </div>
          <div className="p-5 rounded-2xl border border-amber-400/30 bg-amber-500/10 backdrop-blur-xl space-y-1.5 shadow-lg">
            <div className="text-amber-200 font-bold text-sm">LOW CONFIDENCE</div>
            <div className="text-white/80 text-xs font-sans-editorial">Outdated citation or single uncorroborated mention</div>
          </div>
        </div>
      </div>
    </section>
  );
};
