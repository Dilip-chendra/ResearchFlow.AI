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
        <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full border border-[#9CCBFF]/20 bg-[#07090C]/50 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9CCBFF] animate-pulse" />
          <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.22em] uppercase text-[#9CCBFF]">
            RESEARCHFLOW AI
          </span>
        </div>

        {/* Master Headline with Fluid Sizing */}
        <h1 className="text-[clamp(2.15rem,6.5vw,4.5rem)] font-sans-editorial font-medium tracking-tight text-[#F3F5F7] leading-[1.08]">
          Know your market.{' '}
          <span className="text-[#9CCBFF] block sm:inline">Before it moves.</span>
        </h1>

        {/* Subhead & Supporting Statement */}
        <div className="space-y-2 max-w-xl">
          <p className="text-base sm:text-xl font-normal text-[#A8AFBA] leading-relaxed">
            Autonomous market and competitive intelligence grounded in evidence.
          </p>
          <p className="text-[11px] sm:text-xs font-mono tracking-wide text-[#727A86] uppercase">
            Research &middot; Verify &middot; Understand &middot; Act
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-sm sm:max-w-none">
          <button
            onClick={onGetStarted}
            className="group h-11 px-6 rounded-full bg-[#F3F5F7] text-[#050608] font-medium text-sm inline-flex items-center justify-center gap-2 hover:bg-white hover:shadow-[0_0_24px_rgba(156,203,255,0.4)] transition-all min-h-[44px]"
          >
            <span>Explore ResearchFlow</span>
            <ArrowRight className="w-4 h-4 text-[#050608]/70 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={scrollToNext}
            className="h-11 px-5 rounded-full border border-[#727A86]/30 text-[#A8AFBA] hover:text-[#F3F5F7] hover:border-[#9CCBFF]/40 text-sm font-normal inline-flex items-center justify-center gap-1.5 transition-all min-h-[44px]"
          >
            <span>See how it works</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>
      </div>

      {/* Bottom Editorial Cue */}
      <div className="pt-8 sm:pt-12 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#727A86] border-t border-[#727A86]/15">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9CCBFF]/60" />
          <span>STAGE 01 &mdash; MARKET CHAOS</span>
        </div>
        <div className="hidden sm:block text-right tracking-wider">
          SCROLL TO INITIALIZE INTELLIGENCE ENGINE &darr;
        </div>
      </div>
    </section>
  );
};
