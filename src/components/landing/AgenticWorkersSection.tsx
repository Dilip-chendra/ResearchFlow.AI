import React from 'react';
import { Network, Database, Target, Megaphone, CheckSquare, Search } from 'lucide-react';

export const AgenticWorkersSection: React.FC = () => {
  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-28">
      {/* 11. Specialized Intelligence Workers */}
      <div className="space-y-12">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#9CCBFF]/70">
            11 &mdash; MULTI-WORKER ORCHESTRATION
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight leading-[1.15]">
            One market. Multiple intelligence workers.
          </h2>
          <p className="text-base sm:text-lg text-[#A8AFBA] leading-relaxed">
            Rather than a single monolithic prompt, ResearchFlow coordinates specialized autonomous workers operating in lockstep around your business context.
          </p>
        </div>

        {/* Central Hub Visualization */}
        <div className="relative p-8 sm:p-12 rounded-3xl border border-[#727A86]/20 bg-[#07090C]/80 backdrop-blur-md overflow-hidden">
          {/* Subtle Background Radial */}
          <div className="absolute inset-0 bg-radial-gradient from-[#9CCBFF]/5 via-transparent to-transparent pointer-events-none" />

          {/* Central Context Node */}
          <div className="flex flex-col items-center text-center space-y-3 pb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#738BFF] to-[#9CCBFF] p-0.5 shadow-[0_0_32px_rgba(156,203,255,0.3)]">
              <div className="w-full h-full bg-[#050608] rounded-[14px] flex items-center justify-center text-[#9CCBFF]">
                <Network className="w-7 h-7" />
              </div>
            </div>
            <div>
              <div className="text-sm font-mono font-semibold text-[#F3F5F7] uppercase tracking-wider">
                CORE BUSINESS CONTEXT
              </div>
              <div className="text-xs text-[#A8AFBA] max-w-sm">
                Value proposition, target customer persona, and primary campaign goals
              </div>
            </div>
          </div>

          {/* Radiating 5 Worker Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 border-t border-[#727A86]/15">
            <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#050608]/60 space-y-2 text-left">
              <Search className="w-4 h-4 text-[#9CCBFF]" />
              <div className="text-xs font-mono font-medium text-[#F3F5F7]">RESEARCH</div>
              <p className="text-[10px] text-[#727A86]">Live crawling & raw retrieval</p>
            </div>

            <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#050608]/60 space-y-2 text-left">
              <Database className="w-4 h-4 text-[#9CCBFF]" />
              <div className="text-xs font-mono font-medium text-[#F3F5F7]">EVIDENCE</div>
              <p className="text-[10px] text-[#727A86]">Atomic claim extraction</p>
            </div>

            <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#050608]/60 space-y-2 text-left">
              <Target className="w-4 h-4 text-[#9CCBFF]" />
              <div className="text-xs font-mono font-medium text-[#F3F5F7]">COMPETITORS</div>
              <p className="text-[10px] text-[#727A86]">Matrix & gap mapping</p>
            </div>

            <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#050608]/60 space-y-2 text-left">
              <Megaphone className="w-4 h-4 text-[#9CCBFF]" />
              <div className="text-xs font-mono font-medium text-[#F3F5F7]">CAMPAIGNS</div>
              <p className="text-[10px] text-[#727A86]">GTM messaging & assets</p>
            </div>

            <div className="p-4 rounded-xl border border-[#727A86]/20 bg-[#050608]/60 space-y-2 text-left col-span-2 sm:col-span-1">
              <CheckSquare className="w-4 h-4 text-[#9CCBFF]" />
              <div className="text-xs font-mono font-medium text-[#F3F5F7]">TASKS</div>
              <p className="text-[10px] text-[#727A86]">Kanban action items</p>
            </div>
          </div>
        </div>
      </div>

      {/* 12. Shared Business Context Flow */}
      <div className="space-y-8 pt-10 border-t border-[#727A86]/20 max-w-3xl">
        <div className="space-y-3">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#727A86]">
            12 &mdash; CONNECTED INTELLIGENCE GRAPH
          </div>
          <h3 className="text-2xl sm:text-4xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight">
            Every decision starts from the same context.
          </h3>
          <p className="text-sm sm:text-base text-[#A8AFBA] leading-relaxed">
            When research discovers a new competitor pricing change, that single observation ripples through the entire system:
          </p>
        </div>

        {/* Vertical Narrative Stepper */}
        <div className="space-y-3 pl-4 border-l border-[#9CCBFF]/30 text-xs font-mono text-[#A8AFBA]">
          <div className="flex items-start gap-2.5 text-[#F3F5F7]">
            <span className="w-2 h-2 rounded-full bg-[#9CCBFF] mt-1 shrink-0" />
            <span>1. Live research discovers a competitor update</span>
          </div>
          <div className="flex items-start gap-2.5 text-[#A8AFBA]">
            <span className="w-2 h-2 rounded-full bg-[#727A86] mt-1 shrink-0" />
            <span>2. Verbatim evidence is extracted and citation stored</span>
          </div>
          <div className="flex items-start gap-2.5 text-[#A8AFBA]">
            <span className="w-2 h-2 rounded-full bg-[#727A86] mt-1 shrink-0" />
            <span>3. Competitive landscape matrix recalculates market whitespace</span>
          </div>
          <div className="flex items-start gap-2.5 text-[#A8AFBA]">
            <span className="w-2 h-2 rounded-full bg-[#727A86] mt-1 shrink-0" />
            <span>4. Strategic campaign angles and channel copy adapt immediately</span>
          </div>
          <div className="flex items-start gap-2.5 text-[#9CCBFF]">
            <span className="w-2 h-2 rounded-full bg-[#9CCBFF] mt-1 shrink-0" />
            <span>5. Prioritized Kanban execution tasks are generated for your team</span>
          </div>
        </div>
      </div>
    </section>
  );
};
