import React from 'react';
import { Network, Database, Target, Megaphone, CheckSquare, Search } from 'lucide-react';

export const AgenticWorkersSection: React.FC = () => {
  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-28">
      {/* 11. Specialized Intelligence Workers */}
      <div className="space-y-12">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[11px] sm:text-xs font-mono tracking-[0.24em] uppercase text-[#F5D77F] font-bold drop-shadow-sm">
            11 &mdash; MULTI-WORKER ORCHESTRATION
          </div>
          <h2 className="text-[clamp(2.4rem,6vw,4.25rem)] font-display font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-[0_6px_36px_rgba(0,0,0,0.85)]">
            One market. Multiple intelligence workers.
          </h2>
          <p className="text-lg sm:text-xl text-white/85 leading-relaxed font-sans-editorial drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            Rather than a single monolithic prompt, ResearchFlow coordinates specialized autonomous workers operating in lockstep around your business context.
          </p>
        </div>

        {/* Central Hub Visualization */}
        <div className="relative p-8 sm:p-12 rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.3)] overflow-hidden">
          {/* Central Context Node */}
          <div className="flex flex-col items-center text-center space-y-3 pb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] p-0.5 shadow-[0_0_36px_rgba(212,175,55,0.45)]">
              <div className="w-full h-full bg-slate-950/85 backdrop-blur-md rounded-[14px] flex items-center justify-center text-[#F5D77F]">
                <Network className="w-8 h-8" />
              </div>
            </div>
            <div>
              <div className="text-sm font-display font-bold text-white uppercase tracking-wider drop-shadow-sm">
                CORE BUSINESS CONTEXT
              </div>
              <div className="text-xs text-white/80 max-w-sm font-sans-editorial mt-1">
                Value proposition, target customer persona, and primary campaign goals
              </div>
            </div>
          </div>

          {/* Radiating 5 Worker Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 border-t border-white/15">
            <div className="p-4.5 rounded-2xl border border-white/10 bg-black/25 shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all space-y-2 text-left">
              <Search className="w-5 h-5 text-[#F5D77F]" />
              <div className="text-xs font-display font-bold text-white tracking-wider">RESEARCH</div>
              <p className="text-[11px] text-white/70 font-sans-editorial">Live crawling & raw retrieval</p>
            </div>

            <div className="p-4.5 rounded-2xl border border-white/10 bg-black/25 shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all space-y-2 text-left">
              <Database className="w-5 h-5 text-[#F5D77F]" />
              <div className="text-xs font-display font-bold text-white tracking-wider">EVIDENCE</div>
              <p className="text-[11px] text-white/70 font-sans-editorial">Atomic claim extraction</p>
            </div>

            <div className="p-4.5 rounded-2xl border border-white/10 bg-black/25 shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all space-y-2 text-left">
              <Target className="w-5 h-5 text-[#F5D77F]" />
              <div className="text-xs font-display font-bold text-white tracking-wider">COMPETITORS</div>
              <p className="text-[11px] text-white/70 font-sans-editorial">Matrix & gap mapping</p>
            </div>

            <div className="p-4.5 rounded-2xl border border-white/10 bg-black/25 shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all space-y-2 text-left">
              <Megaphone className="w-5 h-5 text-[#F5D77F]" />
              <div className="text-xs font-display font-bold text-white tracking-wider">CAMPAIGNS</div>
              <p className="text-[11px] text-white/70 font-sans-editorial">GTM messaging & assets</p>
            </div>

            <div className="p-4.5 rounded-2xl border border-white/10 bg-black/25 shadow-lg hover:border-amber-400/40 hover:bg-black/35 transition-all space-y-2 text-left col-span-2 sm:col-span-1">
              <CheckSquare className="w-5 h-5 text-[#F5D77F]" />
              <div className="text-xs font-display font-bold text-white tracking-wider">TASKS</div>
              <p className="text-[11px] text-white/70 font-sans-editorial">Kanban action items</p>
            </div>
          </div>
        </div>
      </div>

      {/* 12. Shared Business Context Flow */}
      <div className="space-y-8 pt-10 sm:pt-12 border-t border-amber-400/20 max-w-3xl">
        <div className="space-y-3">
          <div className="text-[11px] sm:text-xs font-mono tracking-[0.24em] uppercase text-[#F5D77F]/90 font-bold drop-shadow-sm">
            12 &mdash; CONNECTED INTELLIGENCE GRAPH
          </div>
          <h3 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Every decision starts from the same context.
          </h3>
          <p className="text-base sm:text-lg text-white/85 leading-relaxed font-sans-editorial drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            When research discovers a new competitor pricing change, that single observation ripples through the entire system:
          </p>
        </div>

        {/* Vertical Narrative Stepper */}
        <div className="space-y-4 pl-4 border-l-2 border-amber-400/40 text-sm font-sans-editorial text-white/80">
          <div className="flex items-start gap-3 text-white font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5D77F] mt-1.5 shrink-0 shadow-[0_0_8px_#D4AF37]" />
            <span>1. Live research discovers a competitor update</span>
          </div>
          <div className="flex items-start gap-3 text-white/90">
            <span className="w-2.5 h-2.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
            <span>2. Verbatim evidence is extracted and citation stored</span>
          </div>
          <div className="flex items-start gap-3 text-white/90">
            <span className="w-2.5 h-2.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
            <span>3. Competitive landscape matrix recalculates market whitespace</span>
          </div>
          <div className="flex items-start gap-3 text-white/90">
            <span className="w-2.5 h-2.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
            <span>4. Strategic campaign angles and channel copy adapt immediately</span>
          </div>
          <div className="flex items-start gap-3 text-[#F5D77F] font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5D77F] mt-1.5 shrink-0 shadow-[0_0_8px_#D4AF37]" />
            <span>5. Prioritized Kanban execution tasks are generated for your team</span>
          </div>
        </div>
      </div>
    </section>
  );
};
