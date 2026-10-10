import React, { useState, useEffect } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { BrandSymbol } from '../brand/BrandLogo';
import { useWorkspace } from '../../context/WorkspaceContext';

interface LandingNavProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({ onSignIn, onGetStarted }) => {
  const { setIsPricingModalOpen } = useWorkspace();
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
            ? 'bg-[#090A0F]/90 backdrop-blur-xl border border-amber-400/30 shadow-[0_8px_32px_rgba(0,0,0,0.8)]'
            : 'bg-black/40 backdrop-blur-sm border border-amber-400/15'
        }`}
        aria-label="Main Navigation"
      >
        {/* Brand Mark */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 text-left group focus:outline-none min-h-[40px]"
        >
          <BrandSymbol size={26} variant="gold" className="drop-shadow-[0_0_12px_rgba(212,175,55,0.45)] group-hover:scale-105 transition-transform" />
          <div className="flex items-center gap-1.5">
            <span className="text-base font-display font-extrabold tracking-tight text-white drop-shadow-sm group-hover:text-[#F5D77F] transition-colors">
              Research<span className="text-gold-gradient font-black ml-px">Flow</span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-amber-400/40 bg-amber-400/15 text-[#F5D77F] font-bold shadow-[0_0_8px_rgba(212,175,55,0.3)]">
              AI
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-xs font-medium text-white/80">
          <button
            onClick={() => scrollToSection('problem')}
            className="hover:text-[#F5D77F] transition-colors focus:outline-none py-1 drop-shadow-sm"
          >
            Problem
          </button>
          <button
            onClick={() => scrollToSection('pipeline')}
            className="hover:text-[#F5D77F] transition-colors focus:outline-none py-1 drop-shadow-sm"
          >
            Pipeline
          </button>
          <button
            onClick={() => scrollToSection('evidence')}
            className="hover:text-[#F5D77F] transition-colors focus:outline-none py-1 drop-shadow-sm"
          >
            Evidence
          </button>
          <button
            onClick={() => scrollToSection('intelligence')}
            className="hover:text-[#F5D77F] transition-colors focus:outline-none py-1 drop-shadow-sm"
          >
            Intelligence
          </button>
          <button
            onClick={() => scrollToSection('architecture')}
            className="hover:text-[#F5D77F] transition-colors focus:outline-none py-1 drop-shadow-sm"
          >
            Architecture
          </button>
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="text-[#F5D77F] hover:text-white font-bold transition-colors focus:outline-none py-1 drop-shadow-sm flex items-center gap-1 cursor-pointer"
          >
            Pricing
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
            className="group relative inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] text-slate-950 px-4 py-1.5 rounded-full hover:shadow-[0_0_24px_rgba(245,215,127,0.7)] hover:scale-[1.02] active:scale-[0.98] min-h-[36px] transition-all focus:outline-none shadow-[0_0_14px_rgba(212,175,55,0.35)]"
          >
            <span>Get started</span>
            <ArrowUpRight className="w-3 h-3 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          {/* Mobile menu toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white/90 hover:text-[#F5D77F] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none drop-shadow-sm"
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
        <div className="pointer-events-auto md:hidden fixed inset-0 z-50 flex flex-col bg-slate-950/95 px-6 pt-[calc(5rem+env(safe-area-inset-top,0px))] pb-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-6 border-b border-amber-400/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#F5D77F] font-bold">NAVIGATION</span>
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
              className="text-left py-3 px-3 rounded-lg hover:bg-white/10 text-white/90 hover:text-[#F5D77F] min-h-[48px] flex items-center transition-colors"
            >
              The Problem
            </button>
            <button
              onClick={() => scrollToSection('pipeline')}
              className="text-left py-3 px-3 rounded-lg hover:bg-white/10 text-white/90 hover:text-[#F5D77F] min-h-[48px] flex items-center transition-colors"
            >
              Intelligence Pipeline
            </button>
            <button
              onClick={() => scrollToSection('evidence')}
              className="text-left py-3 px-3 rounded-lg hover:bg-white/10 text-white/90 hover:text-[#F5D77F] min-h-[48px] flex items-center transition-colors"
            >
              Evidence Provenance
            </button>
            <button
              onClick={() => scrollToSection('intelligence')}
              className="text-left py-3 px-3 rounded-lg hover:bg-white/10 text-white/90 hover:text-[#F5D77F] min-h-[48px] flex items-center transition-colors"
            >
              Competitive Matrix
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="text-left py-3 px-3 rounded-lg hover:bg-white/10 text-white/90 hover:text-[#F5D77F] min-h-[48px] flex items-center transition-colors"
            >
              Technical Architecture
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsPricingModalOpen(true);
              }}
              className="text-left py-3 px-3 rounded-lg hover:bg-white/10 text-[#F5D77F] hover:text-white font-bold min-h-[48px] flex items-center transition-colors"
            >
              Pricing & Plans
            </button>
          </div>

          <div className="mt-auto pt-6 border-t border-amber-400/20 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onGetStarted();
              }}
              className="w-full h-12 text-sm font-bold text-slate-950 bg-gradient-to-r from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_24px_rgba(245,215,127,0.7)] transition-all"
            >
              <span>Get started</span>
              <ArrowUpRight className="w-4 h-4 text-slate-950" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSignIn();
              }}
              className="w-full h-12 text-sm text-white border border-amber-400/30 rounded-xl hover:bg-amber-400/10 flex items-center justify-center transition-colors font-medium"
            >
              Sign in to workspace
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
