import React from 'react';
import { ArrowRight, Play, Sparkles, ShieldCheck, Compass, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { InteractiveCore3D } from './InteractiveCore3D';

interface HeroSectionProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onExploreDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onSignIn,
  onExploreDemo,
}) => {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Lighting Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[450px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto text-center space-y-8">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-lg shadow-indigo-950/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="tracking-wide">Autonomous Market & Competitive Intelligence</span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-400 text-[11px] font-mono">v2.0 Production</span>
        </div>

        {/* High-Impact Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-display leading-[1.08]">
            Turn market research into{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-indigo-100 bg-clip-text text-transparent underline decoration-indigo-500/40 underline-offset-8">
              decisions
            </span>{' '}
            your team can act on.
          </h1>

          <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
            ResearchFlow turns fragmented competitor and market research into evidence-backed intelligence, strategy, and execution-ready work.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            onClick={onGetStarted}
            className="group w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Start Researching</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-sm font-semibold rounded-2xl border border-zinc-700/80 shadow-lg shadow-black/40 hover:border-zinc-600 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current text-indigo-400" />
            <span>Explore Interactive Demo Sandbox</span>
          </button>
        </div>

        {/* Subtle Trust Statement */}
        <div className="flex items-center justify-center gap-6 pt-1 text-xs text-zinc-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Evidence first. Human judgment always.</span>
          </div>
          <span className="hidden sm:inline text-zinc-700">·</span>
          <div className="hidden sm:flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Zero unsupported hallucinations</span>
          </div>
        </div>

        {/* Hero 3D / Dimensional pseudo-3D Intelligence Core */}
        <div className="pt-6 sm:pt-10">
          <InteractiveCore3D />
        </div>
      </div>
    </section>
  );
};
