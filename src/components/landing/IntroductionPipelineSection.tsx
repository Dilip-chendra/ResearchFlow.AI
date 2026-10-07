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
          <div className="text-[11px] sm:text-xs font-subheading tracking-[0.24em] uppercase text-[#F5D77F] font-bold drop-shadow-sm">
            04 &mdash; THE SYSTEM
          </div>
          <h2 className="text-[clamp(2.4rem,6vw,4.25rem)] font-display font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-[0_6px_36px_rgba(0,0,0,0.85)]">
            ResearchFlow turns web noise into intelligence.
          </h2>
          <p className="text-lg sm:text-xl text-white/85 leading-relaxed font-editorial drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
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
                className="group relative p-5 rounded-2xl border border-amber-400/25 bg-black/30 hover:border-amber-400/60 hover:bg-black/40 shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all flex flex-col justify-between h-full min-w-0"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#F5D77F]">{s.step}</span>
                    <Icon className="w-4 h-4 text-[#F5D77F] group-hover:scale-110 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)] transition-transform" />
                  </div>
                  <div>
                    <div className="text-sm font-display tracking-wider font-bold text-white drop-shadow-sm">
                      {s.name}
                    </div>
                    <div className="text-xs text-amber-200/90 font-mono mt-0.5">{s.label}</div>
                  </div>
                </div>
                <p className="text-xs text-white/80 leading-relaxed pt-3 border-t border-white/10 mt-3 font-sans-editorial drop-shadow-sm">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 05. Live Web Research Pipeline */}
      <div className="space-y-8 pt-10 sm:pt-12 border-t border-amber-400/20">
        <div className="space-y-3 max-w-2xl">
          <div className="text-[11px] sm:text-xs font-subheading tracking-[0.24em] uppercase text-[#F5D77F]/90 font-bold drop-shadow-sm">
            05 &mdash; ENGINE CAPABILITIES
          </div>
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Research that actually goes to the web.
          </h3>
          <p className="text-base sm:text-lg text-white/85 leading-relaxed font-editorial drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            Not a synthetic memory query. ResearchFlow dispatches real HTTP/HTTPS retrieval workers to inspect live websites, extract visible text, and handle real web edge cases.
          </p>
        </div>

        {/* Technical Pipeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-4 rounded-xl border border-amber-400/20 bg-black/25 shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all space-y-1.5 min-w-0">
            <div className="text-[#F5D77F] font-bold drop-shadow-sm">LIVE FETCHING</div>
            <div className="text-white/80 text-[11px] font-sans-editorial">Direct GET/POST requests with dynamic headers & custom agents</div>
          </div>
          <div className="p-4 rounded-xl border border-amber-400/20 bg-black/25 shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all space-y-1.5 min-w-0">
            <div className="text-[#F5D77F] font-bold drop-shadow-sm">STATUS DETECTION</div>
            <div className="text-white/80 text-[11px] font-sans-editorial">Automatic recovery on 401, 403 paywalls, 504 timeouts & redirects</div>
          </div>
          <div className="p-4 rounded-xl border border-amber-400/20 bg-black/25 shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all space-y-1.5 min-w-0">
            <div className="text-[#F5D77F] font-bold drop-shadow-sm">SPA EXTRACTION</div>
            <div className="text-white/80 text-[11px] font-sans-editorial">Headless DOM extraction for client-side JavaScript applications</div>
          </div>
          <div className="p-4 rounded-xl border border-amber-400/20 bg-black/25 shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all space-y-1.5 min-w-0">
            <div className="text-[#F5D77F] font-bold drop-shadow-sm">SEARCH GROUNDING</div>
            <div className="text-white/80 text-[11px] font-sans-editorial">Google Search Grounding fallback when primary domains fail</div>
          </div>
        </div>
      </div>
    </section>
  );
};
