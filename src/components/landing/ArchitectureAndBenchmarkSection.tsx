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
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#9CCBFF]/70">
            20 &mdash; ENGINEERING INFRASTRUCTURE
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight leading-[1.15]">
            Under the intelligence is a real system.
          </h2>
          <p className="text-base sm:text-lg text-[#A8AFBA] leading-relaxed">
            No mock interfaces or synthetic wrappers. ResearchFlow is built on verified full-stack architecture with production-hardened retrieval engines and database persistence.
          </p>
        </div>

        {/* Real Stack Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#07090C]/60 space-y-1">
            <div className="text-[#9CCBFF] font-semibold">TYPESCRIPT & REACT</div>
            <div className="text-[#A8AFBA] text-[11px] font-sans">High-DPI Canvas & reactive UI state</div>
          </div>
          <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#07090C]/60 space-y-1">
            <div className="text-[#9CCBFF] font-semibold">NODE & EXPRESS API</div>
            <div className="text-[#A8AFBA] text-[11px] font-sans">Strict multi-tenant workspace routing</div>
          </div>
          <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#07090C]/60 space-y-1">
            <div className="text-[#9CCBFF] font-semibold">GEMINI & OPENROUTER</div>
            <div className="text-[#A8AFBA] text-[11px] font-sans">Multi-model dynamic orchestration</div>
          </div>
          <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#07090C]/60 space-y-1">
            <div className="text-[#9CCBFF] font-semibold">PLAYWRIGHT & AXIOS</div>
            <div className="text-[#A8AFBA] text-[11px] font-sans">Live HTTP & headless browser crawler</div>
          </div>
        </div>
      </div>

      {/* 21. Benchmark Evaluation */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[#727A86]/25 bg-[#07090C]/80 backdrop-blur-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#727A86]/15 text-xs font-mono">
          <span className="text-[#A8AFBA]">12-CASE RIGOROUS BENCHMARK EVALUATION</span>
          <span className="text-emerald-400 font-medium">95% TIME REDUCTION IN BENCHMARK</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-[#727A86] uppercase">Manual Competitive Audit</div>
            <div className="text-3xl font-sans font-medium text-[#727A86]">~4.0 hours</div>
            <p className="text-xs text-[#A8AFBA] font-sans">
              Manual tab jumping, copy-pasting pricing tables, unverified spreadsheets, human fatigue errors.
            </p>
          </div>

          <div className="space-y-2 sm:border-l sm:border-[#727A86]/20 sm:pl-6">
            <div className="text-[11px] font-mono text-[#9CCBFF] uppercase">ResearchFlow Pipeline</div>
            <div className="text-3xl font-sans font-medium text-[#9CCBFF]">~12 minutes</div>
            <p className="text-xs text-[#F3F5F7] font-sans">
              Autonomous retrieval, verbatim claim citation, conflict resolution, and campaign task generation.
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-[#727A86] pt-2 border-t border-[#727A86]/10">
          * Measured in documented 12-test baseline suite across 36 enterprise SaaS competitor domains.
        </div>
      </div>

      {/* 22. The Difference & 23. The Operating Loop */}
      <div className="space-y-10 pt-10 border-t border-[#727A86]/20">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#727A86]">
            22 &mdash; THE STRATEGIC DIFFERENCE
          </div>
          <h3 className="text-3xl sm:text-5xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight leading-[1.15]">
            Most research ends in a report. ResearchFlow continues.
          </h3>
          <p className="text-base text-[#A8AFBA] leading-relaxed">
            A static PDF sits in an archive. ResearchFlow carries understanding forward into campaigns and live execution.
          </p>
        </div>

        {/* 23. Operating Loop Stream */}
        <div className="space-y-4 pt-4">
          <div className="text-[11px] font-mono text-[#9CCBFF] uppercase tracking-wider flex items-center gap-2">
            <RotateCw className="w-3.5 h-3.5" />
            <span>CONTINUOUS OPERATING LOOP</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-mono">
            {operatingLoop.map((step, idx) => (
              <span key={step} className="inline-flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg border border-[#727A86]/25 bg-[#07090C]/60 text-[#F3F5F7]">
                  {step}
                </span>
                {idx < operatingLoop.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-[#727A86]/60 shrink-0" />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
