import React, { useState } from 'react';
import { LayoutDashboard, FileSearch, AlertTriangle, Megaphone, CheckSquare, Award, ArrowRight } from 'lucide-react';

export const ProductGallerySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const screens = [
    {
      id: 'overview',
      name: 'Command Center',
      icon: LayoutDashboard,
      title: 'Workspace Health & Executive Overview',
      desc: 'Live KPI cards, active review queue, real-time evidence stream, and recent workspace activity.',
      previewContent: (
        <div className="space-y-4 p-5 text-xs">
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block uppercase font-mono">Active Jobs</span>
              <span className="text-base font-bold text-white">4 Missions</span>
            </div>
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block uppercase font-mono">Evidence Isolated</span>
              <span className="text-base font-bold text-emerald-400">42 Claims</span>
            </div>
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block uppercase font-mono">Awaiting Review</span>
              <span className="text-base font-bold text-amber-400">1 Brief</span>
            </div>
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block uppercase font-mono">Execution Tasks</span>
              <span className="text-base font-bold text-indigo-400">8 Tasks</span>
            </div>
          </div>
          <div className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-white font-semibold">NextGen Resume AI — Campaign Ready for Human Review</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Validated 100%</span>
          </div>
        </div>
      ),
    },
    {
      id: 'evidence',
      name: 'Evidence Explorer',
      icon: FileSearch,
      title: 'Atomic Claims & Provenance Traceability',
      desc: 'Filter by Pricing, Features, Audience, Positioning, and GTM with instant citation verification.',
      previewContent: (
        <div className="space-y-3 p-5 text-xs">
          <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                FACT · HIGH CONFIDENCE
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Category: Pricing</span>
            </div>
            <p className="text-white font-semibold text-xs">
              "Novoresume Starter is $19/mo when billed annually ($228 upfront) vs $29/mo monthly."
            </p>
            <p className="text-[10px] text-zinc-400 font-mono truncate">Source: https://novoresume.com/career-blog/pricing</p>
          </div>
          <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded">
                FACT · HIGH CONFIDENCE
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Category: Product Features</span>
            </div>
            <p className="text-white font-semibold text-xs">
              "Kickresume Pro tier required to unlock automated AI bullet rewriting."
            </p>
            <p className="text-[10px] text-zinc-400 font-mono truncate">Source: https://kickresume.com/en/features</p>
          </div>
        </div>
      ),
    },
    {
      id: 'conflicts',
      name: 'Conflict Center',
      icon: AlertTriangle,
      title: 'Cross-Source Mismatch & Operator Resolution',
      desc: 'Identifies discrepancies in pricing and claims across sources and records audit resolutions.',
      previewContent: (
        <div className="p-5 text-xs space-y-3">
          <div className="p-4 bg-amber-950/20 rounded-xl border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">
                FLAGGED PRICING CONFLICT · RESOLVED
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">HUMAN VERIFIED</span>
            </div>
            <p className="text-amber-200 font-semibold">
              $19 vs $29 Pricing Discrepancy between Third-Party Review and Official Pricing Table.
            </p>
            <p className="text-[11px] text-zinc-400 italic bg-black/40 p-2 rounded">
              Operator Note: "Verified that $19 is annual prepayment rate with 30% discount; $29 is standard month-to-month."
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'campaigns',
      name: 'Campaign Studio',
      icon: Megaphone,
      title: 'Evidence-Backed Briefs & Multi-Channel Copy',
      desc: 'Review strategic positioning, preview LinkedIn and Google ads, and run AI red-team simulations.',
      previewContent: (
        <div className="p-5 text-xs space-y-3">
          <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Lead Positioning Angle</span>
            <p className="text-white font-bold text-xs">
              "Stop Paying 30% Surplus for Unused Templates — NextGen Resume AI Aligns Candidates Directly with Real Hiring Benchmarks."
            </p>
            <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-400 font-mono">
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">LinkedIn Draft Ready</span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">Google Ad Spec Ready</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">SEO Pillar Ready</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'tasks',
      name: 'Execution Tasks',
      icon: CheckSquare,
      title: 'Actionable Kanban Board with Persistence',
      desc: 'Campaign approvals automatically populate prioritized action items on your workspace board.',
      previewContent: (
        <div className="grid grid-cols-3 gap-2.5 p-5 text-xs">
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[9px] font-bold text-zinc-500 uppercase">PENDING</span>
            <p className="text-white font-semibold text-[11px]">Update Hero Copy</p>
            <span className="text-[9px] text-rose-400 font-mono">URGENT</span>
          </div>
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[9px] font-bold text-amber-500 uppercase">IN PROGRESS</span>
            <p className="text-white font-semibold text-[11px]">Schedule LinkedIn Post</p>
            <span className="text-[9px] text-indigo-400 font-mono">HIGH</span>
          </div>
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
            <span className="text-[9px] font-bold text-emerald-500 uppercase">COMPLETED</span>
            <p className="text-white font-semibold text-[11px]">Deploy Outbound Template</p>
            <span className="text-[9px] text-emerald-400 font-mono">DONE</span>
          </div>
        </div>
      ),
    },
    {
      id: 'evaluation',
      name: 'Reliability Benchmark',
      icon: Award,
      title: '12-Case Automated Reliability Suite',
      desc: 'Automated testing across 12 edge cases (TC01-TC12) with 6-dimension rubric scorecards.',
      previewContent: (
        <div className="p-5 text-xs space-y-3">
          <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">12/12 Reliability Test Cases Passed</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">Score: 94/100</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
            <div className="p-2 bg-black/40 rounded border border-zinc-800 text-zinc-300">Accuracy: 95%</div>
            <div className="p-2 bg-black/40 rounded border border-zinc-800 text-zinc-300">Traceability: 100%</div>
            <div className="p-2 bg-black/40 rounded border border-zinc-800 text-zinc-300">Usability: 96%</div>
          </div>
        </div>
      ),
    },
  ];

  const current = screens.find((s) => s.id === activeTab) || screens[0];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-[#07090E]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">
            Authentic Application Interface
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            A serious interface engineered for precision.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Every screen in ResearchFlow AI is built to give founders and growth teams total visibility into market evidence and execution velocity.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {screens.map((screen) => {
            const Icon = screen.icon;
            const isSelected = activeTab === screen.id;

            return (
              <button
                key={screen.id}
                onClick={() => setActiveTab(screen.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{screen.name}</span>
              </button>
            );
          })}
        </div>

        {/* Display Card Mockup */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">{current.title}</h3>
              <p className="text-xs text-zinc-400 mt-1">{current.desc}</p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 bg-zinc-900 rounded-lg text-zinc-400 border border-zinc-800 self-start sm:self-center">
              Live Product Component
            </span>
          </div>

          <div className="bg-[#0A0D15]">{current.previewContent}</div>
        </div>
      </div>
    </section>
  );
};
