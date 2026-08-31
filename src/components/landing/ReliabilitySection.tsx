import React from 'react';
import { ShieldAlert, RefreshCw, CheckCircle2, ArrowRight, Activity, Zap, Cpu } from 'lucide-react';

export const ReliabilitySection: React.FC = () => {
  return (
    <section id="reliability" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-[#07090E]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">
            Zero-Failure Resilience
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            When something fails, the workflow shouldn’t.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            External websites block scrapers and AI providers hit rate limits. ResearchFlow is engineered with multi-tier circuit breakers and self-repairing schemas so you never lose research work.
          </p>
        </div>

        {/* 3 Interactive Recovery Scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Scenario 1: AI Provider Rate Limit Fallback */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  Scenario 01
                </span>
                <span className="text-[10px] font-mono text-indigo-400">AI Model Outage</span>
              </div>
              <h4 className="font-bold text-white text-sm">
                Automatic Model Failover
              </h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                When a primary zero-cost model hits a rate limit or 503 error, the orchestrator seamlessly trips to the next candidate model in under 50ms.
              </p>

              {/* Visual Failover Step */}
              <div className="space-y-2 pt-2">
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-zinc-400">Primary Model (DeepSeek R1)</span>
                  <span className="text-rose-400 font-bold">429 RATE LIMIT</span>
                </div>
                <div className="flex justify-center -my-1">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 rotate-90" />
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-zinc-200 font-bold">Fallback Model (Gemini 3.7)</span>
                  <span className="text-emerald-400 font-bold">✓ SUCCESS (320ms)</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-zinc-500 font-mono pt-2 border-t border-zinc-800/80">
              Recovery: 100% Automated · 0 Lost Pipelines
            </div>
          </div>

          {/* Scenario 2: Anti-Bot 403 Firewall Fallback */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  Scenario 02
                </span>
                <span className="text-[10px] font-mono text-amber-400">Anti-Bot Firewall</span>
              </div>
              <h4 className="font-bold text-white text-sm">
                Google Search Grounding
              </h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                If a competitor website blocks direct HTTP scraping with Cloudflare, ResearchFlow activates live Google Search Grounding to parse public snippets.
              </p>

              {/* Visual Scraping Recovery */}
              <div className="space-y-2 pt-2">
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-zinc-400">Direct Scrape (HTTP 403)</span>
                  <span className="text-rose-400 font-bold">BLOCKED</span>
                </div>
                <div className="flex justify-center -my-1">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 rotate-90" />
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-zinc-200 font-bold">Google Grounding Fallback</span>
                  <span className="text-emerald-400 font-bold">✓ CRAWLED (1,450 words)</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-zinc-500 font-mono pt-2 border-t border-zinc-800/80">
              Status: Marked Partial · Verified Grounded
            </div>
          </div>

          {/* Scenario 3: Corrupted Schema Self-Repair */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                  Scenario 03
                </span>
                <span className="text-[10px] font-mono text-purple-400">Schema Recovery</span>
              </div>
              <h4 className="font-bold text-white text-sm">
                JSON Self-Repair Engine
              </h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                If an AI model truncates or misformats JSON syntax, the built-in repair parser extracts the structured payload or trips deterministic heuristics.
              </p>

              {/* Visual Schema Repair */}
              <div className="space-y-2 pt-2">
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-zinc-400">Malformed LLM Output</span>
                  <span className="text-rose-400 font-bold">SYNTAX ERR</span>
                </div>
                <div className="flex justify-center -my-1">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 rotate-90" />
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-zinc-200 font-bold">Self-Repair Regex Parser</span>
                  <span className="text-emerald-400 font-bold">✓ VALIDATED</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-zinc-500 font-mono pt-2 border-t border-zinc-800/80">
              Zero Crashes · Deterministic Fallbacks
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
