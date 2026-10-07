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
    <footer className="relative border-t border-amber-400/20 bg-transparent text-xs font-mono text-white/85 pt-16 pb-[calc(4rem+env(safe-area-inset-bottom))] px-6 sm:px-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.4)]">
                <div className="w-full h-full bg-slate-950/90 rounded-[3px] flex items-center justify-center text-[9px] font-bold text-[#F5D77F]">
                  RF
                </div>
              </div>
              <span className="font-display font-bold text-base text-white tracking-wide">ResearchFlow AI</span>
            </div>
            <p className="text-[12px] text-white/75 max-w-sm leading-relaxed font-sans">
              Autonomous market and competitive intelligence system grounded in verifiable evidence.
            </p>
            <div className="pt-2 text-[10px] text-white/50">
              &copy; {new Date().getFullYear()} ResearchFlow AI. All rights reserved.
            </div>
          </div>

          {/* Product */}
          <div className="space-y-2.5">
            <div className="text-[11px] text-[#F5D77F] font-semibold uppercase tracking-wider">PRODUCT</div>
            <ul className="space-y-2 text-[11px] text-white/75">
              <li>
                <button onClick={() => scrollTo('pipeline')} className="hover:text-[#F5D77F] transition-colors">
                  Research Engine
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('evidence')} className="hover:text-[#F5D77F] transition-colors">
                  Evidence Library
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('intelligence')} className="hover:text-[#F5D77F] transition-colors">
                  Market Matrix
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('pipeline')} className="hover:text-[#F5D77F] transition-colors">
                  Campaign Studio
                </button>
              </li>
            </ul>
          </div>

          {/* System */}
          <div className="space-y-2.5">
            <div className="text-[11px] text-[#F5D77F] font-semibold uppercase tracking-wider">SYSTEM</div>
            <ul className="space-y-2 text-[11px] text-white/75">
              <li>
                <button onClick={() => scrollTo('pipeline')} className="hover:text-[#F5D77F] transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('architecture')} className="hover:text-[#F5D77F] transition-colors">
                  Architecture
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('architecture')} className="hover:text-[#F5D77F] transition-colors">
                  Security & Isolation
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/Dilip-chendra/ResearchFlow.AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F5D77F] transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-2.5">
            <div className="text-[11px] text-[#F5D77F] font-semibold uppercase tracking-wider">ACCOUNT</div>
            <ul className="space-y-2 text-[11px] text-white/75">
              <li>
                <button onClick={onSignIn} className="hover:text-white transition-colors">
                  Sign In
                </button>
              </li>
              <li>
                <button onClick={onGetStarted} className="text-[#F5D77F] font-bold hover:underline transition-all drop-shadow-sm">
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
