import React from 'react';
import { ArrowRight, Sparkles, Play, ShieldCheck } from 'lucide-react';

interface FinalCtaSectionProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onExploreDemo: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  onGetStarted,
  onSignIn,
  onExploreDemo,
}) => {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/60 bg-gradient-to-b from-[#080A10] to-[#040609] relative overflow-hidden text-center">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Launch Your First Research Mission Today</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-display max-w-3xl mx-auto leading-[1.1]">
          Stop collecting information.{' '}
          <span className="bg-gradient-to-r from-indigo-300 to-indigo-100 bg-clip-text text-transparent">
            Start turning it into decisions.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          ResearchFlow connects evidence, intelligence, and execution in one continuous workflow. Clean workspaces, zero hallucinations, and total operator control.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <button
            onClick={onGetStarted}
            className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Start Researching</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-sm font-semibold rounded-2xl border border-zinc-700 shadow-lg hover:border-zinc-600 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current text-indigo-400" />
            <span>Explore Interactive Demo Sandbox</span>
          </button>
        </div>

        <div className="pt-2 text-xs text-zinc-500 flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>No credit card required · Free tier included · Instant workspace setup</span>
        </div>
      </div>
    </section>
  );
};
