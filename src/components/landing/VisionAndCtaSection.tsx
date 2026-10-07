import React from 'react';
import { ArrowRight } from 'lucide-react';

interface VisionAndCtaSectionProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const VisionAndCtaSection: React.FC<VisionAndCtaSectionProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  return (
    <section className="relative py-32 sm:py-44 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-36">
      {/* 24. Vision */}
      <div className="space-y-8 max-w-3xl">
        <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#9CCBFF]/70">
          24 &mdash; THE PERSPECTIVE
        </div>

        <div className="space-y-6 text-2xl sm:text-4xl md:text-5xl font-sans-editorial font-normal text-[#F3F5F7] tracking-tight leading-[1.25]">
          <p>The web already contains the information.</p>
          <p className="text-[#A8AFBA]">The advantage is knowing what matters.</p>
          <p className="text-[#9CCBFF] font-medium">And what to do next.</p>
        </div>
      </div>

      {/* 25. Final CTA */}
      <div className="pt-12 border-t border-[#727A86]/20 max-w-2xl space-y-8">
        <div className="space-y-4">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#727A86]">
            25 &mdash; COMMENCE INTELLIGENCE
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans-editorial font-medium text-[#F3F5F7] tracking-tight leading-tight">
            Know your market.{' '}
            <span className="text-[#9CCBFF] block sm:inline">Move with clarity.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#A8AFBA] leading-relaxed">
            ResearchFlow turns competitive research into evidence-backed intelligence and action.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
          <button
            onClick={onGetStarted}
            className="group h-12 sm:h-11 px-7 rounded-full bg-[#F3F5F7] text-[#050608] font-medium text-sm inline-flex items-center justify-center gap-2 hover:bg-white hover:shadow-[0_0_24px_rgba(156,203,255,0.4)] transition-all"
          >
            <span>Explore ResearchFlow</span>
            <ArrowRight className="w-4 h-4 text-[#050608]/70 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onSignIn}
            className="h-12 sm:h-11 px-6 rounded-full border border-[#727A86]/30 text-[#A8AFBA] hover:text-[#F3F5F7] hover:border-[#9CCBFF]/40 text-sm font-normal inline-flex items-center justify-center transition-all"
          >
            Sign in
          </button>
        </div>
      </div>
    </section>
  );
};
