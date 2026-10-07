import React from 'react';

interface CinematicFooterProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

export const CinematicFooter: React.FC<CinematicFooterProps> = ({
  onSignIn,
  onGetStarted,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-white/15 bg-white/[0.03] backdrop-blur-2xl text-xs font-mono text-white/80 pt-16 pb-[calc(4rem+env(safe-area-inset-bottom))] px-6 sm:px-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-cyan-400 to-indigo-500 p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(156,203,255,0.4)]">
                <div className="w-full h-full bg-slate-950/70 backdrop-blur-sm rounded-[3px] flex items-center justify-center text-[9px] font-bold text-cyan-300">
                  RF
                </div>
              </div>
              <span className="font-display font-bold text-base text-white tracking-wide">ResearchFlow AI</span>
            </div>
            <p className="text-[12px] text-white/70 max-w-sm leading-relaxed font-sans">
              Autonomous market and competitive intelligence system grounded in verifiable evidence.
            </p>
            <div className="pt-2 text-[10px] text-white/50">
              &copy; {new Date().getFullYear()} ResearchFlow AI. All rights reserved.
            </div>
          </div>

          {/* Product */}
          <div className="space-y-2.5">
            <div className="text-[11px] text-white font-semibold uppercase tracking-wider">PRODUCT</div>
            <ul className="space-y-2 text-[11px] text-white/75">
              <li>
                <button onClick={() => scrollTo('pipeline')} className="hover:text-white transition-colors">
                  Research Engine
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('evidence')} className="hover:text-white transition-colors">
                  Evidence Library
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('intelligence')} className="hover:text-white transition-colors">
                  Market Matrix
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('pipeline')} className="hover:text-white transition-colors">
                  Campaign Studio
                </button>
              </li>
            </ul>
          </div>

          {/* System */}
          <div className="space-y-2.5">
            <div className="text-[11px] text-white font-semibold uppercase tracking-wider">SYSTEM</div>
            <ul className="space-y-2 text-[11px] text-white/75">
              <li>
                <button onClick={() => scrollTo('pipeline')} className="hover:text-white transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('architecture')} className="hover:text-white transition-colors">
                  Architecture
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('architecture')} className="hover:text-white transition-colors">
                  Security & Isolation
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/Dilip-chendra/ResearchFlow.AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-2.5">
            <div className="text-[11px] text-white font-semibold uppercase tracking-wider">ACCOUNT</div>
            <ul className="space-y-2 text-[11px] text-white/75">
              <li>
                <button onClick={onSignIn} className="hover:text-white transition-colors">
                  Sign In
                </button>
              </li>
              <li>
                <button onClick={onGetStarted} className="text-cyan-300 font-medium hover:underline transition-all">
                  Get Started
                </button>
              </li>
              <li>
                <span className="text-white/50">Privacy Policy</span>
              </li>
              <li>
                <span className="text-white/50">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
