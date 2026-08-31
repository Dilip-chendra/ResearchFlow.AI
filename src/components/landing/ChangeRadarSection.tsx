import React from 'react';
import { Activity, AlertTriangle, ArrowRight, CheckSquare, Clock, ShieldCheck, Zap } from 'lucide-react';

export const ChangeRadarSection: React.FC = () => {
  return (
    <section id="change-radar" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-[#080A10]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">
              Continuous Radar Intelligence
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Active Monitoring
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Don't just research competitors once. Track what changes.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Markets are dynamic. When a competitor changes pricing tiers, introduces feature gates, or alters landing page positioning, ResearchFlow detects the delta and generates immediate counter-actions.
          </p>
        </div>

        {/* Change Radar Visual Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: The Delta Shift Card */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-bold text-white text-xs">Automated Change Delta Detected</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Source: Novoresume Pricing</span>
            </div>

            {/* Before vs After Visual Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Previous Scan (30 Days Ago)</span>
                <p className="text-sm font-bold text-zinc-300 font-mono">$19 / Month</p>
                <p className="text-[11px] text-zinc-500">Annual commitment advertised as default</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-1.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">Latest Scan (Today)</span>
                <p className="text-sm font-bold text-amber-200 font-mono">$29 / Month</p>
                <p className="text-[11px] text-amber-300/80">Monthly flex tier raised by +52%</p>
              </div>
            </div>

            {/* Impact Analysis */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Strategic Significance Score
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                  HIGH IMPACT (92/100)
                </span>
              </div>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                Competitor price increase creates an immediate acquisition wedge for price-sensitive student candidates.
              </p>
            </div>
          </div>

          {/* Right Column: Automated Counter-Action Handoff */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white font-display">
                Automated Task Generation from Market Shifts
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Rather than sending a passive email alert that gets ignored in an inbox, ResearchFlow automatically translates market shifts into actionable tasks on your team's execution board.
              </p>
            </div>

            {/* Generated Action Item Card */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-indigo-500/30 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  AUTO-GENERATED EXECUTION TASK
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">READY FOR SPRINT</span>
              </div>

              <h4 className="text-sm font-bold text-white leading-snug">
                Launch Paid Search & LinkedIn Ad Angle Highlighting Transparent $19 vs $29 Price Savings
              </h4>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Update Google Search headlines with: <em>"Stop Paying $29/mo for Unused Seats — NextGen Resume AI Delivers Parity at 3x Lower Cost."</em>
              </p>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Assigned: Growth Lead</span>
                <span className="text-indigo-400 font-bold">Priority: Urgent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
