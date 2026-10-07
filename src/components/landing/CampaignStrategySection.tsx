import React from 'react';
import { Check, Edit3, X, ArrowRight, Layers, Mail, Search, FileText } from 'lucide-react';

export const CampaignStrategySection: React.FC = () => {
  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-28">
      {/* 13. Campaign Strategy */}
      <div className="space-y-10">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#9CCBFF]/70">
            13 &mdash; STRATEGY & ASSET GENERATION
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight leading-[1.15]">
            Turn market intelligence into a plan.
          </h2>
          <p className="text-base sm:text-lg text-[#A8AFBA] leading-relaxed">
            ResearchFlow transforms validated evidence into sharp go-to-market angles, channel-specific messaging assets, and high-impact distribution plans.
          </p>
        </div>

        {/* Real Campaign Hub UI Composition */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#727A86]/25 bg-[#07090C]/80 backdrop-blur-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#727A86]/15 text-xs font-mono">
            <span className="text-[#A8AFBA]">CAMPAIGN BRIEF: ENTERPRISE ALTERNATIVE POSITIONING</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#9CCBFF]">
              AWAITING REVIEW
            </span>
          </div>

          {/* Strategic Angle Lab */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-[#727A86] uppercase tracking-wider">
              Selected Strategic Angle:
            </div>
            <div className="p-4 rounded-xl border border-[#9CCBFF]/40 bg-[#9CCBFF]/5 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-sans font-medium text-[#F3F5F7]">
                  &ldquo;Stop Settling for Fragmented Vendor Promises&rdquo;
                </div>
                <p className="text-xs text-[#A8AFBA] mt-1 font-sans">
                  Targeting engineering leaders dissatisfied with heavyweight annual lock-ins and disjointed analytics dashboards.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                94% CONFIDENCE
              </span>
            </div>
          </div>

          {/* 3 Channel Draft Previews */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#050608]/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#9CCBFF]">
                <FileText className="w-3.5 h-3.5" />
                <span>LINKEDIN ASSET</span>
              </div>
              <p className="text-xs text-[#F3F5F7] line-clamp-3">
                &ldquo;Why 73% of engineering teams are abandoning monolithic market monitoring suites for unified evidence pipelines...&rdquo;
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#050608]/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#738BFF]">
                <Mail className="w-3.5 h-3.5" />
                <span>OUTBOUND EMAIL</span>
              </div>
              <p className="text-xs text-[#F3F5F7] line-clamp-3">
                Subject: Quick question about your competitor tracking stack &middot; 3-step value sequence with verified benchmarks.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#050608]/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#C7CED8]">
                <Search className="w-3.5 h-3.5" />
                <span>SEO PILLAR</span>
              </div>
              <p className="text-xs text-[#F3F5F7] line-clamp-3">
                Long-tail comparison teardown targeting high-intent decision queries: &ldquo;Best alternative to legacy suites 2026&rdquo;.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 14. Human Review & 15. Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-[#727A86]/20">
        {/* Human Review */}
        <div className="space-y-4">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#727A86]">
            14 &mdash; HUMAN-IN-THE-LOOP GOVERNANCE
          </div>
          <h3 className="text-2xl sm:text-3xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight">
            AI proposes. People decide.
          </h3>
          <p className="text-sm text-[#A8AFBA] leading-relaxed">
            No campaign or message is ever deployed automatically. Operators review the supporting citations, edit copy inline, adjust angles, or reject briefs with one click.
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-2 text-xs font-mono">
            <span className="h-9 px-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 inline-flex items-center gap-1.5 cursor-default">
              <Check className="w-3.5 h-3.5" /> Approve Brief
            </span>
            <span className="h-9 px-3.5 rounded-lg border border-[#727A86]/30 bg-[#07090C] text-[#A8AFBA] inline-flex items-center gap-1.5 cursor-default">
              <Edit3 className="w-3.5 h-3.5" /> Edit Copy
            </span>
            <span className="h-9 px-3.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 inline-flex items-center gap-1.5 cursor-default">
              <X className="w-3.5 h-3.5" /> Reject
            </span>
          </div>
        </div>

        {/* Action & Kanban */}
        <div className="space-y-4">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#727A86]">
            15 &mdash; ACTIONABLE EXECUTION
          </div>
          <h3 className="text-2xl sm:text-3xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight">
            Research should end with a decision.
          </h3>
          <p className="text-sm text-[#A8AFBA] leading-relaxed">
            Approval automatically populates execution tasks directly into your workflow Kanban, categorized by priority and channel.
          </p>

          <div className="space-y-2 text-xs font-mono pt-2">
            <div className="p-3 rounded-lg border border-[#727A86]/20 bg-[#050608]/70 flex items-center justify-between">
              <span className="text-[#F3F5F7]">Deploy LinkedIn Thought Leadership Angle</span>
              <span className="text-[10px] text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">HIGH</span>
            </div>
            <div className="p-3 rounded-lg border border-[#727A86]/20 bg-[#050608]/70 flex items-center justify-between">
              <span className="text-[#F3F5F7]">Configure 3-Step Outbound Sequence in Outreach Tool</span>
              <span className="text-[10px] text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">HIGH</span>
            </div>
            <div className="p-3 rounded-lg border border-[#727A86]/20 bg-[#050608]/70 flex items-center justify-between">
              <span className="text-[#F3F5F7]">Index SEO Comparison Pillar Article</span>
              <span className="text-[10px] text-blue-400 px-2 py-0.5 rounded bg-blue-500/10">MEDIUM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
