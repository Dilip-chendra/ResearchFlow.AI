import React from 'react';
import { Rocket, Target, Briefcase, BarChart3, ArrowRight, ShieldCheck } from 'lucide-react';

export const UseCasesSection: React.FC = () => {
  const personas = [
    {
      title: 'Startup Founders & CEOs',
      icon: Rocket,
      badge: 'Zero to One & Seed Stage',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      before: 'Hours spent copy-pasting competitor feature tables into disorganized Google Slides before investor pitches.',
      withRF: 'One-click extraction of competitor pricing models, positioning gaps, and defensible wedges backed by citations.',
      output: 'Executive Landscape Brief & Positioning Matrix',
    },
    {
      title: 'Heads of Growth & Demand Gen',
      icon: Target,
      badge: 'GTM & User Acquisition',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      before: 'Writing generic LinkedIn ad copy and email hooks that sound identical to every other SaaS tool.',
      withRF: 'Instant generation of evidence-backed challenger copy directly contrasting competitor pricing flaws.',
      output: 'Multi-Channel Ad Copy & Outbound Sequences',
    },
    {
      title: 'Product Marketing Managers (PMMs)',
      icon: Briefcase,
      badge: 'B2B & Product Strategy',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      before: 'Manually auditing competitor tier changes every quarter with high risk of missing subtle price increases.',
      withRF: 'Automated delta detection alerting the team when competitors alter feature gates or raise monthly fees.',
      output: 'Live Battlecards & Change Radar Alerts',
    },
    {
      title: 'Growth & Marketing Agencies',
      icon: BarChart3,
      badge: 'Multi-Client Workspaces',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      before: 'Spending the first 2 weeks of every client engagement manually researching competitor footprints.',
      withRF: 'Deliver complete, evidence-grounded competitor tear-downs and execution boards in under 15 minutes.',
      output: 'Client-Ready Strategic Roadmaps & Task Boards',
    },
  ];

  return (
    <section id="use-cases" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-[#080A10]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">
            Engineered for Modern Operators
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Built for teams that execute at high velocity.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Whether you are validating an early-stage market, scaling paid user acquisition, or monitoring enterprise competitors, ResearchFlow replaces manual busywork with evidence-backed speed.
          </p>
        </div>

        {/* 4 Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {personas.map((p, idx) => {
            const Icon = p.icon;

            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-white">{p.title}</h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>

                  {/* Before vs With ResearchFlow */}
                  <div className="space-y-2.5 pt-2">
                    <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                        Without ResearchFlow:
                      </span>
                      <p className="text-zinc-400 leading-relaxed text-[11px]">{p.before}</p>
                    </div>

                    <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/30">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">
                        With ResearchFlow:
                      </span>
                      <p className="text-zinc-200 leading-relaxed text-[11px] font-medium">{p.withRF}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-500">Output Artifact</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{p.output}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
