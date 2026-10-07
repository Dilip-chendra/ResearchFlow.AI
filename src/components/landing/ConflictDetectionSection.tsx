import React from 'react';
import { GitCompare, UserCheck } from 'lucide-react';

export const ConflictDetectionSection: React.FC = () => {
  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-12">
      <div className="space-y-4 max-w-2xl">
        <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#9CCBFF]/70">
          08 &mdash; CROSS-SOURCE CONFLICT DETECTION
        </div>
        <h2 className="text-3xl sm:text-5xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight leading-[1.15]">
          When sources disagree, ResearchFlow notices.
        </h2>
        <p className="text-base sm:text-lg text-[#A8AFBA] leading-relaxed">
          Competitors constantly test subtle pricing adjustments and repackage features. Rather than blindly merging contradictory figures, ResearchFlow exposes tension points for operator review.
        </p>
      </div>

      {/* Refined Conflict Comparison Visual */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[#727A86]/25 bg-[#07090C]/80 backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between text-xs font-mono pb-4 border-b border-[#727A86]/15">
          <span className="text-[#A8AFBA]">PRICING DISCREPANCY AUDIT</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300">
            <GitCompare className="w-3 h-3" />
            <span>UNRESOLVED CONFLICT</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Source A */}
          <div className="p-5 rounded-xl border border-[#727A86]/20 bg-[#050608]/70 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#727A86]">
              <span>SOURCE A &middot; Direct Marketing Page</span>
              <span>24h ago</span>
            </div>
            <div className="text-2xl font-sans font-medium text-[#F3F5F7]">
              $19 <span className="text-xs font-mono text-[#A8AFBA]">/ user / month</span>
            </div>
            <p className="text-xs text-[#A8AFBA] font-mono">
              &ldquo;Starter tier billed annually with minimum 5-seat commitment.&rdquo;
            </p>
          </div>

          {/* Source B */}
          <div className="p-5 rounded-xl border border-[#727A86]/20 bg-[#050608]/70 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#727A86]">
              <span>SOURCE B &middot; Public Checkout Portal</span>
              <span>1h ago</span>
            </div>
            <div className="text-2xl font-sans font-medium text-[#9CCBFF]">
              $29 <span className="text-xs font-mono text-[#A8AFBA]">/ user / month</span>
            </div>
            <p className="text-xs text-[#A8AFBA] font-mono">
              &ldquo;Single user monthly flexible rate without annual lock-in.&rdquo;
            </p>
          </div>
        </div>

        {/* Resolution Bar */}
        <div className="p-4 rounded-xl border border-[#9CCBFF]/20 bg-[#9CCBFF]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-[#F3F5F7]">
            <UserCheck className="w-4 h-4 text-[#9CCBFF]" />
            <span className="font-sans font-medium">Contradictions become visible before polluting campaigns.</span>
          </div>
          <span className="font-mono text-[#9CCBFF] text-[11px] whitespace-nowrap">
            FLAGGED &rarr; REQUIRES OPERATOR SIGN-OFF
          </span>
        </div>
      </div>
    </section>
  );
};
