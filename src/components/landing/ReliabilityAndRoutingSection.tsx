import React from 'react';
import { Shield, Lock, Cpu, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const ReliabilityAndRoutingSection: React.FC = () => {
  return (
    <section className="relative py-28 sm:py-36 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-28">
      {/* 16. Reliability & Graceful Failure */}
      <div className="space-y-10">
        <div className="space-y-4 max-w-2xl">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#9CCBFF]/70">
            16 &mdash; WEB FAULT TOLERANCE
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight leading-[1.15]">
            The real web is messy.
          </h2>
          <p className="text-base sm:text-lg text-[#A8AFBA] leading-relaxed">
            Live domains fail, cloud firewalls throw 403s, and single-page apps fail to render text. ResearchFlow is engineered to isolate failures rather than crashing the pipeline.
          </p>
        </div>

        {/* Real Edge Cases Grid */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#727A86]/20 bg-[#07090C]/80 backdrop-blur-md space-y-4">
          <div className="text-xs font-mono text-[#A8AFBA] pb-3 border-b border-[#727A86]/15 flex flex-wrap items-center justify-between gap-2">
            <span>RESILIENT STATE TRANSITION PIPELINE</span>
            <span className="text-[#9CCBFF]">PARTIAL SUCCESS GRACEFULLY HANDLED</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-lg border border-[#727A86]/20 bg-[#050608]/50 space-y-1">
              <div className="text-amber-400 font-semibold">401 &middot; 403 HTTP</div>
              <div className="text-[11px] text-[#727A86] font-sans">Paywalls detected & marked, search fallback triggered</div>
            </div>
            <div className="p-3.5 rounded-lg border border-[#727A86]/20 bg-[#050608]/50 space-y-1">
              <div className="text-amber-400 font-semibold">504 TIMEOUT</div>
              <div className="text-[11px] text-[#727A86] font-sans">Retries with exponential backoff before marking source failed</div>
            </div>
            <div className="p-3.5 rounded-lg border border-[#727A86]/20 bg-[#050608]/50 space-y-1">
              <div className="text-amber-400 font-semibold">DNS DROP</div>
              <div className="text-[11px] text-[#727A86] font-sans">Invalid domains cleanly flagged without halting valid siblings</div>
            </div>
            <div className="p-3.5 rounded-lg border border-[#727A86]/20 bg-[#050608]/50 space-y-1">
              <div className="text-emerald-400 font-semibold">PARTIAL STATUS</div>
              <div className="text-[11px] text-[#727A86] font-sans">2 of 3 sources succeed &rarr; marks job PARTIAL, never false success</div>
            </div>
          </div>
        </div>
      </div>

      {/* 17. Multi-Model Routing & 18. Injection Defense */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-[#727A86]/20">
        {/* Multi-Model Routing */}
        <div className="space-y-4">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#727A86]">
            17 &mdash; DYNAMIC MODEL ROUTING
          </div>
          <h3 className="text-2xl sm:text-3xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight">
            One intelligence layer. Multiple model paths.
          </h3>
          <p className="text-sm text-[#A8AFBA] leading-relaxed">
            ResearchFlow routes across Google Gemini and OpenRouter provider chains with automatic schema repair and deterministic fallback. If a provider experiences high demand, execution continues uninterrupted.
          </p>

          <div className="space-y-2 text-xs font-mono pt-2">
            <div className="p-3 rounded-lg border border-[#727A86]/20 bg-[#050608]/60 flex items-center justify-between text-[#F3F5F7]">
              <span>Primary Provider</span>
              <span className="text-[#9CCBFF]">Google Gemini 3.6 Flash</span>
            </div>
            <div className="p-3 rounded-lg border border-[#727A86]/20 bg-[#050608]/60 flex items-center justify-between text-[#F3F5F7]">
              <span>Failover Chain</span>
              <span className="text-[#A8AFBA]">OpenRouter Dynamic Catalog</span>
            </div>
            <div className="p-3 rounded-lg border border-[#727A86]/20 bg-[#050608]/60 flex items-center justify-between text-[#F3F5F7]">
              <span>Schema Resilience</span>
              <span className="text-emerald-400">Regex Repair + Structural Recovery</span>
            </div>
          </div>
        </div>

        {/* Prompt Injection Defense & Security */}
        <div className="space-y-4">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#727A86]">
            18 &mdash; UNTRUSTED CONTENT QUARANTINE
          </div>
          <h3 className="text-2xl sm:text-3xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight">
            Untrusted web content stays untrusted.
          </h3>
          <p className="text-sm text-[#A8AFBA] leading-relaxed">
            Scraped competitor websites may contain adversarial prompt injections or malicious instructions. ResearchFlow encloses all raw text in strict boundary containers.
          </p>

          <div className="p-4 rounded-xl border border-[#727A86]/25 bg-[#050608] space-y-2 text-xs font-mono [overflow-wrap:anywhere]">
            <div className="text-[10px] text-[#727A86] uppercase tracking-wider">Sanitization Envelope:</div>
            <div className="text-[#9CCBFF] break-all">&lt;untrusted_source_content&gt;</div>
            <div className="text-[#A8AFBA] pl-4 text-[11px] italic">
              Raw competitor HTML and text snippets treated strictly as data, never executed as directives.
            </div>
            <div className="text-[#9CCBFF] break-all">&lt;/untrusted_source_content&gt;</div>
          </div>

          <div className="pt-2 text-xs font-mono text-[#727A86] flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict tenant isolation &middot; Zero cross-workspace data leakage</span>
          </div>
        </div>
      </div>
    </section>
  );
};
