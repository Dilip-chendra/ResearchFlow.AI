import React from 'react';
import { ExternalLink, CheckCircle2, AlertCircle, HelpCircle, AlertTriangle } from 'lucide-react';

export const EvidenceProvenanceSection: React.FC = () => {
  return (
    <section id="evidence" className="relative py-[clamp(4.5rem,10vh,8rem)] px-5 sm:px-10 md:px-12 max-w-5xl mx-auto w-full space-y-20 sm:space-y-24">
      {/* 06. Evidence Provenance */}
      <div className="space-y-8 sm:space-y-10">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-[#9CCBFF]/70">
            06 &mdash; PROVENANCE & GROUNDING
          </div>
          <h2 className="text-[clamp(1.85rem,5vw,3.5rem)] font-sans-editorial font-medium text-[#F3F5F7] tracking-tight leading-[1.15]">
            Every important claim needs a trail.
          </h2>
          <p className="text-base sm:text-lg text-[#A8AFBA] leading-relaxed">
            Market intelligence without verifiable citations is dangerous speculation. ResearchFlow anchors every strategic claim to exact verbatim source text and canonical URLs.
          </p>
        </div>

        {/* Chain of Custody Diagram */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#727A86]/20 bg-[#07090C]/75 backdrop-blur-md space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pb-3 border-b border-[#727A86]/15">
            <span className="text-[#A8AFBA]">CHAIN OF CUSTODY VERIFICATION</span>
            <span className="text-[#9CCBFF]">ZERO UNGROUNDED CLAIMS</span>
          </div>

          {/* Realistic Verified Evidence Item */}
          <div className="space-y-4 text-xs font-mono min-w-0">
            <div className="flex items-center gap-2 text-[#727A86] min-w-0">
              <span className="px-2 py-0.5 rounded bg-[#9CCBFF]/10 text-[#9CCBFF] border border-[#9CCBFF]/20 shrink-0">
                SOURCE
              </span>
              <span className="truncate min-w-0 break-all text-[11px] sm:text-xs">
                https://workday.com/en-us/products/talent-management/pricing
              </span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto text-[#727A86] shrink-0" />
            </div>

            <div className="p-4 rounded-lg bg-[#050608] border border-[#727A86]/25 space-y-1.5">
              <div className="text-[10px] sm:text-[11px] text-[#727A86] uppercase tracking-wider">Verbatim Extracted Quote:</div>
              <p className="text-xs sm:text-sm font-sans text-[#F3F5F7] italic leading-relaxed">
                &ldquo;Enterprise subscription contracts require an annual minimum spend of $42,000 billed annually upfront for core talent modules.&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg border border-[#727A86]/20 bg-[#07090C]/50 space-y-1">
                <div className="text-[10px] text-[#727A86]">SYNTHESIZED CLAIM</div>
                <div className="text-xs font-sans text-[#F3F5F7]">High entry floor excludes sub-100 employee firms</div>
              </div>
              <div className="p-3 rounded-lg border border-[#727A86]/20 bg-[#07090C]/50 space-y-1">
                <div className="text-[10px] text-[#727A86]">EVIDENCE CATEGORY</div>
                <div className="text-xs font-sans text-[#9CCBFF]">FACT (Directly grounded)</div>
              </div>
              <div className="p-3 rounded-lg border border-[#727A86]/20 bg-[#07090C]/50 space-y-1">
                <div className="text-[10px] text-[#727A86]">CONFIDENCE LEVEL</div>
                <div className="text-xs font-sans text-emerald-400 font-semibold">HIGH CONFIDENCE</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Classification Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#07090C]/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#F3F5F7]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>FACT</span>
            </div>
            <p className="text-[11px] text-[#A8AFBA] leading-relaxed font-sans">
              Directly supported by verbatim, verified source text without speculation.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#07090C]/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#9CCBFF]">
              <HelpCircle className="w-3.5 h-3.5 text-[#9CCBFF] shrink-0" />
              <span>INFERENCE</span>
            </div>
            <p className="text-[11px] text-[#A8AFBA] leading-relaxed font-sans">
              Synthesized logically from cross-source market movement and feature deltas.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#07090C]/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#738BFF]">
              <AlertCircle className="w-3.5 h-3.5 text-[#738BFF] shrink-0" />
              <span>RECOMMENDATION</span>
            </div>
            <p className="text-[11px] text-[#A8AFBA] leading-relaxed font-sans">
              Defensible positioning guidance derived directly from validated evidence.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#07090C]/40 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>WARNING</span>
            </div>
            <p className="text-[11px] text-[#A8AFBA] leading-relaxed font-sans">
              Discrepancy or ambiguous pricing claim requiring human operator inspection.
            </p>
          </div>
        </div>
      </div>

      {/* 07. Confidence Model */}
      <div className="space-y-6 pt-8 sm:pt-10 border-t border-[#727A86]/20 max-w-3xl">
        <div className="space-y-3">
          <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-[#727A86]">
            07 &mdash; CONFIDENCE SCORING
          </div>
          <h3 className="text-xl sm:text-3xl md:text-4xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight">
            Know what the system knows.
          </h3>
          <p className="text-sm sm:text-base text-[#A8AFBA] leading-relaxed">
            ResearchFlow does not invent pseudo-scientific percentage decimals. Every claim is assigned a categorical confidence tier based on source authority, retrieval recency, and cross-source agreement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-950/15 space-y-1">
            <div className="text-emerald-400 font-semibold">HIGH CONFIDENCE</div>
            <div className="text-[#A8AFBA] text-[11px] font-sans">Primary source verified, recent retrieval date, corroborating quotes</div>
          </div>
          <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-950/15 space-y-1">
            <div className="text-blue-300 font-semibold">MEDIUM CONFIDENCE</div>
            <div className="text-[#A8AFBA] text-[11px] font-sans">Secondary directory or partial text match, awaiting confirmation</div>
          </div>
          <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-950/15 space-y-1">
            <div className="text-amber-300 font-semibold">LOW CONFIDENCE</div>
            <div className="text-[#A8AFBA] text-[11px] font-sans">Outdated citation or single uncorroborated mention</div>
          </div>
        </div>
      </div>
    </section>
  );
};
