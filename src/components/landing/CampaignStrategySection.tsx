import React from 'react';
import { Check, Edit3, X, ArrowRight, Layers, Mail, Search, FileText } from 'lucide-react';

export const CampaignStrategySection: React.FC = () => {
  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-28">
      {/* 13. Campaign Strategy */}
      <div className="space-y-10">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#F5D77F] font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            13 &mdash; STRATEGY & ASSET GENERATION
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Turn market intelligence into a plan.
          </h2>
          <p className="text-base sm:text-lg text-white/85 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] font-sans-editorial">
            ResearchFlow transforms validated evidence into sharp go-to-market angles, channel-specific messaging assets, and high-impact distribution plans.
          </p>
        </div>

        {/* Real Campaign Hub UI Composition */}
        <div className="p-6 sm:p-8 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.3)] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 text-xs font-mono">
            <span className="text-white/80 font-medium">CAMPAIGN BRIEF: ENTERPRISE ALTERNATIVE POSITIONING</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-[#F5D77F] font-bold">
              AWAITING REVIEW
            </span>
          </div>

          {/* Strategic Angle Lab */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-white/60 uppercase tracking-wider">
              Selected Strategic Angle:
            </div>
            <div className="p-4 rounded-xl border border-amber-400/30 bg-amber-500/10 backdrop-blur-md flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-sans font-semibold text-white">
                  &ldquo;Stop Settling for Fragmented Vendor Promises&rdquo;
                </div>
                <p className="text-xs text-white/80 mt-1 font-sans">
                  Targeting engineering leaders dissatisfied with heavyweight annual lock-ins and disjointed analytics dashboards.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold whitespace-nowrap">
                94% CONFIDENCE
              </span>
            </div>
          </div>

          {/* 3 Channel Draft Previews */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl border border-white/10 bg-black/25 space-y-2 hover:border-amber-400/30 transition-all">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#F5D77F] font-bold">
                <FileText className="w-3.5 h-3.5" />
                <span>LINKEDIN ASSET</span>
              </div>
              <p className="text-xs text-white/90 line-clamp-3 font-sans">
                &ldquo;Why 73% of engineering teams are abandoning monolithic market monitoring suites for unified evidence pipelines...&rdquo;
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-black/25 space-y-2 hover:border-amber-400/30 transition-all">
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-200 font-bold">
                <Mail className="w-3.5 h-3.5" />
                <span>OUTBOUND EMAIL</span>
              </div>
              <p className="text-xs text-white/90 line-clamp-3 font-sans">
                Subject: Quick question about your competitor tracking stack &middot; 3-step value sequence with verified benchmarks.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-black/25 space-y-2 hover:border-amber-400/30 transition-all">
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 font-bold">
                <Search className="w-3.5 h-3.5" />
                <span>SEO PILLAR</span>
              </div>
              <p className="text-xs text-white/90 line-clamp-3 font-sans">
                Long-tail comparison teardown targeting high-intent decision queries: &ldquo;Best alternative to legacy suites 2026&rdquo;.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 14. Human Review & 15. Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-amber-400/20">
        {/* Human Review */}
        <div className="space-y-4">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#F5D77F] font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            14 &mdash; HUMAN-IN-THE-LOOP GOVERNANCE
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            AI proposes. People decide.
          </h3>
          <p className="text-sm text-white/80 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] font-sans-editorial">
            No campaign or message is ever deployed automatically. Operators review the supporting citations, edit copy inline, adjust angles, or reject briefs with one click.
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-2 text-xs font-mono">
            <span className="h-9 px-3.5 rounded-lg border border-emerald-400/40 bg-emerald-500/15 text-emerald-300 backdrop-blur-md inline-flex items-center gap-1.5 cursor-default font-medium">
              <Check className="w-3.5 h-3.5" /> Approve Brief
            </span>
            <span className="h-9 px-3.5 rounded-lg border border-white/20 bg-white/[0.08] text-white/90 backdrop-blur-md inline-flex items-center gap-1.5 cursor-default font-medium">
              <Edit3 className="w-3.5 h-3.5" /> Edit Copy
            </span>
            <span className="h-9 px-3.5 rounded-lg border border-rose-400/40 bg-rose-500/15 text-rose-300 backdrop-blur-md inline-flex items-center gap-1.5 cursor-default font-medium">
              <X className="w-3.5 h-3.5" /> Reject
            </span>
          </div>
        </div>

        {/* Action & Kanban */}
        <div className="space-y-4">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#F5D77F] font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            15 &mdash; ACTIONABLE EXECUTION
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Research should end with a decision.
          </h3>
          <p className="text-sm text-white/80 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] font-sans-editorial">
            Approval automatically populates execution tasks directly into your workflow Kanban, categorized by priority and channel.
          </p>

          <div className="space-y-2 text-xs font-mono pt-2">
            <div className="p-3 rounded-lg border border-white/10 bg-black/25 flex items-center justify-between hover:border-amber-400/30 transition-all">
              <span className="text-white font-medium">Deploy LinkedIn Thought Leadership Angle</span>
              <span className="text-[10px] text-amber-300 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 font-semibold">HIGH</span>
            </div>
            <div className="p-3 rounded-lg border border-white/10 bg-black/25 flex items-center justify-between hover:border-amber-400/30 transition-all">
              <span className="text-white font-medium">Configure 3-Step Outbound Sequence in Outreach Tool</span>
              <span className="text-[10px] text-amber-300 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 font-semibold">HIGH</span>
            </div>
            <div className="p-3 rounded-lg border border-white/10 bg-black/25 flex items-center justify-between hover:border-amber-400/30 transition-all">
              <span className="text-white font-medium">Index SEO Comparison Pillar Article</span>
              <span className="text-[10px] text-[#F5D77F] px-2 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 font-bold">MEDIUM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
