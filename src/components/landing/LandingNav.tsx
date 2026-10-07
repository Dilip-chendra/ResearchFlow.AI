import React, { useState, useEffect } from 'react';
import { ArrowUpRight, X } from 'lucide-react';

interface LandingNavProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({ onSignIn, onGetStarted }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pointer-events-none">
      <nav
        className={`pointer-events-auto w-full max-w-5xl h-11 sm:h-12 px-4 sm:px-5 rounded-full flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? 'bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)]'
            : 'bg-white/[0.04] backdrop-blur-md border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
        }`}
        aria-label="Main Navigation"
      >
        {/* Brand Mark */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 text-left group focus:outline-none min-h-[40px]"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-400 to-blue-500 p-0.5 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.4)]">
            <div className="w-full h-full bg-black/80 rounded-[4px] flex items-center justify-center">
              <span className="text-[10px] font-bold tracking-tight text-cyan-300">RF</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-display font-bold tracking-tight text-white drop-shadow-sm group-hover:text-cyan-200 transition-colors">
              ResearchFlow
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold drop-shadow-sm">AI</span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-xs font-medium text-white/80">
          <button
            onClick={() => scrollToSection('problem')}
            className="hover:text-white transition-colors focus:outline-none py-1 drop-shadow-sm"
          >
            Problem
          </button>
          <button
            onClick={() => scrollToSection('pipeline')}
            className="hover:text-white transition-colors focus:outline-none py-1 drop-shadow-sm"
          >
            Pipeline
          </button>
          <button
            onClick={() => scrollToSection('evidence')}
            className="hover:text-white transition-colors focus:outline-none py-1 drop-shadow-sm"
          >
            Evidence
          </button>
          <button
            onClick={() => scrollToSection('intelligence')}
            className="hover:text-white transition-colors focus:outline-none py-1 drop-shadow-sm"
          >
            Intelligence
          </button>
          <button
            onClick={() => scrollToSection('architecture')}
            className="hover:text-white transition-colors focus:outline-none py-1 drop-shadow-sm"
          >
            Architecture
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onSignIn}
            className="text-xs font-medium text-white/80 hover:text-white px-2.5 py-1.5 min-h-[36px] transition-colors focus:outline-none drop-shadow-sm"
          >
            Sign in
          </button>

          <button
            onClick={onGetStarted}
            className="group relative inline-flex items-center gap-1.5 text-xs font-semibold bg-white text-black px-4 py-1.5 rounded-full hover:bg-white hover:shadow-[0_0_24px_rgba(255,255,255,0.6)] hover:scale-[1.02] active:scale-[0.98] min-h-[36px] transition-all focus:outline-none"
          >
            <span>Get started</span>
            <ArrowUpRight className="w-3 h-3 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* Mobile menu toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white/90 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none drop-shadow-sm"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <div className="w-4 h-3 flex flex-col justify-between">
                <span className="h-0.5 bg-current rounded-full" />
                <span className="h-0.5 bg-current rounded-full" />
                <span className="h-0.5 bg-current rounded-full" />
              </div>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer / Overlay Backdrop */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden fixed inset-0 z-50 flex flex-col bg-black/40 backdrop-blur-3xl px-6 pt-[calc(5rem+env(safe-area-inset-top,0px))] pb-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-6 border-b border-white/15">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-300">NAVIGATION</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-white/80 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex flex-col gap-2 py-6 text-base font-display font-medium text-white">
            <button
              onClick={() => scrollToSection('problem')}
              className="text-left py-3 px-3 rounded-lg hover:bg-white/10 text-white/90 hover:text-white min-h-[48px] flex items-center transition-colors"
            >
              The Problem
            </button>
            <button
              onClick={() => scrollToSection('pipeline')}
              className="text-left py-3 px-3 rounded-lg hover:bg-white/10 text-white/90 hover:text-white min-h-[48px] flex items-center transition-colors"
            >
              Intelligence Pipeline
            </button>
            <button
              onClick={() => scrollToSection('evidence')}
              className="text-left py-3 px-3 rounded-lg hover:bg-white/10 text-white/90 hover:text-white min-h-[48px] flex items-center transition-colors"
            >
              Evidence Provenance
            </button>
            <button
              onClick={() => scrollToSection('intelligence')}
              className="text-left py-3 px-3 rounded-lg hover:bg-white/10 text-white/90 hover:text-white min-h-[48px] flex items-center transition-colors"
            >
              Competitive Matrix
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="text-left py-3 px-3 rounded-lg hover:bg-white/10 text-white/90 hover:text-white min-h-[48px] flex items-center transition-colors"
            >
              Technical Architecture
            </button>
          </div>

          <div className="mt-auto pt-6 border-t border-white/15 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onGetStarted();
              }}
              className="w-full h-12 text-sm font-semibold text-black bg-white rounded-xl flex items-center justify-center gap-2 hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all"
            >
              <span>Get started</span>
              <ArrowUpRight className="w-4 h-4 text-black" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSignIn();
              }}
              className="w-full h-12 text-sm text-white border border-white/25 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              Sign in to workspace
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
