import React from 'react';
import { Gauge, Cpu, Network, CheckCircle, Shield, Zap } from 'lucide-react';

export const BenchmarkRoiSection: React.FC = () => {
  return (
    <section id="architecture" className="relative py-20 sm:py-28 px-5 sm:px-10 md:px-12 max-w-6xl mx-auto w-full">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-[#F5D77F] text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(212,175,55,0.2)]">
          <Gauge className="w-3.5 h-3.5 text-[#F5D77F]" />
          <span>Empirical Performance &amp; ROI</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-stylish-heading italic font-normal text-white tracking-normal leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
          Radical velocity.{' '}
          <span className="text-gold-gradient block sm:inline">Zero enterprise extortion.</span>
        </h2>

        <p className="text-base sm:text-lg text-white/80 font-editorial leading-relaxed drop-shadow-sm">
          Built on a multi-model distributed architecture that replaces bloated 5-figure enterprise software with autonomous speed and cryptographic precision.
        </p>
      </div>

      {/* 4-Stat High-Impact ROI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {/* Stat 1 */}
        <div className="p-6 rounded-3xl border border-amber-400/30 bg-black/60 backdrop-blur-xl space-y-3 shadow-xl hover:border-amber-400/50 transition-colors">
          <div className="text-xs font-mono text-[#F5D77F] uppercase tracking-wider font-bold">Research Velocity</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            4.0h &rarr; <span className="text-gold-gradient">12m</span>
          </div>
          <p className="text-xs text-white/70 font-editorial leading-relaxed">
            95% reduction in research cycle time. From hours of tab-switching to a single coffee break.
          </p>
        </div>

        {/* Stat 2 */}
        <div className="p-6 rounded-3xl border border-amber-400/30 bg-black/60 backdrop-blur-xl space-y-3 shadow-xl hover:border-amber-400/50 transition-colors">
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">Hallucination Rate</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
            0.0%
          </div>
          <p className="text-xs text-white/70 font-editorial leading-relaxed">
            Every statement cites a cryptographic verbatim snippet with source URL. Zero fabricated claims.
          </p>
        </div>

        {/* Stat 3 */}
        <div className="p-6 rounded-3xl border border-amber-400/30 bg-black/60 backdrop-blur-xl space-y-3 shadow-xl hover:border-amber-400/50 transition-colors">
          <div className="text-xs font-mono text-[#F5D77F] uppercase tracking-wider font-bold">Continuous Tracking</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            42+ <span className="text-gold-gradient text-2xl font-bold">Domains</span>
          </div>
          <p className="text-xs text-white/70 font-editorial leading-relaxed">
            Multi-tenant autonomous radar checks pricing changes, feature drops, and SLA modifications.
          </p>
        </div>

        {/* Stat 4 */}
        <div className="p-6 rounded-3xl border border-amber-400/30 bg-black/60 backdrop-blur-xl space-y-3 shadow-xl hover:border-amber-400/50 transition-colors">
          <div className="text-xs font-mono text-[#F5D77F] uppercase tracking-wider font-bold">Annual Contract Lock-In</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            $0 <span className="text-emerald-400 text-xl font-bold">Saved $45k</span>
          </div>
          <p className="text-xs text-white/70 font-editorial leading-relaxed">
            Transparent self-serve monthly pricing. No sales qualification calls, no annual lock-in.
          </p>
        </div>
      </div>

      {/* Modern MNC Architectural Spec Box */}
      <div className="rounded-3xl border border-amber-400/30 bg-black/80 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-amber-400/20">
          <div>
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-[#F5D77F]" />
              <h3 className="text-xl font-bold text-white tracking-tight">Resilient Multi-Model Architecture</h3>
            </div>
            <p className="text-xs text-white/60 font-mono mt-1">
              Zero-Downtime Fallback Pipeline &bull; OpenRouter &bull; Gemini 2.5 Flash &bull; Heuristic Engine
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#F5D77F]">
            <Network className="w-4 h-4" />
            <span>99.99% Uptime Guarantee</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-black/50 border border-amber-400/15 space-y-2">
            <div className="text-[#F5D77F] font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Multi-Model AI Failover</span>
            </div>
            <p className="text-white/75 font-editorial text-xs leading-relaxed">
              If an AI model experiences latency, the pipeline automatically routes to secondary zero-cost OpenRouter models or Google Gemini with zero workflow interruption.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-amber-400/15 space-y-2">
            <div className="text-[#F5D77F] font-bold flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#F5D77F]" />
              <span>Deterministic Heuristic Engine</span>
            </div>
            <p className="text-white/75 font-editorial text-xs leading-relaxed">
              In complete upstream API blackouts, our proprietary deterministic heuristic extraction engines process claims so your pipeline never fails.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-amber-400/15 space-y-2">
            <div className="text-[#F5D77F] font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Strict Multi-Tenant Isolation</span>
            </div>
            <p className="text-white/75 font-editorial text-xs leading-relaxed">
              Each workspace is completely segregated in Neon PostgreSQL with zero cross-tenant contamination or training on your competitive queries.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
