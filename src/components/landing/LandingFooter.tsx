import React from 'react';
import { ArrowUp } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';

interface LandingFooterProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  onExploreDemo: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onSignIn,
  onGetStarted,
  onExploreDemo,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-zinc-800/80 bg-[#06070B] text-zinc-400 text-xs py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <BrandLogo size="sm" variant="dark" showBadge={true} />
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Autonomous market and competitive intelligence platform turning public research into evidence-backed decisions and execution.
            </p>
            <div className="text-[11px] text-zinc-500 font-mono">
              © {new Date().getFullYear()} ResearchFlow AI. All rights reserved.
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Product
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#evidence" className="hover:text-white transition-colors">
                  Evidence-First AI
                </a>
              </li>
              <li>
                <a href="#intelligence" className="hover:text-white transition-colors">
                  Intelligence Matrix
                </a>
              </li>
              <li>
                <a href="#change-radar" className="hover:text-white transition-colors">
                  Change Radar
                </a>
              </li>
              <li>
                <a href="#reliability" className="hover:text-white transition-colors">
                  Reliability
                </a>
              </li>
            </ul>
          </div>

          {/* Use Cases */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Use Cases
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#use-cases" className="hover:text-white transition-colors">
                  Startup Founders
                </a>
              </li>
              <li>
                <a href="#use-cases" className="hover:text-white transition-colors">
                  Growth Marketing
                </a>
              </li>
              <li>
                <a href="#use-cases" className="hover:text-white transition-colors">
                  Product Strategy
                </a>
              </li>
              <li>
                <a href="#use-cases" className="hover:text-white transition-colors">
                  Competitive Monitoring
                </a>
              </li>
            </ul>
          </div>

          {/* Account & Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Workspace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onSignIn} className="hover:text-white transition-colors text-left">
                  Sign In
                </button>
              </li>
              <li>
                <button onClick={onGetStarted} className="hover:text-white transition-colors text-left">
                  Start Researching
                </button>
              </li>
              <li>
                <button onClick={onExploreDemo} className="hover:text-white transition-colors text-left">
                  Explore Demo Sandbox
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 font-mono">
          <div>Evidence-First Autonomous Intelligence · Multi-Tenant Architecture</div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
