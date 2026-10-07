import React, { useEffect } from 'react';
import { ResearchFlowCinematicCanvas } from '../ResearchFlowCinematicCanvas';
import { LandingNav } from './LandingNav';
import { CinematicHero } from './CinematicHero';
import { MarketEverywhereSection } from './MarketEverywhereSection';
import { IntroductionPipelineSection } from './IntroductionPipelineSection';
import { EvidenceProvenanceSection } from './EvidenceProvenanceSection';
import { ConflictDetectionSection } from './ConflictDetectionSection';
import { CompetitiveIntelligenceSection } from './CompetitiveIntelligenceSection';
import { AgenticWorkersSection } from './AgenticWorkersSection';
import { CampaignStrategySection } from './CampaignStrategySection';
import { ReliabilityAndRoutingSection } from './ReliabilityAndRoutingSection';
import { ArchitectureAndBenchmarkSection } from './ArchitectureAndBenchmarkSection';
import { VisionAndCtaSection } from './VisionAndCtaSection';
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
    <div className="relative min-h-screen bg-transparent text-white font-sans-editorial selection:bg-amber-400/30 selection:text-amber-100 antialiased">
      {/* 
        PERSISTENT CINEMATIC CANVAS BACKGROUND
        Renders full document scroll across all 192 frames (Page Top 0% -> Footer 100%).
        High-DPI buffer, cover crop, progressive preloading, and requestAnimationFrame throttling.
      */}
      <ResearchFlowCinematicCanvas
        isFixed={true}
        overlayOpacity={0.12}
        focalPoint={{ x: 0.5, y: 0.45 }}
      />

      {/* FOREGROUND EDITORIAL CONTENT LAYER */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Floating Minimal Navigation */}
        <LandingNav
          onSignIn={onSignIn}
          onGetStarted={onGetStarted}
        />

        {/* 01. Cinematic Opening Hero */}
        <CinematicHero
          onGetStarted={onGetStarted}
        />

        {/* 02. The Market is Everywhere & 03. The Research Bottleneck */}
        <MarketEverywhereSection />

        {/* 04. Introducing ResearchFlow & 05. Live Web Research Pipeline */}
        <IntroductionPipelineSection />

        {/* 06. Evidence Provenance & 07. Confidence Scoring */}
        <EvidenceProvenanceSection />

        {/* 08. Cross-Source Conflict Detection */}
        <ConflictDetectionSection />

        {/* 09. Competitive Intelligence & 10. The Synthesis Layer */}
        <CompetitiveIntelligenceSection />

        {/* 11. Specialized Intelligence Workers & 12. Shared Context Flow */}
        <AgenticWorkersSection />

        {/* 13. Campaign Strategy & 14. Human Review & 15. Action */}
        <CampaignStrategySection />

        {/* 16. Reliability & 17. Multi-Model Routing & 18. Prompt Injection Defense */}
        <ReliabilityAndRoutingSection />

        {/* 20. Technical Architecture & 21. Benchmark & 22. The Difference & 23. Operating Loop */}
        <ArchitectureAndBenchmarkSection />

        {/* 24. Vision & 25. Final High-Impact CTA */}
        <VisionAndCtaSection
          onGetStarted={onGetStarted}
          onSignIn={onSignIn}
        />

        {/* 26. Persistent Dark Cinematic Footer */}
        <CinematicFooter
          onSignIn={onSignIn}
          onGetStarted={onGetStarted}
        />
      </div>
    </div>
  );
};

export default LandingPage;
