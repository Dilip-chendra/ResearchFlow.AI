import React from 'react';
import { Sparkles, ShieldCheck, ArrowRight, Layers, ExternalLink } from 'lucide-react';

export const IntelligenceMatrixSection: React.FC = () => {
  const competitors = [
    {
      name: 'Competitor A (Novoresume)',
      pricing: '$19/mo annual · $29/mo monthly',
      features: 'Visual templates, 1-page free limit',
      positioning: 'Design-centric formatting templates',
      audience: 'General job seekers, entry-level',
      gap: 'No automated ATS recruiter parsing score',
    },
    {
      name: 'Competitor B (Kickresume)',
      pricing: '$19/mo annual · Pro required for AI',
      features: 'AI rewrite tools, cover letter builder',
      positioning: 'AI-assisted resume writer',
      audience: 'Professionals & creatives',
      gap: 'Complex multi-tier feature gating',
    },
    {
      name: 'Competitor C (Teal)',
      pricing: '$29/mo flat track membership',
      features: 'Job tracker + keyword matcher',
      positioning: 'Career growth & application manager',
      audience: 'Mid-career tech job seekers',
      gap: 'High monthly fee without student tiers',
    },
  ];

  return (
    <section id="intelligence" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-[#07090E]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">
                Comparative Landscape Matrix
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                DEMO DATA SAMPLE
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
              Transform raw competitor signals into positioning wedges.
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed">
              Synthesize competitor pricing, feature boundaries, and messaging angles into structured side-by-side matrices.
            </p>
          </div>
        </div>

        {/* Matrix Table Visual */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 font-mono text-[11px]">
                  <th className="p-4 sm:p-5 font-semibold">Competitor</th>
                  <th className="p-4 sm:p-5 font-semibold">Pricing Tier Structure</th>
                  <th className="p-4 sm:p-5 font-semibold">Feature Gating</th>
                  <th className="p-4 sm:p-5 font-semibold">Positioning Angle</th>
                  <th className="p-4 sm:p-5 font-semibold text-indigo-400">Identified Parity Gap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {competitors.map((c, i) => (
                  <tr key={i} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-white whitespace-nowrap">
                      {c.name}
                    </td>
                    <td className="p-4 sm:p-5 text-zinc-300 font-mono">{c.pricing}</td>
                    <td className="p-4 sm:p-5 text-zinc-300">{c.features}</td>
                    <td className="p-4 sm:p-5 text-zinc-300 italic">{c.positioning}</td>
                    <td className="p-4 sm:p-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 font-semibold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{c.gap}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Synthesized Strategic Opportunity Callout */}
          <div className="p-6 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                Synthesized Strategic Opportunity
              </span>
              <h4 className="text-sm font-bold text-white">
                Wedge: Transparent Month-to-Month Pricing + Automated Recruiter ATS Calibration
              </h4>
              <p className="text-xs text-zinc-400">
                Target university seniors with verified keyword scoring while eliminating the 1-year prepayment trap.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-semibold text-xs shrink-0 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Evidence-Backed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
