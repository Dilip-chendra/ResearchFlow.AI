import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X, ChevronRight } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';

interface LandingNavProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  onExploreDemo: () => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({
  onSignIn,
  onGetStarted,
  onExploreDemo,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#090A0F]/85 backdrop-blur-md border-b border-zinc-800/60 py-3 shadow-2xl shadow-black/40'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          className="group focus:outline-hidden"
          title="ResearchFlow AI — Market Intelligence to Execution"
        >
          <BrandLogo size="sm" variant="dark" showBadge={true} showTagline={true} />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-300">
          <a
            href="#how-it-works"
            className="hover:text-white transition-colors hover:translate-y-[-1px]"
          >
            How It Works
          </a>
          <a
            href="#evidence"
            className="hover:text-white transition-colors hover:translate-y-[-1px]"
          >
            Evidence-First AI
          </a>
          <a
            href="#intelligence"
            className="hover:text-white transition-colors hover:translate-y-[-1px]"
          >
            Intelligence Matrix
          </a>
          <a
            href="#change-radar"
            className="hover:text-white transition-colors hover:translate-y-[-1px]"
          >
            Change Radar
          </a>
          <a
            href="#reliability"
            className="hover:text-white transition-colors hover:translate-y-[-1px]"
          >
            Reliability
          </a>
          <a
            href="#use-cases"
            className="hover:text-white transition-colors hover:translate-y-[-1px]"
          >
            Use Cases
          </a>
        </nav>

        {/* Desktop Right CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onSignIn}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-xl transition-all"
          >
            Sign In
          </button>
          
          <button
            onClick={onGetStarted}
            className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Researching</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onGetStarted}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Start
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-zinc-800/80 text-zinc-300 hover:text-white border border-zinc-700/50"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#0D1017] border-b border-zinc-800 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-3 text-sm font-medium text-zinc-300">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              How It Works
            </a>
            <a
              href="#evidence"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Evidence-First AI
            </a>
            <a
              href="#intelligence"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Intelligence Matrix
            </a>
            <a
              href="#change-radar"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Change Radar
            </a>
            <a
              href="#reliability"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Reliability
            </a>
            <a
              href="#use-cases"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Use Cases
            </a>
          </nav>

          <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSignIn();
              }}
              className="w-full py-2.5 text-center text-xs font-semibold text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 rounded-xl border border-zinc-700"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onGetStarted();
              }}
              className="w-full py-2.5 text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
            >
              <span>Start Researching</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onExploreDemo();
              }}
              className="w-full py-2 text-center text-xs font-medium text-zinc-400 hover:text-zinc-200"
            >
              Explore Interactive Demo Sandbox →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
