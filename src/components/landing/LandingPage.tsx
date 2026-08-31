import React, { useEffect } from 'react';
import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { ProblemSection } from './ProblemSection';
import { SolutionWorkflowSection } from './SolutionWorkflowSection';
import { EvidenceFirstSection } from './EvidenceFirstSection';
import { IntelligenceMatrixSection } from './IntelligenceMatrixSection';
import { ChangeRadarSection } from './ChangeRadarSection';
import { CampaignStudioSection } from './CampaignStudioSection';
import { HumanInTheLoopSection } from './HumanInTheLoopSection';
import { ReliabilitySection } from './ReliabilitySection';
import { MultiModelSection } from './MultiModelSection';
import { ProductGallerySection } from './ProductGallerySection';
import { UseCasesSection } from './UseCasesSection';
import { RecurringWorkflowSection } from './RecurringWorkflowSection';
import { SecurityTrustSection } from './SecurityTrustSection';
import { RoadmapVisionSection } from './RoadmapVisionSection';
import { FinalCtaSection } from './FinalCtaSection';
import { LandingFooter } from './LandingFooter';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onExploreDemo,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, []);

  return (
    <div className="min-h-screen bg-[#090A0F] text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white antialiased overflow-x-hidden">
      {/* 1. Sticky Navigation */}
      <LandingNav
        onSignIn={onSignIn}
        onGetStarted={onGetStarted}
        onExploreDemo={onExploreDemo}
      />

      {/* 2. Hero & 3D Intelligence Core */}
      <main>
        <HeroSection
          onGetStarted={onGetStarted}
          onSignIn={onSignIn}
          onExploreDemo={onExploreDemo}
        />

        {/* 3. Problem Section */}
        <ProblemSection />

        {/* 4. Solution & Interactive 5-Step Pipeline */}
        <SolutionWorkflowSection />

        {/* 5. Evidence-First AI & Citation Graph */}
        <EvidenceFirstSection />

        {/* 6. Intelligence Matrix */}
        <IntelligenceMatrixSection />

        {/* 7. Competitive Change Radar */}
        <ChangeRadarSection />

        {/* 8. Campaign Intelligence & Visual Studio */}
        <CampaignStudioSection />

        {/* 9. Human-in-the-Loop Governance */}
        <HumanInTheLoopSection />

        {/* 10. Zero-Failure Reliability & Recovery */}
        <ReliabilitySection />

        {/* 11. Dynamic Multi-Model Routing */}
        <MultiModelSection />

        {/* 12. Real Application Screen Gallery */}
        <ProductGallerySection />

        {/* 13. Use Cases & Personas */}
        <UseCasesSection />

        {/* 14. Recurring Operating Cadence */}
        <RecurringWorkflowSection />

        {/* 15. Security, Isolation & Privacy */}
        <SecurityTrustSection />

        {/* 16. Long-Term Vision & Roadmap */}
        <RoadmapVisionSection />

        {/* 17. Final High-Impact CTA */}
        <FinalCtaSection
          onGetStarted={onGetStarted}
          onSignIn={onSignIn}
          onExploreDemo={onExploreDemo}
        />
      </main>

      {/* 18. Footer */}
      <LandingFooter
        onSignIn={onSignIn}
        onGetStarted={onGetStarted}
        onExploreDemo={onExploreDemo}
      />
    </div>
  );
};
