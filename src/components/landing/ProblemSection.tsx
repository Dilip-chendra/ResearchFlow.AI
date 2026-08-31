import React from 'react';
import { Layers, FileSpreadsheet, MessageSquare, AlertCircle, Check, ArrowDown, Sparkles } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-[#080A0F]/80">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Title */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-400 font-mono">
            The Structural Bottleneck
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            The problem isn’t a lack of information.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Product and growth teams already have access to competitor websites, pricing pages, customer teardowns, spreadsheets, and AI chatbots.
            The problem is that these inputs remain disconnected, unstructured, and unverifiable.
          </p>
        </div>

        {/* Comparison: The Fragmented Chaos vs The Unified Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* 1. Fragmented Traditional Workflow (Pain) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-rose-950/40 space-y-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  The Fragmented Reality
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">~4+ hours / sprint</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 mt-0.5 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-200 block">10+ Disconnected Browser Tabs</span>
                    <span className="text-zinc-400 text-[11px]">
                      Pricing tables, feature matrices, and blogs manually scanned and copy-pasted.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 mt-0.5 shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-200 block">Stale Spreadsheets & Notion Tables</span>
                    <span className="text-zinc-400 text-[11px]">
                      Outdated as soon as a competitor changes a pricing tier or launches a feature.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 mt-0.5 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-200 block">Generic AI Chatbot Hallucinations</span>
                    <span className="text-zinc-400 text-[11px]">
                      ChatGPT invents nonexistent competitor pricing with zero citation traceability.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 mt-0.5 shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-200 block">Execution Disconnect</span>
                    <span className="text-zinc-400 text-[11px]">
                      Strategy docs sit unread in Google Drive without generating executable tasks.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-900/30 text-rose-300 text-xs font-mono">
              Outcome: Research repeated every month · Decisions based on assumptions
            </div>
          </div>

          {/* 2. ResearchFlow AI Unified Operational Pipeline */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#111422] to-[#0A0D17] border border-indigo-500/30 space-y-6 flex flex-col justify-between shadow-2xl shadow-indigo-950/40 relative">
            <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-0.5 bg-indigo-600 text-white font-bold text-[10px] rounded-full uppercase tracking-wider shadow-md">
              The ResearchFlow Standard
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  One Unified Evidence Pipeline
                </span>
                <span className="text-[11px] text-emerald-400 font-mono font-bold">~80 seconds automated</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">1. Autonomous Web Crawler</span>
                    <span className="text-zinc-300 text-[11px]">
                      Extracts visible claims, pricing structures, and positioning directly from live pages.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">2. Verifiable Evidence Graph</span>
                    <span className="text-zinc-300 text-[11px]">
                      Strictly separates FACT, INFERENCE, and WARNING with 100% citation traceability.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">3. Strategic Positioning Gaps</span>
                    <span className="text-zinc-300 text-[11px]">
                      Identifies actionable market opportunities and flags cross-source discrepancies.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 mt-0.5 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">4. Multi-Channel Briefs & Tasks</span>
                    <span className="text-zinc-300 text-[11px]">
                      Generates LinkedIn, Email, and SEO drafts linked directly to a persistent task board.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
              <span>Zero hallucinations · Human operator in control</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
