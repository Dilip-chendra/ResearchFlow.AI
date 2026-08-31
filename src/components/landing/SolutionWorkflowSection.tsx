import React, { useState } from 'react';
import { Globe, FileSearch, Sparkles, Megaphone, CheckSquare, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { ProductInteractivePreview } from './ProductInteractivePreview';

export const SolutionWorkflowSection: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<number>(0);

  const workflows = [
    {
      step: '01',
      title: 'Autonomous Research',
      subtitle: 'Collect Public Market Evidence',
      icon: Globe,
      color: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30',
      description:
        'Crawl competitor landing pages, pricing tiers, and documentation in parallel with 12s timeout guards and clean HTML parsing.',
      details: [
        'Live HTTP status checks (200, 401, 403, 504)',
        'Anti-bot firewall detection & Google Grounding fallback',
        'Automatic protocol validation and canonical URL resolution',
      ],
    },
    {
      step: '02',
      title: 'Verifiable Evidence',
      subtitle: 'Preserve Verbatim Grounding',
      icon: FileSearch,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
      description:
        'Parse unstructured text into atomic claims categorized by Pricing, Features, Audience, Positioning, and GTM Strategy.',
      details: [
        'Strict separation of FACT, INFERENCE, and WARNING',
        '100% citation graph linking claims to origin URLs',
        'Automatic cross-source conflict detection ($19 vs $29)',
      ],
    },
    {
      step: '03',
      title: 'Strategic Intelligence',
      subtitle: 'Synthesize Market Gaps',
      icon: Sparkles,
      color: 'from-indigo-500/20 to-indigo-600/10 text-indigo-400 border-indigo-500/30',
      description:
        'Identify unserved customer segments, feature parity weaknesses, and actionable positioning wedges backed by isolated evidence.',
      details: [
        'Audience signal & pain point synthesis',
        'Competitive battlecards with counter-objections',
        'Perceptual 2D positioning matrix calculation',
      ],
    },
    {
      step: '04',
      title: 'Campaign Strategy',
      subtitle: 'Multi-Channel Distribution Drafts',
      icon: Megaphone,
      color: 'from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/30',
      description:
        'Generate structured Campaign Briefs, core messages, and production-ready copy across LinkedIn, Cold Email, and High-Intent SEO.',
      details: [
        'Visual Ad Creative Studio with live SERP & LinkedIn preview',
        'AI Red-Team simulator testing competitor counter-arguments',
        'Exportable Ad Spec JSON payloads for media buyers',
      ],
    },
    {
      step: '05',
      title: 'Actionable Execution',
      subtitle: 'Turn Approvals Into Tasks',
      icon: CheckSquare,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30',
      description:
        'Human operator review triggers automatic task generation on the workspace board to ensure strategy translates into completed work.',
      details: [
        'Prioritized Kanban board (PENDING, IN_PROGRESS, COMPLETED)',
        'Clear justifications linking tasks back to evidence claims',
        'Single-click status persistence with audit trail',
      ],
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-[#07090E]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">
            End-to-End Operational Pipeline
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            One continuous workflow from research to execution.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Eliminate handoff friction between market analysts, copywriters, and growth engineers with a unified, verifiable intelligence graph.
          </p>
        </div>

        {/* 5-Step Interactive Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
          {workflows.map((wf, idx) => {
            const Icon = wf.icon;
            const isSelected = selectedWorkflow === idx;

            return (
              <div
                key={wf.step}
                onClick={() => setSelectedWorkflow(idx)}
                className={`cursor-pointer p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-zinc-900/90 border-indigo-500 shadow-xl shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-zinc-500">
                      STEP {wf.step}
                    </span>
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${wf.color} border`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm leading-snug">{wf.title}</h3>
                    <p className="text-zinc-400 text-[11px] mt-0.5">{wf.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 pt-2 border-t border-zinc-800/60">
                  <span>{isSelected ? 'Active Focus' : 'Inspect Step'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Deep Dive on Selected Step */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                STEP {workflows[selectedWorkflow].step} DEEP DIVE
              </span>
              <h4 className="text-base font-bold text-white">
                {workflows[selectedWorkflow].title} — {workflows[selectedWorkflow].subtitle}
              </h4>
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed">
              {workflows[selectedWorkflow].description}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              {workflows[selectedWorkflow].details.map((d, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Live Interactive Product Preview */}
        <div className="pt-4">
          <ProductInteractivePreview />
        </div>
      </div>
    </section>
  );
};
