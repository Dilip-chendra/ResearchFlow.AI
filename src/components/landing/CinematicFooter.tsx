import React from 'react';
import { BrandSymbol } from '../brand/BrandLogo';

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
    <footer className="relative border-t border-amber-400/25 bg-[#07080C]/95 backdrop-blur-2xl text-xs font-mono text-white/85 pt-16 pb-[calc(4rem+env(safe-area-inset-bottom))] px-6 sm:px-12 mt-16 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <BrandSymbol size={24} variant="gold" className="drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-base text-gold-gradient drop-shadow-[0_0_12px_rgba(212,175,55,0.4)] tracking-tight">
                  Research<span className="font-black ml-px">Flow</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-amber-400/40 bg-amber-400/15 text-[#F5D77F] font-bold">
                  AI
                </span>
              </div>
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
