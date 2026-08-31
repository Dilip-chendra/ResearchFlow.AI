import React from 'react';
import { Cpu, ShieldCheck, Zap, Layers, Sparkles, ArrowRight, Check } from 'lucide-react';

export const MultiModelSection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-[#080A10]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 font-mono">
            Dynamic Model Orchestration
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            ResearchFlow chooses the right AI path for the task.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Rather than locking you into a single proprietary LLM, our orchestrator dynamically discovers zero-cost models on OpenRouter, routes by capability, and maintains instant fallback to Gemini.
          </p>
        </div>

        {/* Dynamic Multi-Tier Routing Architecture Card */}
        <div className="p-6 sm:p-10 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">Tier 01</span>
              <h4 className="font-bold text-white text-sm">Dynamic OpenRouter Free Catalog</h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Live discovery of available zero-cost models (DeepSeek R1, Llama 3.3 70B, Mistral).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Tier 02</span>
              <h4 className="font-bold text-white text-sm">Google Gemini 3.7 / 3.6 Flash</h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                High-speed reasoning with Google Search Grounding for JS-heavy web pages.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Tier 03</span>
              <h4 className="font-bold text-white text-sm">Self-Repair Schema Parser</h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Repairs truncated JSON, strips markdown tags, and guarantees type safety.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Tier 04</span>
              <h4 className="font-bold text-white text-sm">Deterministic Heuristic Engine</h4>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Zero-network fallback guaranteeing zero-failure research execution.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Prompt Injection Defense: Untrusted web data is sandboxed before LLM processing</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">Auto-balanced for zero cost</span>
          </div>
        </div>
      </div>
    </section>
  );
};
