import React from 'react';
import { ArrowRight, CheckCircle2, RotateCw, Server, Cpu, Database } from 'lucide-react';

export const ArchitectureAndBenchmarkSection: React.FC = () => {
  const operatingLoop = [
    'DISCOVER',
    'VERIFY',
    'COMPARE',
    'UNDERSTAND',
    'DECIDE',
    'ACT',
    'LEARN',
  ];

  return (
    <section id="architecture" className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-28">
      {/* 20. Technical Architecture */}
      <div className="space-y-10">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-300 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            20 &mdash; ENGINEERING INFRASTRUCTURE
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Under the intelligence is a real system.
          </h2>
          <p className="text-base sm:text-lg text-white/85 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            No mock interfaces or synthetic wrappers. ResearchFlow is built on verified full-stack architecture with production-hardened retrieval engines and database persistence.
          </p>
        </div>

        {/* Real Stack Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-4 rounded-xl border border-white/15 bg-white/[0.05] backdrop-blur-xl space-y-1 hover:bg-white/[0.08] transition-all">
            <div className="text-cyan-300 font-semibold">TYPESCRIPT & REACT</div>
            <div className="text-white/80 text-[11px] font-sans">High-DPI Canvas & reactive UI state</div>
          </div>
          <div className="p-4 rounded-xl border border-white/15 bg-white/[0.05] backdrop-blur-xl space-y-1 hover:bg-white/[0.08] transition-all">
            <div className="text-cyan-300 font-semibold">NODE & EXPRESS API</div>
            <div className="text-white/80 text-[11px] font-sans">Strict multi-tenant workspace routing</div>
          </div>
          <div className="p-4 rounded-xl border border-white/15 bg-white/[0.05] backdrop-blur-xl space-y-1 hover:bg-white/[0.08] transition-all">
            <div className="text-cyan-300 font-semibold">GEMINI & OPENROUTER</div>
            <div className="text-white/80 text-[11px] font-sans">Multi-model dynamic orchestration</div>
          </div>
          <div className="p-4 rounded-xl border border-white/15 bg-white/[0.05] backdrop-blur-xl space-y-1 hover:bg-white/[0.08] transition-all">
            <div className="text-cyan-300 font-semibold">PLAYWRIGHT & AXIOS</div>
            <div className="text-white/80 text-[11px] font-sans">Live HTTP & headless browser crawler</div>
          </div>
        </div>
      </div>

      {/* 21. Benchmark Evaluation */}
      <div className="p-6 sm:p-8 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3)] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 text-xs font-mono">
          <span className="text-white/80 font-medium">12-CASE RIGOROUS BENCHMARK EVALUATION</span>
          <span className="text-emerald-300 font-semibold">95% TIME REDUCTION IN BENCHMARK</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-white/60 uppercase">Manual Competitive Audit</div>
            <div className="text-3xl font-display font-semibold text-white/60">~4.0 hours</div>
            <p className="text-xs text-white/70 font-sans">
              Manual tab jumping, copy-pasting pricing tables, unverified spreadsheets, human fatigue errors.
            </p>
          </div>

          <div className="space-y-2 sm:border-l sm:border-white/15 sm:pl-6">
            <div className="text-[11px] font-mono text-cyan-300 uppercase font-semibold">ResearchFlow Pipeline</div>
            <div className="text-3xl font-display font-bold text-cyan-300 drop-shadow-[0_0_16px_rgba(156,203,255,0.4)]">~12 minutes</div>
            <p className="text-xs text-white/95 font-sans">
              Autonomous retrieval, verbatim claim citation, conflict resolution, and campaign task generation.
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-white/60 pt-2 border-t border-white/10">
          * Measured in documented 12-test baseline suite across 36 enterprise SaaS competitor domains.
        </div>
      </div>

      {/* 22. The Difference & 23. The Operating Loop */}
      <div className="space-y-10 pt-10 border-t border-white/15">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-300 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            22 &mdash; THE STRATEGIC DIFFERENCE
          </div>
          <h3 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Most research ends in a report. ResearchFlow continues.
          </h3>
          <p className="text-base text-white/85 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            A static PDF sits in an archive. ResearchFlow carries understanding forward into campaigns and live execution.
          </p>
        </div>

        {/* 23. Operating Loop Stream */}
        <div className="space-y-4 pt-4">
          <div className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-2 font-semibold">
            <RotateCw className="w-3.5 h-3.5" />
            <span>CONTINUOUS OPERATING LOOP</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-mono">
            {operatingLoop.map((step, idx) => (
              <span key={step} className="inline-flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg border border-white/20 bg-white/[0.06] backdrop-blur-md text-white font-medium hover:bg-white/[0.12] transition-colors shadow-sm">
                  {step}
                </span>
                {idx < operatingLoop.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-cyan-300/60 shrink-0" />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
