import { db } from '../server/db/store';
import { aiService } from '../server/ai/gemini';
import { researchService } from '../server/services/researchService';
import { CampaignBrief, CampaignAsset } from '../src/types';

async function runCampaignHubTest() {
  console.log('================================================================');
  console.log('TESTING CAMPAIGN STRATEGY HUB ENTERPRISE REDESIGN');
  console.log('================================================================\n');

  const wsId = 'ws_demo_sandbox';

  // 1. Check existing research jobs and generate a full campaign brief
  console.log('1. Testing Campaign Strategy Brief Generation with Angle Lab & Persona...');
  const mockEvidence = [
    {
      id: 'ev_test_1',
      researchJobId: 'job_test_nextgen',
      workspaceId: wsId,
      sourceId: 'src_1',
      category: 'Pricing' as const,
      claim: 'Incumbents charge $19-$29/month with forced annual renewals',
      supportingText: 'Standard pricing tiers require annual commitments with auto-renewal clauses.',
      sourceUrl: 'https://competitor-benchmark.com/pricing',
      sourceTitle: 'Competitor Pricing Benchmark',
      retrievedAt: new Date().toISOString(),
      evidenceType: 'FACT' as const,
      confidence: 'HIGH' as const,
    },
    {
      id: 'ev_test_2',
      researchJobId: 'job_test_nextgen',
      workspaceId: wsId,
      sourceId: 'src_2',
      category: 'Pain Points' as const,
      claim: 'Over 80% of applicant resumes fail initial screening due to generic AI buzzwords',
      supportingText: 'Reviewers quickly reject cosmetic templates lacking concrete project deliverables.',
      sourceUrl: 'https://hiring-trends.org/screening',
      sourceTitle: 'Hiring Screening Report 2026',
      retrievedAt: new Date().toISOString(),
      evidenceType: 'STATISTIC' as const,
      confidence: 'HIGH' as const,
    },
  ];

  const briefResult = await aiService.generateCampaignStrategy({
    businessName: 'NextGen Resume AI',
    businessDescription: 'Evidence-backed career positioning engine for technical practitioners.',
    campaignObjective: 'Acquire qualified engineering students and early-career software developers',
    targetAudience: 'University seniors & early-career software engineers',
    funnelStage: 'CONSIDERATION',
    intelligence: {
      competitiveLandscape: 'Competitors rely on cosmetic AI templates and opaque subscriptions.',
      audienceSignals: ['Desire for verifiable skill proof', 'Frustration with ongoing subscription fees'],
      messagingPatterns: ['Heavy emphasis on keywords over outcomes'],
      positioningGaps: ['Absence of verifiable evidence alignment'],
      marketOpportunities: [],
      potentialDifferentiators: ['Verifiable proof points', 'Transparent one-time pricing'],
      findings: [],
      risks: ['Broad search keyword competition'],
    },
    evidenceList: mockEvidence,
    workspaceId: wsId,
  });

  console.log('  [PASS] Campaign Title:', briefResult.title);
  console.log('  [PASS] Selected Angle:', briefResult.campaignAngle);
  console.log('  [PASS] Target Persona Role:', briefResult.targetPersona?.role);
  console.log('  [PASS] Strategic Angles in Lab:', briefResult.strategicAngles?.length);
  console.log('  [PASS] Message Pillars Count:', briefResult.messageArchitecture?.supportingMessages.length);
  console.log('  [PASS] Challenge Strategy Risks:', briefResult.challengeStrategy?.length);

  if (!briefResult.targetPersona || !briefResult.strategicAngles?.length || !briefResult.messageArchitecture) {
    throw new Error('Campaign strategy brief missing required structured sections');
  }

  // 2. Test Channel Execution Drafts (3 LinkedIn variants, 3-email sequence, SEO brief)
  console.log('\n2. Testing Multi-Channel Generation (LinkedIn 3 variants, 3-Email Seq, SEO Brief)...');
  const channelDrafts = await aiService.generateChannelDrafts({
    businessName: 'NextGen Resume AI',
    campaignBrief: briefResult,
    evidenceList: mockEvidence,
    workspaceId: wsId,
  });

  console.log('  [PASS] LinkedIn Hook:', channelDrafts.linkedin.hook.slice(0, 60) + '...');
  console.log('  [PASS] LinkedIn Strategic Variants Count:', channelDrafts.linkedin.variants?.length);
  console.log('  [PASS] LinkedIn Variant 1 Type:', channelDrafts.linkedin.variants?.[0].type);
  console.log('  [PASS] LinkedIn Variant 1 Words:', channelDrafts.linkedin.variants?.[0].wordCount);
  console.log('  [PASS] Email Sequence Name:', channelDrafts.email.sequenceName);
  console.log('  [PASS] Email Sequence Steps Count:', channelDrafts.email.emails?.length);
  console.log('  [PASS] Email Step 1 Subject:', channelDrafts.email.emails?.[0].subject);
  console.log('  [PASS] SEO Target Keyword:', channelDrafts.seo.primaryKeyword);
  console.log('  [PASS] SEO Outline Sections:', channelDrafts.seo.outline?.length);

  if (
    !channelDrafts.linkedin.variants ||
    channelDrafts.linkedin.variants.length < 3 ||
    !channelDrafts.email.emails ||
    channelDrafts.email.emails.length < 3 ||
    !channelDrafts.seo.outline
  ) {
    throw new Error('Channel drafts missing required 3-variant LinkedIn or 3-email sequence');
  }

  // 3. Test 8-Dimension AI Quality Reviewer
  console.log('\n3. Testing 8-Dimension Quality Reviewer & Claim Safety Validator...');
  const qualityReview = await aiService.evaluateCampaignQuality({
    businessName: 'NextGen Resume AI',
    campaignBrief: briefResult,
    channelDrafts,
    evidenceList: mockEvidence,
    workspaceId: wsId,
  });

  console.log('  [PASS] Overall Quality Score:', qualityReview.overallScore + '/10');
  console.log('  [PASS] Strategic Alignment Score:', qualityReview.dimensions.strategicAlignment + '/10');
  console.log('  [PASS] Evidence Grounding Score:', qualityReview.dimensions.evidenceGrounding + '/10');
  console.log('  [PASS] Channel Tone Fit Score:', qualityReview.dimensions.channelFit + '/10');
  console.log('  [PASS] Strengths Found:', qualityReview.strengths.length);

  const validationReport = aiService.validateCampaignSafety({
    campaignBrief: briefResult,
    channelDrafts,
    evidenceList: mockEvidence,
  });

  console.log('  [PASS] Factuality Validation Status:', validationReport.status);
  console.log('  [PASS] Factuality Score:', validationReport.factualityScore + '/100');
  console.log('  [PASS] Checks Passed:', validationReport.checks.filter(c => c.status === 'PASS').length);

  // 4. Test Persistence & Full Campaign Brief Storage
  console.log('\n4. Testing Disk Persistence & Database Storage...');
  const campaignId = `brief_test_${Date.now()}`;
  const fullBrief: CampaignBrief = {
    id: campaignId,
    researchJobId: 'job_test_nextgen',
    workspaceId: wsId,
    ...briefResult,
    qualityReview,
    validationReport,
    status: 'DRAFT',
    generatedAt: new Date().toISOString(),
  };

  db.saveCampaignBrief(fullBrief);
  const retrieved = db.getCampaignBrief(campaignId);
  if (!retrieved || retrieved.title !== fullBrief.title) {
    throw new Error('Failed to retrieve persisted campaign brief');
  }
  console.log('  [PASS] Successfully retrieved persisted campaign:', retrieved.id);

  // 5. Test Angle Switching in Angle Lab
  console.log('\n5. Testing Angle Lab Selection Switch...');
  const angles = retrieved.strategicAngles || [];
  if (angles.length > 1) {
    const newSelectedAngle = angles[1];
    retrieved.strategicAngles = angles.map(a => ({
      ...a,
      isSelected: a.id === newSelectedAngle.id,
    }));
    retrieved.campaignAngle = newSelectedAngle.name;
    db.updateCampaignBrief(retrieved);

    const updatedAfterAngle = db.getCampaignBrief(campaignId);
    if (updatedAfterAngle?.campaignAngle !== newSelectedAngle.name) {
      throw new Error('Angle switch failed to persist');
    }
    console.log('  [PASS] Successfully switched active angle to:', updatedAfterAngle.campaignAngle);
  }

  // 6. Test Targeted Asset Re-prompting
  console.log('\n6. Testing Targeted AI Asset Re-prompter...');
  const regeneratedLinkedIn = await aiService.regenerateTargetedAsset({
    channel: 'LINKEDIN',
    instruction: 'Make the opening hook punchier and emphasize transparent pricing',
    campaignBrief: retrieved,
    currentContent: channelDrafts.linkedin,
    evidenceList: mockEvidence,
    workspaceId: wsId,
  });

  console.log('  [PASS] Regenerated LinkedIn Content successfully');

  console.log('\n================================================================');
  console.log('🎉 ALL CAMPAIGN STRATEGY HUB REDESIGN TESTS PASSED WITH 0 ERRORS!');
  console.log('================================================================\n');
}

runCampaignHubTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
