import React, { useState } from 'react';
import { Layers, Linkedin, Globe, Search, Download, Copy, Check, ShieldCheck } from 'lucide-react';

export const CampaignStudioSection: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<'linkedin' | 'google' | 'seo'>('linkedin');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-[#07090E]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400 font-mono">
            Multi-Channel Creative Engine
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            From verified evidence to multi-channel distribution drafts.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Eliminate hours of copywriting brainstorming. ResearchFlow generates evidence-backed ad copy and content strategies tailored for LinkedIn, Google Search, and organic search.
          </p>
        </div>

        {/* Visual Channel Studio Canvas */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Channel Selector Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveChannel('linkedin')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeChannel === 'linkedin'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn Sponsored Creative</span>
              </button>

              <button
                onClick={() => setActiveChannel('google')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeChannel === 'google'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Google Search Ad (SERP)</span>
              </button>

              <button
                onClick={() => setActiveChannel('seo')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeChannel === 'seo'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>High-Intent SEO Pillar</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-800 text-xs font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{copied ? 'Copied' : 'Copy Copy Payload'}</span>
            </button>
          </div>

          {/* Visual Channel Previews */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Live Visual Mockup Preview */}
            <div className="lg:col-span-7 flex justify-center">
              {activeChannel === 'linkedin' && (
                <div className="max-w-md w-full bg-white text-zinc-900 rounded-2xl border border-zinc-300 shadow-xl overflow-hidden text-xs">
                  <div className="p-4 flex items-center justify-between border-b border-zinc-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        NR
                      </div>
                      <div>
                        <span className="font-bold text-zinc-900 block">NextGen Resume AI</span>
                        <span className="text-[10px] text-zinc-400">Promoted · Sponsored</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 text-zinc-800 space-y-2 leading-relaxed">
                    <p className="font-semibold text-zinc-900">
                      Still paying $29/mo for generic resume tools that fail automated ATS keyword checks?
                    </p>
                    <p className="text-[11px] text-zinc-600">
                      NextGen Resume AI is calibrated against verified technical recruiter benchmarks. 100% transparent pricing with zero annual pre-payment lock-in.
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-5 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Competitive Teardown</span>
                    <h5 className="text-sm font-bold">Why 78% of CS Grad Resumes Fail ATS Screening</h5>
                  </div>
                  <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono">researchflow.ai</span>
                    <button className="px-3 py-1 bg-blue-600 text-white font-bold rounded-md text-[11px]">
                      Start Free Trial
                    </button>
                  </div>
                </div>
              )}

              {activeChannel === 'google' && (
                <div className="max-w-lg w-full bg-white text-zinc-900 rounded-2xl border border-zinc-200 p-5 shadow-xl space-y-3 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 font-mono">
                    <span className="font-bold text-zinc-900">Sponsored</span>
                    <span>·</span>
                    <span>https://www.nextgenresume.ai/pricing</span>
                  </div>
                  <h4 className="text-sm font-medium text-blue-800 hover:underline leading-snug">
                    NextGen Resume AI — Verified Recruiter ATS Scoring vs Legacy Tools
                  </h4>
                  <p className="text-zinc-600 text-[11px] leading-relaxed">
                    Compare features and pricing transparently. Avoid 30% annual commitment surcharges. Instant 1-click migration.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 text-blue-800 text-[11px]">
                    <div className="p-2 bg-zinc-50 rounded font-semibold">Pricing Calculator</div>
                    <div className="p-2 bg-zinc-50 rounded font-semibold">Feature Comparison Matrix</div>
                  </div>
                </div>
              )}

              {activeChannel === 'seo' && (
                <div className="max-w-lg w-full bg-zinc-900 text-zinc-100 rounded-2xl border border-zinc-800 p-5 shadow-xl space-y-3 text-xs">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                    High-Intent Long-Tail Pillar Guide
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    "Novoresume vs NextGen Resume AI: 2026 ATS Screening Benchmark Comparison"
                  </h4>
                  <div className="space-y-1.5 text-[11px] text-zinc-400 font-mono bg-black/40 p-3 rounded-xl border border-zinc-800">
                    <p>Primary Keyword: novoresume alternative pricing</p>
                    <p>Secondary: resume ats checker pricing comparison</p>
                    <p>Target Word Count: 1,800 words · Intent: Commercial Investigation</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Strategy & Evidence Citations */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                  Lead Angle & Core Message
                </span>
                <h4 className="text-base font-bold text-white leading-snug">
                  "Stop Paying 30% Surplus for Unused Templates — NextGen Resume AI Aligns Candidates Directly with Real Hiring Benchmarks."
                </h4>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Grounded in 3 Verified Citations</span>
                <ul className="space-y-1 text-[11px] text-zinc-300">
                  <li className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Novoresume official pricing ($19 annual vs $29 monthly)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Kickresume Pro AI feature-gate restriction</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
