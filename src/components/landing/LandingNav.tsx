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
            ? 'bg-[#07090C]/85 backdrop-blur-md border border-[#727A86]/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
            : 'bg-transparent border border-transparent'
        }`}
        aria-label="Main Navigation"
      >
        {/* Brand Mark */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 text-left group focus:outline-none min-h-[40px]"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#738BFF] to-[#9CCBFF] p-0.5 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#050608] rounded-[4px] flex items-center justify-center">
              <span className="text-[10px] font-bold tracking-tight text-[#9CCBFF]">RF</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold tracking-tight text-[#F3F5F7] group-hover:text-white transition-colors">
              ResearchFlow
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9CCBFF]/80">AI</span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-xs font-medium text-[#A8AFBA]">
          <button
            onClick={() => scrollToSection('problem')}
            className="hover:text-[#F3F5F7] transition-colors focus:outline-none py-1"
          >
            Problem
          </button>
          <button
            onClick={() => scrollToSection('pipeline')}
            className="hover:text-[#F3F5F7] transition-colors focus:outline-none py-1"
          >
            Pipeline
          </button>
          <button
            onClick={() => scrollToSection('evidence')}
            className="hover:text-[#F3F5F7] transition-colors focus:outline-none py-1"
          >
            Evidence
          </button>
          <button
            onClick={() => scrollToSection('intelligence')}
            className="hover:text-[#F3F5F7] transition-colors focus:outline-none py-1"
          >
            Intelligence
          </button>
          <button
            onClick={() => scrollToSection('architecture')}
            className="hover:text-[#F3F5F7] transition-colors focus:outline-none py-1"
          >
            Architecture
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onSignIn}
            className="text-xs font-medium text-[#A8AFBA] hover:text-[#F3F5F7] px-2.5 py-1.5 min-h-[36px] transition-colors focus:outline-none"
          >
            Sign in
          </button>

          <button
            onClick={onGetStarted}
            className="group relative inline-flex items-center gap-1.5 text-xs font-medium bg-[#F3F5F7] text-[#050608] px-3.5 py-1.5 rounded-full hover:bg-white hover:shadow-[0_0_16px_rgba(156,203,255,0.35)] min-h-[36px] transition-all focus:outline-none"
          >
            <span>Get started</span>
            <ArrowUpRight className="w-3 h-3 text-[#050608]/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* Mobile menu toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#A8AFBA] hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#F3F5F7]" />
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
        <div className="pointer-events-auto md:hidden fixed inset-0 z-50 flex flex-col bg-[#050608]/90 backdrop-blur-2xl px-6 pt-[calc(5rem+env(safe-area-inset-top,0px))] pb-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-6 border-b border-[#727A86]/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#9CCBFF]">NAVIGATION</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#A8AFBA] hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-2 py-6 text-base font-sans font-medium text-[#F3F5F7]">
            <button
              onClick={() => scrollToSection('problem')}
              className="text-left py-3 px-3 rounded-lg hover:bg-[#727A86]/10 text-[#A8AFBA] hover:text-[#F3F5F7] min-h-[48px] flex items-center"
            >
              The Problem
            </button>
            <button
              onClick={() => scrollToSection('pipeline')}
              className="text-left py-3 px-3 rounded-lg hover:bg-[#727A86]/10 text-[#A8AFBA] hover:text-[#F3F5F7] min-h-[48px] flex items-center"
            >
              Intelligence Pipeline
            </button>
            <button
              onClick={() => scrollToSection('evidence')}
              className="text-left py-3 px-3 rounded-lg hover:bg-[#727A86]/10 text-[#A8AFBA] hover:text-[#F3F5F7] min-h-[48px] flex items-center"
            >
              Evidence Provenance
            </button>
            <button
              onClick={() => scrollToSection('intelligence')}
              className="text-left py-3 px-3 rounded-lg hover:bg-[#727A86]/10 text-[#A8AFBA] hover:text-[#F3F5F7] min-h-[48px] flex items-center"
            >
              Competitive Matrix
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="text-left py-3 px-3 rounded-lg hover:bg-[#727A86]/10 text-[#A8AFBA] hover:text-[#F3F5F7] min-h-[48px] flex items-center"
            >
              Technical Architecture
            </button>
          </div>

          <div className="mt-auto pt-6 border-t border-[#727A86]/20 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onGetStarted();
              }}
              className="w-full h-12 text-sm font-semibold text-[#050608] bg-[#F3F5F7] rounded-xl flex items-center justify-center gap-2 hover:bg-white"
            >
              <span>Get started</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSignIn();
              }}
              className="w-full h-12 text-sm text-[#A8AFBA] border border-[#727A86]/30 rounded-xl hover:text-white flex items-center justify-center"
            >
              Sign in to workspace
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
