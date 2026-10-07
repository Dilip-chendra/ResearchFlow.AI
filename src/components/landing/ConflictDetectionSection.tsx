import React from 'react';
import { GitCompare, UserCheck } from 'lucide-react';

export const ConflictDetectionSection: React.FC = () => {
  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-12">
      <div className="space-y-4 max-w-2xl">
        <div className="text-[11px] sm:text-xs font-mono tracking-[0.24em] uppercase text-cyan-300 font-semibold drop-shadow-sm">
          08 &mdash; CROSS-SOURCE CONFLICT DETECTION
        </div>
        <h2 className="text-[clamp(2.4rem,6vw,4.25rem)] font-display font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-[0_6px_36px_rgba(0,0,0,0.85)]">
          When sources disagree, ResearchFlow notices.
        </h2>
        <p className="text-lg sm:text-xl text-white/85 leading-relaxed font-sans-editorial drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          Competitors constantly test subtle pricing adjustments and repackage features. Rather than blindly merging contradictory figures, ResearchFlow exposes tension points for operator review.
        </p>
      </div>

      {/* Refined Conflict Comparison Visual */}
      <div className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3)] space-y-6">
        <div className="flex items-center justify-between text-xs font-mono pb-4 border-b border-white/15">
          <span className="text-white/80 font-semibold tracking-wider">PRICING DISCREPANCY AUDIT</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-200 font-semibold shadow-[0_0_12px_rgba(251,191,36,0.25)]">
            <GitCompare className="w-3.5 h-3.5" />
            <span>UNRESOLVED CONFLICT</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Source A */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md space-y-3 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-200/80">
              <span className="font-semibold">SOURCE A &middot; Direct Marketing</span>
              <span>24h ago</span>
            </div>
            <div className="text-3xl font-display font-bold text-white drop-shadow-sm">
              $19 <span className="text-xs font-mono text-white/70">/ user / month</span>
            </div>
            <p className="text-xs text-white/80 font-sans-editorial leading-relaxed">
              &ldquo;Starter tier billed annually with minimum 5-seat commitment.&rdquo;
            </p>
          </div>

          {/* Source B */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md space-y-3 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-200/80">
              <span className="font-semibold">SOURCE B &middot; Checkout Portal</span>
              <span>1h ago</span>
            </div>
            <div className="text-3xl font-display font-bold text-cyan-300 drop-shadow-[0_0_16px_rgba(56,189,248,0.4)]">
              $29 <span className="text-xs font-mono text-white/70">/ user / month</span>
            </div>
            <p className="text-xs text-white/80 font-sans-editorial leading-relaxed">
              &ldquo;Single user monthly flexible rate without annual lock-in.&rdquo;
            </p>
          </div>
        </div>

        {/* Resolution Bar */}
        <div className="p-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-2.5 text-white">
            <UserCheck className="w-4 h-4 text-cyan-300 shrink-0" />
            <span className="font-sans-editorial font-medium">Contradictions become visible before polluting campaigns.</span>
          </div>
          <span className="font-mono text-cyan-200 text-xs font-semibold whitespace-nowrap px-2.5 py-1 rounded bg-cyan-400/20 border border-cyan-400/30">
            FLAGGED &rarr; REQUIRES OPERATOR SIGN-OFF
          </span>
        </div>
      </div>
    </section>
  );
};
