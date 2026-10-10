import React, { useEffect } from 'react';
import { ResearchFlowCinematicCanvas } from '../ResearchFlowCinematicCanvas';
import { LandingNav } from './LandingNav';
import { CinematicHero } from './CinematicHero';
import { ProblemVsSolutionSection } from './ProblemVsSolutionSection';
import { BentoEngineSection } from './BentoEngineSection';
import { InteractiveBattlecardSection } from './InteractiveBattlecardSection';
import { BenchmarkRoiSection } from './BenchmarkRoiSection';
import { TestimonialsSection } from './TestimonialsSection';
import { PricingSection } from './PricingSection';
import { FaqSection } from './FaqSection';
import { GrandFinaleCtaSection } from './GrandFinaleCtaSection';
import { CinematicFooter } from './CinematicFooter';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, []);

  return (
    <div className="relative min-h-screen bg-transparent text-white font-sans-editorial selection:bg-amber-400/30 selection:text-amber-100 antialiased overflow-x-hidden">
      {/* 
        PERSISTENT CINEMATIC CANVAS BACKGROUND
        Renders full document scroll across all 192 frames (Page Top 0% -> Footer 100%).
      */}
      <ResearchFlowCinematicCanvas
        isFixed={true}
        overlayOpacity={0.65}
        focalPoint={{ x: 0.5, y: 0.45 }}
      />

      {/* FOREGROUND HIGH-CONVERTING MNC PRODUCT EXPERIENCE LAYER */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Floating Minimal Glass Navigation */}
        <LandingNav
          onSignIn={onSignIn}
          onGetStarted={onGetStarted}
        />

        {/* 1. High-Impact Hero with Live Interactive Cockpit Sandbox */}
        <CinematicHero
          onGetStarted={onGetStarted}
        />

        {/* 2. Problem vs. Solution (Replaces slide deck presentation) */}
        <ProblemVsSolutionSection />

        {/* 3. The 5-Card Intelligence Bento Grid */}
        <BentoEngineSection />

        {/* 4. Interactive Battlecard Arena (Live Competitor Switcher) */}
        <InteractiveBattlecardSection />

        {/* 5. Empirical Performance & ROI Dashboard */}
        <BenchmarkRoiSection />

        {/* 6. Customer Proof & Testimonials */}
        <TestimonialsSection />

        {/* 7. Transparent Tiered Pricing */}
        <PricingSection
          onGetStarted={onGetStarted}
        />

        {/* 8. Frequently Asked Questions */}
        <FaqSection />

        {/* 9. Grand Finale Magnetic CTA */}
        <GrandFinaleCtaSection
          onGetStarted={onGetStarted}
          onSignIn={onSignIn}
        />

        {/* 10. Persistent Dark Cinematic Footer */}
        <CinematicFooter
          onSignIn={onSignIn}
          onGetStarted={onGetStarted}
        />
      </div>
    </div>
  );
};

export default LandingPage;
