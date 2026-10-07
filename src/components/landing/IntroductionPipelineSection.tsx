import React from 'react';
import { Globe, ShieldCheck, GitCompare, Brain, Rocket } from 'lucide-react';

export const IntroductionPipelineSection: React.FC = () => {
  const pipelineSteps = [
    {
      step: '01',
      name: 'DISCOVER',
      label: 'Live Web Ingestion',
      icon: Globe,
      desc: 'Retrieves competitor domains, documentation, and pricing pages directly across live HTTP/HTTPS protocols.',
    },
    {
      step: '02',
      name: 'VERIFY',
      label: 'Evidence Grounding',
      icon: ShieldCheck,
      desc: 'Extracts verbatim quotes, citations, and metadata with exact source traceability to eliminate hallucination.',
    },
    {
      step: '03',
      name: 'COMPARE',
      label: 'Conflict Detection',
      icon: GitCompare,
      desc: 'Flags contradictory pricing, shifting messaging, and discrepancies across sources for human review.',
    },
    {
      step: '04',
      name: 'UNDERSTAND',
      label: 'Strategic Synthesis',
      icon: Brain,
      desc: 'Transforms fragmented signals into competitive whitespace, positioning matrices, and defensible opportunities.',
    },
    {
      step: '05',
      name: 'ACT',
      label: 'GTM Execution',
      icon: Rocket,
      desc: 'Generates evidence-backed campaigns, validated channel copy, and actionable Kanban tasks ready for execution.',
    },
  ];

  return (
    <section id="pipeline" className="relative py-[clamp(4.5rem,10vh,8rem)] px-5 sm:px-10 md:px-12 max-w-5xl mx-auto w-full space-y-24 sm:space-y-28">
      {/* 04. Introducing ResearchFlow */}
      <div className="space-y-10 sm:space-y-12">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-[#9CCBFF]/70">
            04 &mdash; THE SYSTEM
          </div>
          <h2 className="text-[clamp(1.85rem,5vw,3.5rem)] font-sans-editorial font-medium text-[#F3F5F7] tracking-tight leading-[1.15]">
            ResearchFlow turns web noise into intelligence.
          </h2>
          <p className="text-base sm:text-lg text-[#A8AFBA] leading-relaxed">
            One cohesive system for discovering, verifying, comparing, and acting on market information.
          </p>
        </div>

        {/* Visual 5-Step Pipeline Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {pipelineSteps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.name}
                className="group relative p-5 rounded-xl border border-[#727A86]/20 bg-[#07090C]/60 backdrop-blur-md hover:border-[#9CCBFF]/40 transition-all flex flex-col justify-between h-full min-w-0"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#727A86]">{s.step}</span>
                    <Icon className="w-4 h-4 text-[#9CCBFF]/80 group-hover:text-[#9CCBFF] transition-colors" />
                  </div>
                  <div>
                    <div className="text-xs font-mono tracking-wider font-semibold text-[#F3F5F7]">
                      {s.name}
                    </div>
                    <div className="text-[11px] text-[#A8AFBA] mt-0.5">{s.label}</div>
                  </div>
                </div>
                <p className="text-[11px] text-[#727A86] leading-relaxed pt-3 border-t border-[#727A86]/10 mt-3 font-sans">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 05. Live Web Research Pipeline */}
      <div className="space-y-8 pt-8 sm:pt-10 border-t border-[#727A86]/20">
        <div className="space-y-3 max-w-2xl">
          <div className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-[#727A86]">
            05 &mdash; ENGINE CAPABILITIES
          </div>
          <h3 className="text-xl sm:text-3xl md:text-4xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight">
            Research that actually goes to the web.
          </h3>
          <p className="text-sm sm:text-base text-[#A8AFBA] leading-relaxed">
            Not a synthetic memory query. ResearchFlow dispatches real HTTP/HTTPS retrieval workers to inspect live websites, extract visible text, and handle real web edge cases.
          </p>
        </div>

        {/* Technical Pipeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-4 rounded-lg border border-[#727A86]/20 bg-[#07090C]/50 space-y-1.5 min-w-0">
            <div className="text-[#9CCBFF] font-medium">LIVE FETCHING</div>
            <div className="text-[#727A86] text-[11px] font-sans">Direct GET/POST requests with dynamic headers & custom agents</div>
          </div>
          <div className="p-4 rounded-lg border border-[#727A86]/20 bg-[#07090C]/50 space-y-1.5 min-w-0">
            <div className="text-[#9CCBFF] font-medium">STATUS DETECTION</div>
            <div className="text-[#727A86] text-[11px] font-sans">Automatic recovery on 401, 403 paywalls, 504 timeouts & redirects</div>
          </div>
          <div className="p-4 rounded-lg border border-[#727A86]/20 bg-[#07090C]/50 space-y-1.5 min-w-0">
            <div className="text-[#9CCBFF] font-medium">SPA EXTRACTION</div>
            <div className="text-[#727A86] text-[11px] font-sans">Headless DOM extraction for client-side JavaScript applications</div>
          </div>
          <div className="p-4 rounded-lg border border-[#727A86]/20 bg-[#07090C]/50 space-y-1.5 min-w-0">
            <div className="text-[#9CCBFF] font-medium">SEARCH GROUNDING</div>
            <div className="text-[#727A86] text-[11px] font-sans">Google Search Grounding fallback when primary domains fail</div>
          </div>
        </div>
      </div>
    </section>
  );
};
