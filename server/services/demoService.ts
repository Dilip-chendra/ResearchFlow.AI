import {
  ResearchJob,
  ResearchSource,
  Evidence,
  ConflictItem,
  IntelligenceReport,
  CampaignBrief,
  CampaignAsset,
  ExecutionTask
} from '../types';
import { db } from '../db/store';

export const demoService = {
  seedDemoJob(workspaceId = 'ws_default_prod'): ResearchJob {
    const existingJobs = db.listResearchJobs(workspaceId);
    const existingDemo = existingJobs.find(j => j.isDemo);
    if (existingDemo) {
      return existingDemo;
    }

    const jobId = 'job_demo_resume_ai';

    const job: ResearchJob = {
      id: jobId,
      workspaceId,
      businessName: 'NextGen Resume AI',
      businessDescription: 'Evidence-backed resume intelligence platform that aligns candidate skills with real recruiter hiring benchmarks.',
      campaignObjective: 'Fall Campus Recruiting: Acquire 1,000 university seniors and junior engineers.',
      targetAudience: 'College seniors in Computer Science/Engineering, bootcamp graduates, and career changers.',
      competitorUrls: [
        'https://en.wikipedia.org/wiki/Resume',
        'https://news.ycombinator.com/item?id=38874139',
        'https://novoresume.com/career-blog/resume-statistics',
      ],
      additionalUrls: [
        'https://www.kickresume.com/en/help-center/pricing/',
      ],
      status: 'awaiting_review',
      currentStepMessage: 'Research & strategy pipeline complete. Awaiting human review & approval.',
      progressPercent: 100,
      sourcesCount: 4,
      evidenceCount: 9,
      conflictsCount: 1,
      isDemo: true,
      createdAt: new Date('2026-08-26T14:00:00Z').toISOString(),
      startedAt: new Date('2026-08-26T14:00:05Z').toISOString(),
      completedAt: new Date('2026-08-26T14:01:25Z').toISOString(),
      durationMs: 80000,
      intelligenceId: `intel_${jobId}`,
      briefId: `brief_${jobId}`,
    };

    db.saveResearchJob(job);

    // Seed Sources
    const sources: ResearchSource[] = [
      {
        id: `src_${jobId}_1`,
        jobId,
        workspaceId,
        url: 'https://en.wikipedia.org/wiki/Resume',
        title: 'Résumé Standards & Hiring Formats - Wikipedia',
        canonicalUrl: 'https://en.wikipedia.org/wiki/Resume',
        status: 'completed',
        httpStatus: 200,
        retrievedAt: new Date('2026-08-26T14:00:20Z').toISOString(),
        rawTextSnippet: 'A résumé is a document created and used by a person to present their background, skills, and accomplishments. Modern automated Applicant Tracking Systems (ATS) scan and rank candidates based on keyword matching and technical formatting standards.',
        wordCount: 1450,
        isCompetitor: true,
      },
      {
        id: `src_${jobId}_2`,
        jobId,
        workspaceId,
        url: 'https://news.ycombinator.com/item?id=38874139',
        title: 'Ask HN: What is your experience with modern AI resume builders?',
        status: 'completed',
        httpStatus: 200,
        retrievedAt: new Date('2026-08-26T14:00:35Z').toISOString(),
        rawTextSnippet: 'Discussion on technical recruitment: Many candidates report frustration with expensive monthly subscriptions charging $29/mo with credit card required upfront. Hiring managers note that generic AI bullet points without verifiable metrics are instantly spotted.',
        wordCount: 2100,
        isCompetitor: true,
      },
      {
        id: `src_${jobId}_3`,
        jobId,
        workspaceId,
        url: 'https://www.kickresume.com/en/help-center/pricing/',
        title: 'Kickresume Pricing & Plans',
        status: 'completed',
        httpStatus: 200,
        retrievedAt: new Date('2026-08-26T14:00:50Z').toISOString(),
        rawTextSnippet: 'Premium subscription options starting from $19 per month billed annually or $29 month-to-month. Features include AI resume writing, template library, and proofreading.',
        wordCount: 820,
        isCompetitor: true,
      },
      {
        id: `src_${jobId}_4`,
        jobId,
        workspaceId,
        url: 'https://novoresume.com/career-blog/resume-statistics',
        title: '2026 Technical Recruiting Benchmark Report & Statistics',
        status: 'completed',
        httpStatus: 200,
        retrievedAt: new Date('2026-08-26T14:01:05Z').toISOString(),
        rawTextSnippet: '82% of technical hiring managers report discarding candidate resumes that show generic AI buzzwords without measurable project outcomes or verified engineering metrics.',
        wordCount: 3400,
        isCompetitor: false,
      },
    ];

    sources.forEach(s => db.saveSource(s));

    // Seed Evidence
    const evidenceItems: Evidence[] = [
      {
        id: `ev_${jobId}_1`,
        researchJobId: jobId,
        workspaceId,
        sourceId: `src_${jobId}_3`,
        category: 'Pricing',
        claim: 'Market tools advertise entry price of $19/month billed annually.',
        supportingText: 'Starting at $19/month billed annually. Over 500+ templates.',
        sourceUrl: 'https://www.kickresume.com/en/help-center/pricing/',
        sourceTitle: 'Kickresume Pricing & Plans',
        retrievedAt: new Date('2026-08-26T14:00:25Z').toISOString(),
        evidenceType: 'FACT',
        confidence: 'HIGH',
        normalizedValue: '$19/mo (annual bill)',
      },
      {
        id: `ev_${jobId}_2`,
        researchJobId: jobId,
        workspaceId,
        sourceId: `src_${jobId}_2`,
        category: 'Pricing',
        claim: 'Month-to-month plans cost $29/month and require upfront credit card entry for trials.',
        supportingText: 'Subscription plans start at $29/month with credit card required upfront.',
        sourceUrl: 'https://news.ycombinator.com/item?id=38874139',
        sourceTitle: 'Hacker News Community Discussions',
        retrievedAt: new Date('2026-08-26T14:00:40Z').toISOString(),
        evidenceType: 'FACT',
        confidence: 'HIGH',
        normalizedValue: '$29/mo (credit card required)',
      },
      {
        id: `ev_${jobId}_3`,
        researchJobId: jobId,
        workspaceId,
        sourceId: `src_${jobId}_4`,
        category: 'Pain Points',
        claim: '82% of tech recruiters reject resumes with ungrounded generic AI buzzwords.',
        supportingText: '82% of technical hiring managers report discarding candidate resumes that show generic AI buzzwords without measurable project outcomes or verified engineering metrics.',
        sourceUrl: 'https://novoresume.com/career-blog/resume-statistics',
        sourceTitle: 'Technical Recruiting Benchmark Report & Statistics',
        retrievedAt: new Date('2026-08-26T14:01:10Z').toISOString(),
        evidenceType: 'FACT',
        confidence: 'HIGH',
        normalizedValue: '82% recruiter rejection on generic AI',
      },
      {
        id: `ev_${jobId}_4`,
        researchJobId: jobId,
        workspaceId,
        sourceId: `src_${jobId}_1`,
        category: 'Features',
        claim: 'Modern Applicant Tracking Systems (ATS) scan and filter candidate submissions based on technical keyword density and project outcomes.',
        supportingText: 'Applicant Tracking Systems (ATS) scan and rank candidates based on keyword matching and technical formatting standards.',
        sourceUrl: 'https://en.wikipedia.org/wiki/Resume',
        sourceTitle: 'Résumé Standards & Hiring Formats - Wikipedia',
        retrievedAt: new Date('2026-08-26T14:00:28Z').toISOString(),
        evidenceType: 'FACT',
        confidence: 'HIGH',
        normalizedValue: 'ATS keyword & outcome calibration requirement',
      },
      {
        id: `ev_${jobId}_5`,
        researchJobId: jobId,
        workspaceId,
        sourceId: `src_${jobId}_2`,
        category: 'Potential Gaps',
        claim: 'Lack of transparent student semester pricing or non-recurring trial models.',
        supportingText: 'Many candidates report frustration with expensive monthly subscriptions charging $29/mo with credit card required upfront.',
        sourceUrl: 'https://news.ycombinator.com/item?id=38874139',
        sourceTitle: 'Hacker News Community Discussions',
        retrievedAt: new Date('2026-08-26T14:00:42Z').toISOString(),
        evidenceType: 'WARNING',
        confidence: 'HIGH',
        normalizedValue: 'No student semester plan',
      },
      {
        id: `ev_${jobId}_6`,
        researchJobId: jobId,
        workspaceId,
        sourceId: `src_${jobId}_1`,
        category: 'Differentiators',
        claim: 'Standard resume formats lack real-time ATS benchmark feedback.',
        supportingText: 'Traditional formats rely on static manual editing rather than automated ATS feedback.',
        sourceUrl: 'https://en.wikipedia.org/wiki/Resume',
        sourceTitle: 'Résumé Standards & Hiring Formats - Wikipedia',
        retrievedAt: new Date('2026-08-26T14:00:55Z').toISOString(),
        evidenceType: 'FACT',
        confidence: 'HIGH',
        normalizedValue: 'Real-time ATS benchmarking missing in standard tools',
      },
    ];

    evidenceItems.forEach(e => db.saveEvidence(e));

    // Seed Conflict
    const conflict: ConflictItem = {
      id: `conf_${jobId}_pricing`,
      researchJobId: jobId,
      workspaceId,
      category: 'Pricing',
      description: 'Competitor pricing varies sharply ($19/mo annual commitment vs $29/mo with forced card entry).',
      severity: 'HIGH',
      status: 'UNRESOLVED',
      conflictingValues: [
        {
          sourceId: `src_${jobId}_3`,
          sourceUrl: 'https://www.kickresume.com/en/help-center/pricing/',
          sourceTitle: 'Kickresume Pricing & Plans',
          value: '$19/mo (annual lock-in)',
          evidenceId: `ev_${jobId}_1`,
        },
        {
          sourceId: `src_${jobId}_2`,
          sourceUrl: 'https://news.ycombinator.com/item?id=38874139',
          sourceTitle: 'Hacker News Community Discussions',
          value: '$29/mo (upfront credit card required)',
          evidenceId: `ev_${jobId}_2`,
        },
      ],
      detectedAt: new Date('2026-08-26T14:01:15Z').toISOString(),
    };
    db.saveConflict(conflict);

    // Seed Intelligence Report
    const intel: IntelligenceReport = {
      id: `intel_${jobId}`,
      researchJobId: jobId,
      workspaceId,
      competitiveLandscape: 'The AI resume space is divided between cosmetic template generators ($19–$29/mo) and outdated legacy export tools ($4.95). None offer verifiable ATS evidence calibration or flexible student semester pricing.',
      audienceSignals: [
        'University seniors are highly price-sensitive and skeptical of hidden annual subscriptions.',
        'Tech candidates are terrified of ATS auto-rejection due to generic AI buzzwords.',
      ],
      messagingPatterns: [
        'Competitors pitch "instant magic" and "500+ templates".',
        'Competitors hide annual lock-in commitments beneath "monthly" headline prices.',
      ],
      positioningGaps: [
        'Zero competitors offer evidence-backed ATS benchmark validation tailored to junior technical roles.',
        'Zero competitors offer transparent student semester pricing with zero card lock-in.',
      ],
      marketOpportunities: [
        {
          id: `opp_${jobId}_1`,
          title: 'Lead with "Evidence-Backed ATS Scoring"',
          description: 'Directly counter generic AI tool skepticism by proving 82% recruiter rejection risk and offering verified benchmark scoring.',
          impact: 'HIGH',
          recommendedAction: 'Deploy interactive ATS score checker and recruiter teardowns on campus subreddits and LinkedIn.',
          evidenceIds: [`ev_${jobId}_3`, `ev_${jobId}_4`],
        },
        {
          id: `opp_${jobId}_2`,
          title: 'Transparent Campus Semester Pass',
          description: 'Attack competitor annual subscription traps by offering a flat $15 semester pass with no auto-renewal.',
          impact: 'HIGH',
          recommendedAction: 'Position explicitly against $29/mo subscription models in student acquisition copy.',
          evidenceIds: [`ev_${jobId}_1`, `ev_${jobId}_2`, `ev_${jobId}_5`],
        },
      ],
      potentialDifferentiators: [
        'Recruiter-benchmark verified bullet points',
        'Transparent semester pass (no hidden renewals)',
        'Side-by-side ATS scan comparison against job descriptions',
      ],
      findings: [
        {
          id: `find_${jobId}_1`,
          category: 'Market Gap',
          title: 'Generic AI Backlash in Technical Hiring',
          statement: '82% of technical hiring managers now discard resumes showing generic AI patterns. Candidates need evidence-backed technical impact phrasing.',
          type: 'GAP',
          confidence: 'HIGH',
          evidenceIds: [`ev_${jobId}_3`],
        },
        {
          id: `find_${jobId}_2`,
          category: 'Pricing Disparity',
          title: 'Subscription Fatigue Among College Seniors',
          statement: 'Competitor entry pricing hides annual commitments ($228/yr) while students only need 2–3 months during active recruitment.',
          type: 'COMPETITIVE',
          confidence: 'HIGH',
          evidenceIds: [`ev_${jobId}_1`, `ev_${jobId}_2`],
        },
      ],
      risks: [
        'Incumbents have high SEO authority for generic terms like "free resume maker".',
        'Campus ad spend is seasonal (August–October and January–March peaks).',
      ],
      generatedAt: new Date('2026-08-26T14:01:20Z').toISOString(),
    };
    db.saveIntelligence(intel);

    // Seed Campaign Brief
    const brief: CampaignBrief = {
      id: `brief_${jobId}`,
      researchJobId: jobId,
      workspaceId,
      executiveSummary: 'Fall 2026 student acquisition campaign positioning NextGen Resume AI as the anti-generic, evidence-backed tool that passes modern technical recruiter filters.',
      objective: 'Acquire 1,000 verified university seniors and junior engineers before campus recruitment season.',
      audience: 'College seniors in Computer Science/Engineering and recent bootcamp graduates preparing for technical interviews.',
      coreProblem: 'Candidates are getting ghosted because generic AI tools produce buzzword soup that 82% of tech recruiters immediately filter out.',
      competitiveInsights: intel.competitiveLandscape,
      positioning: 'NextGen Resume AI is the evidence-backed career platform that calibrates your technical projects directly against real engineering hiring benchmarks.',
      campaignAngle: 'Proof Over Buzzwords: The Evidence-Backed Resume That Passes Senior Engineering Recruiter Screens',
      primaryMessage: 'Stop getting filtered by ATS algorithms. Build an evidence-backed resume calibrated to real 2026 engineering job benchmarks.',
      supportingMessages: [
        '82% of hiring managers reject generic AI resumes—here is how to format verified technical impact.',
        'Zero subscription traps: $15 flat semester access with no recurring credit card billing.',
        'Every bullet point scored against real recruiter rubrics, not template filler.',
      ],
      recommendedChannels: ['LinkedIn', 'Cold Email / Campus Outreach', 'SEO Long-Tail'],
      contentStrategy: 'Release honest teardowns of common resume mistakes, benchmark reports on ATS filtering, and student success stories.',
      recommendations: [
        'Launch LinkedIn thought leadership teardowns analyzing real vs generic resume bullets.',
        'Distribute campus newsletter sponsorships offering the transparent $15 semester pass.',
        'Publish comparison SEO pillars targeting competitor subscription traps.',
      ],
      risks: [
        'High competitive paid ad bidding during September peak; emphasize organic LinkedIn and campus ambassador distribution.',
      ],
      evidenceReferences: [
        {
          evidenceId: `ev_${jobId}_3`,
          claim: '82% of recruiters discard generic AI resumes',
          sourceUrl: 'https://novoresume.com/career-blog/resume-statistics',
          category: 'Pain Points',
        },
        {
          evidenceId: `ev_${jobId}_1`,
          claim: 'Market tools charge $19/mo on annual lock-in',
          sourceUrl: 'https://www.kickresume.com/en/help-center/pricing/',
          category: 'Pricing',
        },
        {
          evidenceId: `ev_${jobId}_2`,
          claim: 'Month-to-month plans charge $29/mo with forced card entry',
          sourceUrl: 'https://news.ycombinator.com/item?id=38874139',
          category: 'Pricing',
        },
      ],
      confidence: 'HIGH',
      limitations: 'Competitor enterprise university partnership contracts are not publicly listed.',
      generatedAt: new Date('2026-08-26T14:01:25Z').toISOString(),
      status: 'DRAFT',
    };
    db.saveCampaignBrief(brief);

    // Seed Campaign Assets
    const linkedinAsset: CampaignAsset = {
      id: `asset_${jobId}_linkedin`,
      researchJobId: jobId,
      workspaceId,
      channel: 'LINKEDIN',
      title: 'LinkedIn Thought Leadership: The 2026 Technical Resume Breakdown',
      content: {
        hook: '82% of technical hiring managers now discard resumes that use generic AI buzzwords. If you are applying to software roles this fall, read this:',
        body: 'We analyzed 500+ tech applications across YC startups and Big Tech. The verdict? Template-stuffed resumes generated by generic AI tools get filtered out in under 6 seconds.\n\nHere is what hiring managers actually look for in 2026:\n1. Quantified architectural decisions (e.g. "Reduced p99 query latency from 320ms to 45ms using Redis caching")\n2. Concrete ownership over cosmetic adjectives\n3. Proof of end-to-end delivery\n\nAt NextGen Resume AI, we built the first platform that calibrates your bullet points against verified engineering job descriptions.\n\nNo subscription traps. No fluff.',
        cta: '👉 Check your resume’s evidence score for free (link in first comment).',
      },
      evidenceReferences: [`ev_${jobId}_3`, `ev_${jobId}_4`],
      validationStatus: 'VALID',
      reviewStatus: 'PENDING',
    };
    db.saveCampaignAsset(linkedinAsset);

    const emailAsset: CampaignAsset = {
      id: `asset_${jobId}_email`,
      researchJobId: jobId,
      workspaceId,
      channel: 'EMAIL',
      title: 'Cold Outreach Sequence: Campus CS Society & Club Outreach',
      content: {
        subject: 'Why standard AI resumes are getting filtered (and the fall 2026 fix)',
        previewText: 'A quick teardown for CS seniors preparing for fall campus recruiting.',
        body: 'Hi {{firstName}},\n\nWith campus recruiting starting this month, wanted to share an urgent insight from our latest technical hiring benchmark.\n\nOver 82% of tech recruiters report rejecting resumes filled with generic generative AI phrasing. Why? Because hiring managers want verified technical proof, not template filler.\n\nWe launched NextGen Resume AI to solve this: a tool built specifically for college engineers to score and refine their projects against real technical job benchmarks.\n\nWe would love to provide your student members with complimentary ATS benchmark scans.',
        cta: 'Reply "YES" and I will send over the private university access link.',
      },
      evidenceReferences: [`ev_${jobId}_3`],
      validationStatus: 'VALID',
      reviewStatus: 'PENDING',
    };
    db.saveCampaignAsset(emailAsset);

    const seoAsset: CampaignAsset = {
      id: `asset_${jobId}_seo`,
      researchJobId: jobId,
      workspaceId,
      channel: 'SEO',
      title: 'SEO Pillar: Evidence-Backed Technical Resume Guide (2026)',
      content: {
        topic: 'How to Write an Evidence-Backed Software Engineering Resume for College Seniors',
        searchIntent: 'Commercial Investigation & Educational',
        primaryKeyword: 'software engineer resume for college seniors',
        secondaryKeywords: [
          'ATS resume score checker tech',
          'AI resume builder for CS students',
          'technical resume without experience',
          'best resume builder without subscription',
        ],
        outline: [
          '1. The New Reality: Why 2026 Tech Recruiter Screens Filter Out Generic AI',
          '2. Competitor Breakdown: Where $29/mo Template Tools Fail Technical Applicants',
          '3. Anatomy of an Evidence-Backed Resume: 4 Real Project Bullet Teardowns',
          '4. Step-by-Step Calibration: Aligning GitHub Repos with Real Recruiter Rubrics',
          '5. Free ATS Benchmark Checklist & Downloadable Sample',
        ],
      },
      evidenceReferences: [`ev_${jobId}_1`, `ev_${jobId}_3`],
      validationStatus: 'VALID',
      reviewStatus: 'PENDING',
    };
    db.saveCampaignAsset(seoAsset);

    return job;
  },
};
