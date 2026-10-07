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
        <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-300 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          24 &mdash; THE PERSPECTIVE
        </div>

        <div className="space-y-6 text-2xl sm:text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.25] drop-shadow-[0_3px_20px_rgba(0,0,0,0.85)]">
          <p>The web already contains the information.</p>
          <p className="text-white/80">The advantage is knowing what matters.</p>
          <p className="text-cyan-300 drop-shadow-[0_0_20px_rgba(156,203,255,0.5)]">And what to do next.</p>
        </div>
      </div>

      {/* 25. Final CTA */}
      <div className="pt-12 border-t border-white/15 max-w-2xl space-y-8">
        <div className="space-y-4">
          <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-cyan-300 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            25 &mdash; COMMENCE INTELLIGENCE
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
            Know your market.{' '}
            <span className="text-cyan-300 block sm:inline drop-shadow-[0_0_20px_rgba(156,203,255,0.5)]">Move with clarity.</span>
          </h2>
          <p className="text-base sm:text-lg text-white/85 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            ResearchFlow turns competitive research into evidence-backed intelligence and action.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
          <button
            onClick={onGetStarted}
            className="group h-12 sm:h-11 px-7 rounded-full bg-white text-slate-950 font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-white hover:shadow-[0_0_32px_rgba(156,203,255,0.7)] transition-all shadow-[0_0_20px_rgba(156,203,255,0.4)]"
          >
            <span>Explore ResearchFlow</span>
            <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onSignIn}
            className="h-12 sm:h-11 px-6 rounded-full border border-white/25 bg-white/[0.08] backdrop-blur-md text-white hover:bg-white/[0.15] hover:border-white/40 text-sm font-semibold inline-flex items-center justify-center transition-all shadow-sm"
          >
            Sign in
          </button>
        </div>
      </div>
    </section>
  );
};
