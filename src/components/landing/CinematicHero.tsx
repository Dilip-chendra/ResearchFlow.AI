import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Typewriter } from './Typewriter';
import { HeadlineEntrance } from '../common/HeadlineEntrance';

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
        {/* Master Headline with Ultra-Stylish Modern Typography, Dynamic Typing Animation, and Gold Gradient */}
        <HeadlineEntrance
          as="h1"
          className="text-[clamp(2.85rem,7.2vw,5.25rem)] font-stylish-heading italic font-normal tracking-normal text-white leading-[1.12] drop-shadow-[0_6px_36px_rgba(0,0,0,0.85)]"
        >
          <span className="block text-white">Know your market.</span>
          <span className="block text-gold-gradient drop-shadow-[0_2px_28px_rgba(212,175,55,0.45)] min-h-[1.15em] mt-1 sm:mt-2">
            <Typewriter
              words={[
                'Before it moves.',
                'Before competitors adapt.',
                'Before pricing shifts.',
                'Before features launch.',
                'With verified evidence.',
              ]}
              typingSpeed={50}
              deletingSpeed={25}
              pauseDuration={2400}
              className="inline-flex items-baseline"
              textClassName="text-gold-gradient"
              cursorClassName="h-[0.82em] w-1 sm:w-1.5 ml-2 bg-gradient-to-b from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] rounded-full shadow-[0_0_12px_#D4AF37]"
            />
          </span>
        </HeadlineEntrance>

        {/* Subhead & Supporting Statement */}
        <div className="space-y-2 max-w-xl">
          <p className="text-lg sm:text-xl font-editorial text-white/90 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            Autonomous market and competitive intelligence grounded in verifiable evidence.
          </p>
          <p className="text-xs sm:text-sm font-subheading tracking-wider text-[#F5D77F]/90 uppercase font-semibold drop-shadow-sm">
            Research &middot; Verify &middot; Understand &middot; Act
          </p>
        </div>

        {/* Action Controls in White & Gold */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-sm sm:max-w-none">
          <button
            onClick={onGetStarted}
            className="group h-12 px-7 rounded-full bg-gradient-to-r from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] text-slate-950 font-bold text-sm inline-flex items-center justify-center gap-2 hover:shadow-[0_0_35px_rgba(245,215,127,0.75)] hover:scale-[1.03] active:scale-[0.98] transition-all min-h-[48px] shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            <span>Explore ResearchFlow</span>
            <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={scrollToNext}
            className="h-12 px-6 rounded-full bg-black/50 border border-amber-400/35 text-white hover:text-[#F5D77F] hover:border-[#F5D77F] text-sm font-medium inline-flex items-center justify-center gap-1.5 transition-all min-h-[48px] shadow-[0_0_15px_rgba(212,175,55,0.15)] drop-shadow-sm"
          >
            <span>See how it works</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>

      {/* Extraordinary Executive Command Center Showcase */}
      <div className="relative pt-10 sm:pt-14 pb-4 w-full">
        <div className="relative rounded-2xl sm:rounded-3xl border border-amber-400/35 bg-black/70 backdrop-blur-2xl p-2.5 sm:p-4 shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_60px_rgba(212,175,55,0.25)] overflow-hidden group">
          {/* Executive Window Chrome */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-amber-400/20 mb-3 text-[11px] font-mono text-[#F5D77F]/90">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              <span className="ml-2 font-semibold text-white/95 tracking-wide hidden sm:inline">GLOBAL MARKET INTELLIGENCE COMMAND &bull; ACTIVE</span>
              <span className="ml-2 font-semibold text-white/95 tracking-wide sm:hidden">RADAR ACTIVE</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                42 Tracked
              </span>
              <span className="text-white/30 hidden sm:inline">&bull;</span>
              <span className="text-[#F5D77F] font-semibold hidden sm:inline">98% Grounding Score</span>
            </div>
          </div>

          {/* High-Resolution Razor-Sharp Visual */}
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[16/9] w-full border border-white/10 shadow-2xl">
            <img
              src="/images/hero-command-center.jpg"
              alt="ResearchFlow AI Global Market Intelligence Command Center"
              className="w-full h-full object-cover object-center transform group-hover:scale-[1.015] transition-transform duration-700 filter brightness-[1.03] contrast-[1.02]"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

            {/* Floating Live Overlay Telemetry Badges */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/40 text-white text-[11px] sm:text-xs font-mono flex items-center gap-2 shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                <span>Autonomous Market Radar &bull; Multi-Tenant Verified</span>
              </div>
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/40 text-[#F5D77F] text-[11px] sm:text-xs font-mono font-bold shadow-xl">
                Cryptographic Verbatim Grounding
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Editorial Cue */}
      <div className="pt-6 sm:pt-10 flex items-center justify-between text-[11px] sm:text-xs font-mono text-white/70 border-t border-amber-400/20 drop-shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F5D77F] shadow-[0_0_8px_#D4AF37]" />
          <span className="font-semibold text-white/90">STAGE 01 &mdash; MARKET CHAOS</span>
        </div>
        <div className="hidden sm:block text-right tracking-widest text-[#F5D77F]/80 font-medium">
          SCROLL TO INITIALIZE INTELLIGENCE ENGINE &darr;
        </div>
      </div>
    </section>
  );
};
