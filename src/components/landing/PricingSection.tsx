import React, { useState } from 'react';
import { Check, Zap, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface PricingSectionProps {
  onGetStarted: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onGetStarted }) => {
  const { setIsPricingModalOpen } = useWorkspace();
  const [isAnnual, setIsAnnual] = useState(true);

  const handleCta = () => {
    setIsPricingModalOpen(true);
  };

  return (
    <section id="pricing" className="relative py-20 sm:py-28 px-5 sm:px-10 md:px-12 max-w-6xl mx-auto w-full">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-[#F5D77F] text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(212,175,55,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-[#F5D77F]" />
          <span>Transparent Pricing</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-stylish-heading italic font-normal text-white tracking-normal leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
          Predictable investment.{' '}
          <span className="text-gold-gradient block sm:inline">Unmatched ROI.</span>
        </h2>

        <p className="text-base sm:text-lg text-white/80 font-editorial leading-relaxed drop-shadow-sm">
          No 5-figure annual sales contracts. Start free with full evidence extraction, then scale as your competitive radar expands.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3 text-xs font-mono">
          <span className={!isAnnual ? 'text-white font-bold' : 'text-white/60'}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-black/80 border border-amber-400/40 p-0.5 relative transition-colors focus:outline-none"
            aria-label="Toggle annual billing"
          >
            <div
              className={`w-5 h-5 rounded-full bg-gradient-to-r from-[#FFF3B0] to-[#D4AF37] transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={isAnnual ? 'text-[#F5D77F] font-bold' : 'text-white/60'}>
            Annual <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">Save 20%</span>
          </span>
        </div>
      </div>

      {/* 3 Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* Plan 1: Starter */}
        <div className="rounded-3xl border border-amber-400/25 bg-black/60 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between space-y-8 shadow-xl hover:border-amber-400/40 transition-colors">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Starter</h3>
              <p className="text-xs text-white/60 font-mono">For early founders verifying product market positioning.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">$0</span>
              <span className="text-xs text-white/60 font-mono">/ forever free</span>
            </div>

            <ul className="space-y-3 text-xs text-white/80 font-mono">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>3 Competitor Research Runs</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verbatim Evidence Citations</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Basic Battlecard Export</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1 Workspace Seat</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onGetStarted}
            className="w-full h-11 rounded-full border border-amber-400/35 bg-black/50 text-white hover:text-[#F5D77F] hover:border-[#F5D77F] text-xs font-bold font-mono transition-all flex items-center justify-center gap-2"
          >
            <span>Start Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Plan 2: Pro (Featured / Most Popular) */}
        <div className="relative rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-950/25 via-black/80 to-black/95 backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between space-y-8 shadow-[0_20px_60px_rgba(212,175,55,0.3)] transform md:-translate-y-2">
          {/* Top Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] text-slate-950 text-[10px] font-mono font-black uppercase tracking-wider shadow-md">
            Most Popular &bull; High Velocity
          </div>

          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-between">
                <span>Growth / Pro</span>
                <Zap className="w-4 h-4 text-[#F5D77F]" />
              </h3>
              <p className="text-xs text-[#F5D77F] font-mono">For growing marketing &amp; product teams.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">
                {isAnnual ? '$39' : '$49'}
              </span>
              <span className="text-xs text-white/60 font-mono">/ seat / month</span>
            </div>

            <ul className="space-y-3 text-xs text-white/90 font-mono">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F5D77F] shrink-0" />
                <span className="font-semibold text-white">Unlimited Competitor Crawls</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F5D77F] shrink-0" />
                <span>Continuous Conflict Radar Alerts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F5D77F] shrink-0" />
                <span>Multi-Channel Campaign Generator</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F5D77F] shrink-0" />
                <span>Automated Kanban Task Handoff</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#F5D77F] shrink-0" />
                <span>5 Team Member Seats</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleCta}
            className="w-full h-11 rounded-full bg-gradient-to-r from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] text-slate-950 font-bold text-xs font-mono shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Upgrade to Pro</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </button>
        </div>

        {/* Plan 3: Enterprise */}
        <div className="rounded-3xl border border-amber-400/25 bg-black/60 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between space-y-8 shadow-xl hover:border-amber-400/40 transition-colors">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Enterprise</h3>
              <p className="text-xs text-white/60 font-mono">For scale-ups monitoring broad markets.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">
                {isAnnual ? '$159' : '$199'}
              </span>
              <span className="text-xs text-white/60 font-mono">/ seat / month</span>
            </div>

            <ul className="space-y-3 text-xs text-white/80 font-mono">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom Domain Scraping Proxies</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dedicated OpenRouter Model Routing</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Slack &amp; Jira Enterprise Webhooks</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlimited Seats &amp; Dedicated PMM Support</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleCta}
            className="w-full h-11 rounded-full border border-amber-400/35 bg-black/50 text-white hover:text-[#F5D77F] hover:border-[#F5D77F] text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Contact Enterprise</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
