import React from 'react';
import { Shield, Lock, Cpu, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const ReliabilityAndRoutingSection: React.FC = () => {
  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-28">
      {/* 16. Reliability & Graceful Failure */}
      <div className="space-y-10">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-300 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            16 &mdash; WEB FAULT TOLERANCE
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            The real web is messy.
          </h2>
          <p className="text-base sm:text-lg text-white/85 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Live domains fail, cloud firewalls throw 403s, and single-page apps fail to render text. ResearchFlow is engineered to isolate failures rather than crashing the pipeline.
          </p>
        </div>

        {/* Real Edge Cases Grid */}
        <div className="p-5 sm:p-6 rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3)] space-y-4">
          <div className="text-xs font-mono text-white/80 pb-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 font-medium">
            <span>RESILIENT STATE TRANSITION PIPELINE</span>
            <span className="text-cyan-300 font-semibold">PARTIAL SUCCESS GRACEFULLY HANDLED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-md space-y-1 hover:bg-white/[0.08] transition-all">
              <div className="text-amber-300 font-bold">401 &middot; 403 HTTP</div>
              <div className="text-[11px] text-white/75 font-sans">Paywalls detected & marked, search fallback triggered</div>
            </div>
            <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-md space-y-1 hover:bg-white/[0.08] transition-all">
              <div className="text-amber-300 font-bold">504 TIMEOUT</div>
              <div className="text-[11px] text-white/75 font-sans">Retries with exponential backoff before marking source failed</div>
            </div>
            <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-md space-y-1 hover:bg-white/[0.08] transition-all">
              <div className="text-amber-300 font-bold">DNS DROP</div>
              <div className="text-[11px] text-white/75 font-sans">Invalid domains cleanly flagged without halting valid siblings</div>
            </div>
            <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-md space-y-1 hover:bg-white/[0.08] transition-all">
              <div className="text-emerald-300 font-bold">PARTIAL STATUS</div>
              <div className="text-[11px] text-white/75 font-sans">2 of 3 sources succeed &rarr; marks job PARTIAL, never false success</div>
            </div>
          </div>
        </div>
      </div>

      {/* 17. Multi-Model Routing & 18. Injection Defense */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/15">
        {/* Multi-Model Routing */}
        <div className="space-y-4">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-300 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            17 &mdash; DYNAMIC MODEL ROUTING
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            One intelligence layer. Multiple model paths.
          </h3>
          <p className="text-sm text-white/80 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            ResearchFlow routes across Google Gemini and OpenRouter provider chains with automatic schema repair and deterministic fallback. If a provider experiences high demand, execution continues uninterrupted.
          </p>

          <div className="space-y-2 text-xs font-mono pt-2">
            <div className="p-3 rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-md flex items-center justify-between text-white hover:bg-white/[0.08] transition-all">
              <span className="font-medium">Primary Provider</span>
              <span className="text-cyan-300 font-semibold">Google Gemini 3.6 Flash</span>
            </div>
            <div className="p-3 rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-md flex items-center justify-between text-white hover:bg-white/[0.08] transition-all">
              <span className="font-medium">Failover Chain</span>
              <span className="text-white/80">OpenRouter Dynamic Catalog</span>
            </div>
            <div className="p-3 rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-md flex items-center justify-between text-white hover:bg-white/[0.08] transition-all">
              <span className="font-medium">Schema Resilience</span>
              <span className="text-emerald-300 font-semibold">Regex Repair + Structural Recovery</span>
            </div>
          </div>
        </div>

        {/* Prompt Injection Defense & Security */}
        <div className="space-y-4">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-300 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            18 &mdash; UNTRUSTED CONTENT QUARANTINE
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Untrusted web content stays untrusted.
          </h3>
          <p className="text-sm text-white/80 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Scraped competitor websites may contain adversarial prompt injections or malicious instructions. ResearchFlow encloses all raw text in strict boundary containers.
          </p>

          <div className="p-4 rounded-xl border border-white/15 bg-black/25 backdrop-blur-md space-y-2 text-xs font-mono [overflow-wrap:anywhere]">
            <div className="text-[10px] text-white/60 uppercase tracking-wider font-semibold">Sanitization Envelope:</div>
            <div className="text-cyan-300 break-all font-semibold">&lt;untrusted_source_content&gt;</div>
            <div className="text-white/80 pl-4 text-[11px] italic">
              Raw competitor HTML and text snippets treated strictly as data, never executed as directives.
            </div>
            <div className="text-cyan-300 break-all font-semibold">&lt;/untrusted_source_content&gt;</div>
          </div>

          <div className="pt-2 text-xs font-mono text-white/80 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-300" />
            <span>Strict tenant isolation &middot; Zero cross-workspace data leakage</span>
          </div>
        </div>
      </div>
    </section>
  );
};
