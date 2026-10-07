import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface CinematicHeroProps {
  onGetStarted: () => void;
  onExploreClick?: () => void;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({ onGetStarted, onExploreClick }) => {
  const scrollToNext = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const problem = document.getElementById('problem');
      problem?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between pt-[clamp(6.5rem,14vh,9rem)] pb-8 px-5 sm:px-10 md:px-12 max-w-6xl mx-auto w-full">
      {/* Top spacer for navigation alignment */}
      <div />

      {/* Hero Narrative Core */}
      <div className="max-w-3xl space-y-6 sm:space-y-7">
        {/* Eyebrow Label */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/[0.08] backdrop-blur-xl shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.24em] uppercase text-cyan-200 font-semibold drop-shadow-sm">
            RESEARCHFLOW AI
          </span>
        </div>

        {/* Master Headline with Trending Syne Font */}
        <h1 className="text-[clamp(2.5rem,7vw,5.25rem)] font-display font-extrabold tracking-tight text-white leading-[1.04] drop-shadow-[0_6px_36px_rgba(0,0,0,0.85)]">
          Know your market.{' '}
          <span className="text-cyan-300 block sm:inline drop-shadow-[0_0_32px_rgba(56,189,248,0.45)]">
            Before it moves.
          </span>
        </h1>

        {/* Subhead & Supporting Statement */}
        <div className="space-y-2 max-w-xl">
          <p className="text-lg sm:text-2xl font-sans-editorial font-normal text-white/90 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Autonomous market and competitive intelligence grounded in evidence.
          </p>
          <p className="text-xs sm:text-sm font-mono tracking-wider text-cyan-200/80 uppercase font-medium drop-shadow-sm">
            Research &middot; Verify &middot; Understand &middot; Act
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-sm sm:max-w-none">
          <button
            onClick={onGetStarted}
            className="group h-12 px-7 rounded-full bg-white text-black font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-white hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-all min-h-[48px]"
          >
            <span>Explore ResearchFlow</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={scrollToNext}
            className="h-12 px-6 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/25 text-white hover:bg-white/20 hover:border-white/40 text-sm font-medium inline-flex items-center justify-center gap-1.5 transition-all min-h-[48px] shadow-lg drop-shadow-sm"
          >
            <span>See how it works</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>

      {/* Bottom Editorial Cue */}
      <div className="pt-8 sm:pt-12 flex items-center justify-between text-[11px] sm:text-xs font-mono text-white/70 border-t border-white/15 drop-shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
          <span className="font-semibold text-white/90">STAGE 01 &mdash; MARKET CHAOS</span>
        </div>
        <div className="hidden sm:block text-right tracking-widest text-white/60">
          SCROLL TO INITIALIZE INTELLIGENCE ENGINE &darr;
        </div>
      </div>
    </section>
  );
};
