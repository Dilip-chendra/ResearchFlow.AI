import React from 'react';
import { Calendar, Clock, RefreshCw, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const RecurringWorkflowSection: React.FC = () => {
  const steps = [
    {
      time: 'Monday 08:00 AM',
      title: 'Scheduled Crawler Fires',
      desc: 'Autonomous crawler checks competitor URLs for pricing and feature updates.',
    },
    {
      time: 'Monday 08:02 AM',
      title: 'Delta Shift Detected',
      desc: 'Identifies changes from baseline scans and extracts updated evidence quotes.',
    },
    {
      time: 'Monday 08:03 AM',
      title: 'Intelligence Synthesized',
      desc: 'Updates competitive battlecards and generates revised challenger messaging.',
    },
    {
      time: 'Monday 08:04 AM',
      title: 'Review Queue Updated',
      desc: 'Operator notified with a concise 1-minute approval brief in the Command Center.',
    },
    {
      time: 'Monday 08:05 AM',
      title: 'Execution Tasks Dispatched',
      desc: 'Approved tasks populated on sprint boards for copywriters and growth leads.',
    },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-[#07090E]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">
            Recurring Operating Cadence
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            From ad-hoc analysis to an automated operating system.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Market research should not be a panicked quarterly project. Set recurring schedules to turn competitor tracking into an autonomous weekly sprint driver.
          </p>
        </div>

        {/* Cadence Timeline Visual */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-white">Automated Weekly Competitive Radar Cadence</span>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              5-Minute Autonomous Run
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs relative flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold block">
                    {step.time}
                  </span>
                  <h4 className="font-bold text-white text-xs">{step.title}</h4>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">{step.desc}</p>
                </div>
                <div className="pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 font-mono">
                  Step 0{idx + 1}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-indigo-950/20 rounded-2xl border border-indigo-500/30 flex items-center justify-between flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero manual copy-pasting · Seamless handoff to growth team</span>
            </div>
            <span className="text-[11px] font-mono text-indigo-400 font-bold">Ready on Demand</span>
          </div>
        </div>
      </div>
    </section>
  );
};
