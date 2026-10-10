import React, { useState } from 'react';
import { Check, Zap, Sparkles, ArrowRight, Shield, Cpu, KeyRound } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface PricingSectionProps {
  onGetStarted: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onGetStarted }) => {
  const { setIsPricingModalOpen } = useWorkspace();
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedAIMode, setSelectedAIMode] = useState<'MANAGED' | 'BYOK'>('MANAGED');

  const handleCta = () => {
    setIsPricingModalOpen(true);
  };

  // Real plan pricing from server/billing/planCatalog.ts
  const plansData = [
    {
      id: 'free',
      name: 'Free Community',
      badge: 'Free Forever',
      description: 'Explore verified market intelligence and test research pipelines.',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        '2 Deep Market Research Runs / month',
        '5 Competitor Crawl Pages / month',
        '50,000 Managed AI Tokens / month',
        'Basic Evidence & Fact Extraction',
        'BYOK (Bring Your Own Key) Allowed',
        'Community Support',
      ],
      highlighted: false,
    },
    {
      id: selectedAIMode === 'MANAGED' ? 'starter_managed' : 'starter_byok',
      name: selectedAIMode === 'MANAGED' ? 'Starter (Managed AI)' : 'Starter (BYOK)',
      badge: selectedAIMode === 'MANAGED' ? 'Zero Setup' : 'Direct API Keys',
      description:
        selectedAIMode === 'MANAGED'
          ? 'All-inclusive platform with zero API keys to configure. Ideal for solo founders.'
          : 'Cost-efficient plan for teams using direct provider API keys with zero token markup.',
      monthlyPrice: selectedAIMode === 'MANAGED' ? 999 : 399,
      annualPrice: selectedAIMode === 'MANAGED' ? 9990 : 3990,
      features: [
        '10 Deep Market Research Runs / month',
        '25 Competitor Crawl Pages / month',
        selectedAIMode === 'MANAGED'
          ? '500,000 Managed AI Tokens / month'
          : 'Zero token markup (Direct provider keys)',
        'Cross-Source Conflict Detection',
        'Market War Room & Strategic Matrix',
        'Export PDF & Markdown Briefs',
        'Standard Multi-Model AI Routing',
        'Email Support (48h response)',
      ],
      highlighted: false,
    },
    {
      id: selectedAIMode === 'MANAGED' ? 'pro_managed' : 'pro_byok',
      name: selectedAIMode === 'MANAGED' ? 'Pro (Managed AI)' : 'Pro (BYOK)',
      badge: 'Most Popular',
      description:
        selectedAIMode === 'MANAGED'
          ? 'Full competitive command center for fast-moving product marketing and strategy teams.'
          : 'Pro command center powered by your enterprise API keys with direct provider pricing.',
      monthlyPrice: selectedAIMode === 'MANAGED' ? 2999 : 1199,
      annualPrice: selectedAIMode === 'MANAGED' ? 29990 : 11990,
      features: [
        '50 Deep Market Research Runs / month',
        '100 Competitor Crawl Pages / month',
        selectedAIMode === 'MANAGED'
          ? '2,500,000 Managed AI Tokens / month'
          : 'Direct provider token billing (No markup)',
        'Unlimited Market War Room Simulations',
        'Competitor Move Monitor & Shift Tracking',
        'Custom Positioning & Campaign Briefs',
        'Priority AI Routing & Automatic Fallback',
        'Kanban Action Task Integration',
        'Priority Support (12h response)',
      ],
      highlighted: true,
    },
    {
      id: selectedAIMode === 'MANAGED' ? 'business_managed' : 'business_byok',
      name: selectedAIMode === 'MANAGED' ? 'Business (Managed AI)' : 'Business (BYOK)',
      badge: selectedAIMode === 'MANAGED' ? 'Enterprise Grade' : 'High Volume',
      description:
        selectedAIMode === 'MANAGED'
          ? 'Scale market intelligence across multiple business units and high-frequency monitoring.'
          : 'High-volume research infrastructure backed by your custom corporate model agreements.',
      monthlyPrice: selectedAIMode === 'MANAGED' ? 7999 : 3499,
      annualPrice: selectedAIMode === 'MANAGED' ? 79990 : 34990,
      features: [
        '500 Deep Market Research Runs / month',
        '500 Competitor Crawl Pages / month',
        selectedAIMode === 'MANAGED'
          ? '10,000,000 Managed AI Tokens / month'
          : 'Unlimited AI Token Usage (Direct contracts)',
        'Highest Priority AI Compute Allocation',
        'Advanced Custom Evaluation Benchmark Runs',
        'Deep Company Footprint Discovery Engine',
        'Dedicated Slack/Teams Channel Support',
        'Custom SLA & 99.9% Uptime Guarantee',
      ],
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-20 sm:py-28 px-5 sm:px-10 md:px-12 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-[#F5D77F] text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(212,175,55,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-[#F5D77F]" />
          <span>Transparent SaaS Pricing</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-stylish-heading italic font-normal text-white tracking-normal leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
          Predictable investment.{' '}
          <span className="text-gold-gradient block sm:inline">Unmatched ROI.</span>
        </h2>

        <p className="text-base sm:text-lg text-white/80 font-editorial leading-relaxed drop-shadow-sm">
          No 5-figure annual sales lock-in. Choose between all-inclusive Managed AI or Bring Your Own Key (BYOK) with zero token markup.
        </p>

        {/* Dual Segmented Controls: AI Mode & Billing Interval */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {/* AI Compute Architecture Switch */}
          <div className="inline-flex p-1 bg-black/70 rounded-2xl border border-amber-400/25 shadow-lg">
            <button
              onClick={() => setSelectedAIMode('MANAGED')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedAIMode === 'MANAGED'
                  ? 'bg-amber-400/20 text-[#F5D77F] border border-amber-400/40 shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'text-white/60 hover:text-white border border-transparent'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-[#F5D77F]" />
              <span>Managed AI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-medium">Zero Setup</span>
            </button>
            <button
              onClick={() => setSelectedAIMode('BYOK')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedAIMode === 'BYOK'
                  ? 'bg-amber-400/20 text-[#F5D77F] border border-amber-400/40 shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'text-white/60 hover:text-white border border-transparent'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>Bring Your Own Key</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-medium">Direct Provider</span>
            </button>
          </div>

          {/* Monthly / Annual Billing Toggle */}
          <div className="inline-flex p-1 bg-black/70 rounded-2xl border border-amber-400/25 shadow-lg items-center text-xs font-mono">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                !isAnnual
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-white/60 hover:text-white border border-transparent'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isAnnual
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-white/60 hover:text-white border border-transparent'
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                Save 2 Mo
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plansData.map((plan) => {
          const rawPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const displayPrice = isAnnual && rawPrice > 0 ? Math.round(rawPrice / 12) : rawPrice;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
                plan.highlighted
                  ? 'border-2 border-amber-400/80 bg-gradient-to-b from-[#181C2B] to-[#11131E] shadow-[0_0_40px_rgba(212,175,55,0.25)] ring-1 ring-amber-400/30 transform lg:-translate-y-2'
                  : 'border border-amber-400/20 bg-black/60 backdrop-blur-xl hover:border-amber-400/40 shadow-xl'
              }`}
            >
              {/* Opaque Pill Badge - Completely masks the card top border */}
              {plan.badge && (
                <div
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider shadow-lg z-20 whitespace-nowrap ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] text-slate-950 shadow-[0_0_16px_rgba(212,175,55,0.6)]'
                      : 'bg-[#090A0F] border border-amber-400/40 text-[#F5D77F] shadow-[0_2px_10px_rgba(0,0,0,0.9)]'
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="space-y-5 pt-1">
                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-white/65 mt-1 line-clamp-2 leading-relaxed font-editorial">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display in INR (₹) matching real application */}
                <div className="pb-4 border-b border-amber-400/15">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-[#F5D77F]">₹</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {displayPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-mono text-white/60">/mo</span>
                  </div>
                  {isAnnual && rawPrice > 0 && (
                    <div className="text-[11px] text-[#F5D77F] font-mono font-semibold mt-1">
                      Billed ₹{rawPrice.toLocaleString('en-IN')}/yr (2 months free)
                    </div>
                  )}
                  {rawPrice === 0 && (
                    <div className="text-[11px] text-white/50 font-mono mt-1">
                      No credit card required
                    </div>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 text-xs text-white/80 font-mono">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <button
                  onClick={plan.monthlyPrice === 0 ? onGetStarted : handleCta}
                  className={`w-full h-11 rounded-full text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] text-slate-950 shadow-[0_0_20px_rgba(212,175,55,0.45)] hover:scale-[1.02] active:scale-[0.98]'
                      : 'border border-amber-400/35 bg-black/50 text-white hover:text-[#F5D77F] hover:border-[#F5D77F]'
                  }`}
                >
                  <span>{plan.monthlyPrice === 0 ? 'Start Free' : 'Choose Plan'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
