import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface GrandFinaleCtaSectionProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const GrandFinaleCtaSection: React.FC<GrandFinaleCtaSectionProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-10 md:px-12 max-w-5xl mx-auto w-full text-center">
      {/* Radiant Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] sm:w-[48rem] h-80 bg-gradient-to-r from-amber-500/15 via-yellow-400/20 to-amber-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 rounded-3xl border border-amber-400/40 bg-gradient-to-b from-black/80 via-black/90 to-black/95 backdrop-blur-2xl p-8 sm:p-16 shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_60px_rgba(212,175,55,0.2)] space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-[#F5D77F] text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_12px_rgba(212,175,55,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-[#F5D77F]" />
          <span>Commence Market Intelligence</span>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-6xl font-stylish-heading italic font-normal text-white tracking-normal leading-[1.08] drop-shadow-[0_6px_36px_rgba(0,0,0,0.85)]">
            Know your market.{' '}
            <span className="text-gold-gradient block sm:inline">Move with clarity.</span>
          </h2>

          <p className="text-base sm:text-lg text-white/80 font-editorial leading-relaxed drop-shadow-sm">
            Stop guessing what competitors are doing. Start extracting verified evidence, detecting positioning gaps, and launching counter-campaigns in minutes.
          </p>
        </div>

        {/* Dual Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onGetStarted}
            className="group h-12 px-8 rounded-full bg-gradient-to-r from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] text-slate-950 font-bold text-sm inline-flex items-center justify-center gap-2 hover:shadow-[0_0_40px_rgba(245,215,127,0.85)] hover:scale-[1.03] active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(212,175,55,0.45)] min-h-[48px] w-full sm:w-auto"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onSignIn}
            className="h-12 px-7 rounded-full border border-amber-400/35 bg-black/40 text-white hover:text-[#F5D77F] hover:border-[#F5D77F] text-sm font-semibold inline-flex items-center justify-center transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] min-h-[48px] w-full sm:w-auto"
          >
            Sign In
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-6 border-t border-amber-400/15 flex flex-wrap items-center justify-center gap-6 text-xs text-white/70 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>No Credit Card Required</span>
          </span>
          <span>&bull;</span>
          <span>Instant Workspace Provisioning</span>
          <span>&bull;</span>
          <span className="text-[#F5D77F]">100% Cryptographic Grounding</span>
        </div>
      </div>
    </section>
  );
};
