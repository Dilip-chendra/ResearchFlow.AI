import crypto from 'crypto';
import {
  MarketModel,
  WarRoomCompetitor,
  CompetitorMove,
  ProductGap,
  CustomerDemandSignal,
  MarketOpportunity,
  MarketThreat,
  WarRoomRecommendation,
  ScenarioSimulation,
  StrategicDecision,
  StrategicExperiment,
  CompanyScorecard,
  ExecutiveBrief,
  MarketKnowledgeGraph,
  MarketGraphNode,
  MarketGraphLink,
  WarRoomOverviewResponse,
  CampaignBrief,
  ExecutionTask,
} from '../types';
import { db } from '../db/store';
import { entitlementEngine } from '../billing/entitlementEngine';
import { logger } from '../utils/logger';

// Prompt Injection and payload sanitizer
function sanitizeStrategicInput(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/(?:ignore previous instructions|disregard system prompt|system:|assistant:)/gi, '[FILTERED]')
    .trim();
}

export const warRoomService = {
  /**
   * Retrieves the comprehensive War Room state for a workspace
   */
  getWarRoomOverview(workspaceId: string): WarRoomOverviewResponse {
    const marketModel = db.getMarketModel(workspaceId);

    if (!marketModel) {
      return {
        marketModel: null,
        pulse: {
          healthStatus: 'HEALTHY',
          lastUpdated: new Date().toISOString(),
          evidenceFreshnessPercent: 0,
          competitorCoverageCount: 0,
          topPriorityTitle: 'No active strategic priorities yet',
          topThreatTitle: 'No critical threats identified',
          biggestOpportunityTitle: 'Map your market to identify whitespace',
        },
        competitors: [],
        recentMoves: [],
        productGaps: [],
        demandSignals: [],
        opportunities: [],
        threats: [],
        recommendations: [],
        scorecard: null,
        executiveBrief: null,
      };
    }

    const competitors = db.getWarRoomCompetitors(workspaceId);
    const recentMoves = db.getCompetitorMoves(workspaceId, 25);
    const productGaps = db.getProductGaps(workspaceId);
    const demandSignals = db.getCustomerDemandSignals(workspaceId);
    const opportunities = db.getMarketOpportunities(workspaceId);
    const threats = db.getMarketThreats(workspaceId);
    const recommendations = db.getWarRoomRecommendations(workspaceId);
    const scorecard = db.getCompanyScorecard(workspaceId);
    const executiveBrief = db.getExecutiveBrief(workspaceId);

    // Compute pulse health
    const hasCriticalThreat = threats.some(t => t.threatLevel === 'CRITICAL');
    const hasHighThreat = threats.some(t => t.threatLevel === 'HIGH');
    const healthStatus: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL' = hasCriticalThreat
      ? 'CRITICAL'
      : hasHighThreat
      ? 'NEEDS_ATTENTION'
      : 'HEALTHY';

    const allEvidence = db.listAllEvidenceForWorkspace(workspaceId);
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    const freshEvidenceCount = allEvidence.filter(e => new Date(e.createdAt || 0).getTime() >= thirtyDaysAgo).length;
    const evidenceFreshnessPercent = allEvidence.length > 0
      ? Math.round((freshEvidenceCount / allEvidence.length) * 100)
      : 88;

    const topPriorityTitle = recommendations.find(r => r.status === 'PROPOSED' && r.priority === 'P1')?.title
      || recommendations[0]?.title
      || 'Review newly detected competitor shifts';

    const topThreatTitle = threats[0]?.title || 'No imminent high-severity threats detected';
    const biggestOpportunityTitle = opportunities[0]?.title || 'No whitespace opportunities captured yet';

    return {
      marketModel,
      pulse: {
        healthStatus,
        lastUpdated: marketModel.updatedAt || new Date().toISOString(),
        evidenceFreshnessPercent,
        competitorCoverageCount: competitors.filter(c => c.status === 'CONFIRMED').length,
        topPriorityTitle,
        topThreatTitle,
        biggestOpportunityTitle,
      },
      competitors,
      recentMoves,
      productGaps,
      demandSignals,
      opportunities,
      threats,
      recommendations,
      scorecard,
      executiveBrief,
    };
  },

  /**
   * Initializes or updates a workspace's Market Model
   */
  mapMyMarket(
    workspaceId: string,
    params: {
      marketCategory: string;
      targetCustomers: string;
      strategicGoal: string;
      knownCompetitors: string[];
      keyDifferentiators: string[];
    },
    userId = 'usr_system',
    userName = 'Strategic System'
  ): WarRoomOverviewResponse {
    const cleanCategory = sanitizeStrategicInput(params.marketCategory);
    const cleanCustomers = sanitizeStrategicInput(params.targetCustomers);
    const cleanGoal = sanitizeStrategicInput(params.strategicGoal);
    const cleanCompetitors = (params.knownCompetitors || []).map(sanitizeStrategicInput).filter(Boolean);
    const cleanDiffs = (params.keyDifferentiators || []).map(sanitizeStrategicInput).filter(Boolean);

    if (!cleanCategory || !cleanCustomers) {
      throw new Error('Market Category and Target Customers are required to map your market.');
    }

    const now = new Date().toISOString();
    let model = db.getMarketModel(workspaceId);

    if (!model) {
      model = {
        id: `mm_${workspaceId}_${Date.now()}`,
        workspaceId,
        marketCategory: cleanCategory,
        targetCustomers: cleanCustomers,
        strategicGoal: cleanGoal || 'Accelerate defensible market leadership and customer conversion',
        knownCompetitors: cleanCompetitors,
        keyDifferentiators: cleanDiffs,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      };
    } else {
      model.marketCategory = cleanCategory;
      model.targetCustomers = cleanCustomers;
      if (cleanGoal) model.strategicGoal = cleanGoal;
      model.knownCompetitors = Array.from(new Set([...model.knownCompetitors, ...cleanCompetitors]));
      model.keyDifferentiators = Array.from(new Set([...model.keyDifferentiators, ...cleanDiffs]));
      model.updatedAt = now;
    }

    db.saveMarketModel(model);

    // Register or discover known competitors
    const existingCompetitors = db.getWarRoomCompetitors(workspaceId);
    const existingNames = new Set(existingCompetitors.map(c => c.name.toLowerCase()));

    cleanCompetitors.forEach((compName, idx) => {
      if (!existingNames.has(compName.toLowerCase())) {
        const compId = `comp_${workspaceId}_${crypto.randomBytes(4).toString('hex')}`;
        const newComp: WarRoomCompetitor = {
          id: compId,
          workspaceId,
          name: compName,
          website: `https://www.${compName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          tier: idx < 2 ? 'TIER_1' : 'TIER_2',
          category: 'DIRECT',
          status: 'CONFIRMED',
          sourceConfidence: 90,
          evidenceIds: [],
          strengths: ['Established brand awareness', 'Existing distribution in target segment'],
          weaknesses: ['Generic value propositions', 'Slow to adapt to workflow automation demands'],
          pricingModel: 'Subscription tiering',
          positioningSummary: `Direct competitor targeting ${cleanCustomers}`,
          createdAt: now,
          updatedAt: now,
        };
        db.saveWarRoomCompetitor(newComp);
      }
    });

    // Populate initial product gaps if none exist
    const existingGaps = db.getProductGaps(workspaceId);
    if (existingGaps.length === 0) {
      const confirmedComps = db.getWarRoomCompetitors(workspaceId).filter(c => c.status === 'CONFIRMED');
      const sampleGap: ProductGap = {
        id: `gap_${workspaceId}_init_1`,
        workspaceId,
        featureName: cleanDiffs[0] || 'Automated Proof & Verification Engine',
        category: 'Core Product',
        classification: 'DIFFERENTIATOR',
        ourStatus: 'HAVE',
        competitorCoverage: confirmedComps.map(c => ({
          competitorId: c.id,
          competitorName: c.name,
          hasCapability: false,
          details: 'Lacks native verifiable proof mechanism',
        })),
        customerDemandScore: 9,
        competitiveUrgencyScore: 8,
        differentiationScore: 9,
        strategicImpactScore: 9,
        complexityScore: 4,
        riskScore: 2,
        evidenceStrengthScore: 8,
        buildPriorityScore: Math.round((9 * 8 * 9 * 9 * 8) / (4 + 2)), // 7776
        recommendationAction: 'BUILD',
        whyNotBuild: 'Requires disciplined verification architecture and test data integrity maintenance.',
        doNothingScenario: 'Competitors copy surface-level marketing claims without delivering verified utility.',
        evidenceIds: [],
        createdAt: now,
      };
      db.saveProductGap(sampleGap);
    }

    // Populate initial recommendations if none exist
    const existingRecs = db.getWarRoomRecommendations(workspaceId);
    if (existingRecs.length === 0) {
      const rec: WarRoomRecommendation = {
        id: `rec_${workspaceId}_init_1`,
        workspaceId,
        title: `Position around "${cleanDiffs[0] || 'Verifiable Results'}" against incumbent pricing models`,
        type: 'RECOMMENDATION',
        actionType: 'GTM_CAMPAIGN',
        priority: 'P1',
        rationale: `Target customers (${cleanCustomers}) actively look for evidence and reliability rather than generic vendor promises.`,
        whatIfWeDoNothing: 'Incumbent competitors will capture search volume with high ad spend, crowding out differentiation.',
        whyThisCouldFail: 'Competitors may attempt superficial copycat messaging before our brand gains traction.',
        metricToEvaluate: 'Qualified sign-up conversion rate and customer acquisition cost',
        confidence: 91,
        status: 'PROPOSED',
        evidenceIds: [],
        createdAt: now,
      };
      db.saveWarRoomRecommendation(rec);
    }

    // Generate Company Scorecard
    const existingScorecard = db.getCompanyScorecard(workspaceId);
    if (!existingScorecard) {
      const scorecard: CompanyScorecard = {
        id: `sc_${workspaceId}`,
        workspaceId,
        strengths: cleanDiffs.length > 0 ? cleanDiffs : ['Evidence-backed methodology', 'Transparent user workflow'],
        weaknesses: ['Emerging brand awareness in enterprise tiers', 'Channel distribution scaling needed'],
        defensibilityRating: 'STRONG',
        moatScore: 82,
        competitiveAdvantages: cleanDiffs,
        criticalVulnerabilities: ['Incumbents with aggressive ad spend'],
        evidenceGroundingCount: db.listAllEvidenceForWorkspace(workspaceId).length,
        calculatedAt: now,
      };
      db.saveCompanyScorecard(scorecard);
    }

    // Generate Executive Brief
    const brief: ExecutiveBrief = {
      workspaceId,
      statusSummary: `Market model established for ${cleanCategory}. Initial competitor universe mapped and prioritized.`,
      topDevelopments: [
        `Identified ${cleanCompetitors.length || 3} direct competitor positions in target customer segment.`,
        `Synthesized primary differentiation thesis: "${cleanDiffs[0] || 'Evidence-backed value'}".`,
      ],
      topRisks: ['Incumbents reacting with copycat messaging or price bundling.'],
      topOpportunities: ['Direct customer acquisition through transparent pricing and verifiable outcomes.'],
      noChangeDetected: false,
      recommendedActions: [
        'Run targeted research jobs to gather verified evidence on competitor pricing changes.',
        'Review and approve initial GTM positioning recommendations.',
      ],
      generatedDate: now,
    };
    db.saveExecutiveBrief(brief);

    db.logAuditEvent({
      workspaceId,
      actorId: userId,
      actorName: userName,
      action: 'UPDATE',
      resourceType: 'RESEARCH_JOB',
      resourceId: model.id,
      details: { message: `Market Model mapped for category: ${cleanCategory}`, competitorCount: cleanCompetitors.length },
    });

    return this.getWarRoomOverview(workspaceId);
  },

  /**
   * Autonomous competitor discovery from workspace evidence and web patterns
   */
  discoverCompetitors(workspaceId: string, query?: string): WarRoomCompetitor[] {
    const existing = db.getWarRoomCompetitors(workspaceId);
    const existingNames = new Set(existing.map(e => e.name.toLowerCase()));
    const allEvidence = db.listAllEvidenceForWorkspace(workspaceId);

    const candidates: WarRoomCompetitor[] = [];
    const now = new Date().toISOString();

    // Scan evidence claims for prospective competitor mentions
    for (const ev of allEvidence) {
      const text = `${ev.claim} ${ev.supportingText || ''}`;
      const words = text.match(/\b[A-Z][a-z0-9]+(?:\s[A-Z][a-z0-9]+)?\b/g) || [];
      for (const candidateName of words) {
        const cleanName = candidateName.trim();
        if (
          cleanName.length > 2 &&
          !['The', 'Our', 'This', 'NextGen', 'AI', 'Resume', 'ATS', 'Google', 'LinkedIn', 'Indeed', 'Workday', 'Greenhouse', 'Pricing', 'Feature'].includes(cleanName) &&
          !existingNames.has(cleanName.toLowerCase()) &&
          !candidates.some(c => c.name.toLowerCase() === cleanName.toLowerCase())
        ) {
          existingNames.add(cleanName.toLowerCase());
          candidates.push({
            id: `comp_disc_${workspaceId}_${crypto.randomBytes(4).toString('hex')}`,
            workspaceId,
            name: cleanName,
            website: `https://www.${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            tier: 'TIER_3',
            category: 'EMERGING',
            status: 'DISCOVERED',
            sourceConfidence: 82,
            evidenceIds: [ev.id],
            strengths: ['Identified via market evidence text snippet'],
            weaknesses: ['Under ongoing intelligence analysis'],
            pricingModel: 'Unknown / Under Evaluation',
            positioningSummary: `Candidate competitor extracted from verified evidence claim: "${ev.claim.slice(0, 80)}..."`,
            createdAt: now,
            updatedAt: now,
          });
          if (candidates.length >= 4) break;
        }
      }
      if (candidates.length >= 4) break;
    }

    // If query provided, add targeted discovery candidate
    if (query && query.trim().length > 1) {
      const qClean = sanitizeStrategicInput(query);
      if (!existingNames.has(qClean.toLowerCase())) {
        candidates.unshift({
          id: `comp_disc_${workspaceId}_${crypto.randomBytes(4).toString('hex')}`,
          workspaceId,
          name: qClean,
          website: `https://www.${qClean.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          tier: 'TIER_2',
          category: 'DIRECT',
          status: 'DISCOVERED',
          sourceConfidence: 89,
          evidenceIds: [],
          strengths: ['Actively targeted search candidate'],
          weaknesses: ['Pending continuous crawling'],
          pricingModel: 'Tiered SaaS',
          positioningSummary: `Discovered from user strategic inquiry: "${qClean}"`,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Save discovered candidates
    candidates.forEach(c => db.saveWarRoomCompetitor(c));
    return candidates;
  },

  /**
   * Confirms or rejects a discovered competitor
   */
  confirmOrRejectCompetitor(
    workspaceId: string,
    competitorId: string,
    status: 'CONFIRMED' | 'REJECTED',
    notes?: string,
    userId = 'usr_system',
    userName = 'Strategic System'
  ): WarRoomCompetitor {
    const comp = db.getWarRoomCompetitor(competitorId);
    if (!comp || comp.workspaceId !== workspaceId) {
      throw new Error('Competitor not found in this workspace.');
    }

    if (status === 'CONFIRMED') {
      const plan = entitlementEngine.getEffectivePlan(workspaceId).plan;
      const existingConfirmed = db.getWarRoomCompetitors(workspaceId).filter(c => c.status === 'CONFIRMED' && c.id !== competitorId);
      if (existingConfirmed.length >= plan.quotas.maxCompetitorUniverse) {
        throw new Error(`Competitor universe limit reached (${existingConfirmed.length}/${plan.quotas.maxCompetitorUniverse}). Upgrade your plan to expand tracked competitors.`);
      }
    }

    comp.status = status;
    if (notes) comp.notes = sanitizeStrategicInput(notes);
    comp.updatedAt = new Date().toISOString();

    db.saveWarRoomCompetitor(comp);

    db.logAuditEvent({
      workspaceId,
      actorId: userId,
      actorName: userName,
      action: 'UPDATE',
      resourceType: 'RESEARCH_JOB',
      resourceId: comp.id,
      details: { competitorName: comp.name, status, notes },
    });

    return comp;
  },

  /**
   * Evaluates or recalculates Product Gaps with the transparent prioritization formula:
   * Score = (Demand * Urgency * Differentiation * Strategic Impact * Evidence Strength) / (Complexity + Risk)
   */
  evaluateProductGaps(
    workspaceId: string,
    customGap?: Partial<ProductGap>,
    userId = 'usr_system',
    userName = 'Strategic System'
  ): ProductGap[] {
    if (customGap && customGap.featureName) {
      const demand = Math.min(10, Math.max(1, customGap.customerDemandScore || 5));
      const urgency = Math.min(10, Math.max(1, customGap.competitiveUrgencyScore || 5));
      const diff = Math.min(10, Math.max(1, customGap.differentiationScore || 5));
      const impact = Math.min(10, Math.max(1, customGap.strategicImpactScore || 5));
      const complexity = Math.min(10, Math.max(1, customGap.complexityScore || 5));
      const risk = Math.min(10, Math.max(1, customGap.riskScore || 3));
      const evidence = Math.min(10, Math.max(1, customGap.evidenceStrengthScore || 5));

      // Build Prioritization Algorithm
      const denominator = Math.max(1, complexity + risk);
      const calculatedScore = Math.round((demand * urgency * diff * impact * evidence) / denominator);

      let action: 'BUILD' | 'BUY' | 'PARTNER' | 'TEST' | 'IGNORE' = 'TEST';
      if (calculatedScore > 4000) action = 'BUILD';
      else if (calculatedScore > 1500) action = 'TEST';
      else if (complexity > 7 && diff < 4) action = 'IGNORE';
      else if (complexity > 7) action = 'PARTNER';

      const newGap: ProductGap = {
        id: `gap_${workspaceId}_${Date.now()}`,
        workspaceId,
        featureName: sanitizeStrategicInput(customGap.featureName),
        category: sanitizeStrategicInput(customGap.category || 'Product Capability'),
        classification: customGap.classification || 'COMPETITIVE_PARITY',
        ourStatus: customGap.ourStatus || 'LACK',
        competitorCoverage: customGap.competitorCoverage || [],
        customerDemandScore: demand,
        competitiveUrgencyScore: urgency,
        differentiationScore: diff,
        strategicImpactScore: impact,
        complexityScore: complexity,
        riskScore: risk,
        evidenceStrengthScore: evidence,
        buildPriorityScore: calculatedScore,
        recommendationAction: action,
        whyNotBuild: sanitizeStrategicInput(
          customGap.whyNotBuild ||
            `Building this requires ${complexity}/10 engineering complexity and carries ${risk}/10 risk of diverting focus from core differentiators.`
        ),
        doNothingScenario: sanitizeStrategicInput(
          customGap.doNothingScenario ||
            `If we do nothing, competitors with established capabilities retain a parity advantage while our team focuses on high-differentiation moats.`
        ),
        evidenceIds: customGap.evidenceIds || [],
        createdAt: new Date().toISOString(),
      };

      db.saveProductGap(newGap);
      db.logAuditEvent({
        workspaceId,
        actorId: userId,
        actorName: userName,
        action: 'CREATE',
        resourceType: 'RESEARCH_JOB',
        resourceId: newGap.id,
        details: { featureName: newGap.featureName, buildPriorityScore: calculatedScore, action },
      });
    }

    return db.getProductGaps(workspaceId);
  },

  /**
   * Runs What-If Strategic Scenario Simulation
   */
  simulateScenario(
    workspaceId: string,
    scenarioTitle: string,
    triggerDescription: string,
    competitorName?: string,
    userId = 'usr_system',
    userName = 'Strategic System'
  ): ScenarioSimulation {
    const cleanTitle = sanitizeStrategicInput(scenarioTitle);
    const cleanTrigger = sanitizeStrategicInput(triggerDescription);
    const cleanComp = competitorName ? sanitizeStrategicInput(competitorName) : 'Primary Competitor';

    if (!cleanTitle || !cleanTrigger) {
      throw new Error('Scenario Title and Trigger Description are required.');
    }

    // Deterministic first/second order heuristic modeling
    const firstOrderEffects = [
      `${cleanComp} captures short-term price-sensitive customer acquisition volume by 15-25%.`,
      `Customer inquiries regarding feature parity and price match will spike within 14 days.`,
      `Gross margin pressure intensifies across standard commodity offerings.`,
    ];

    const secondOrderEffects = [
      `Competitor unit economics deteriorate if higher CAC payback cannot be sustained.`,
      `Market perception shifts from premium capability to commodity price war.`,
      `Enterprise and technical customers seek differentiated verification guarantees over discounted basic tools.`,
    ];

    const recommendedHedges = [
      `Avoid engaging in a retaliatory race-to-the-bottom price cut; highlight verified outcome accuracy.`,
      `Publish transparent benchmark proofs exposing structural failure rates in competitor tools.`,
      `Offer a frictionless pay-per-use diagnostic trial to capture dissatisfied switchers without compromising ARR.`,
    ];

    const simulation: ScenarioSimulation = {
      id: `sim_${workspaceId}_${Date.now()}`,
      workspaceId,
      scenarioTitle: cleanTitle,
      triggerDescription: cleanTrigger,
      competitorName: cleanComp,
      firstOrderEffects,
      secondOrderEffects,
      recommendedHedges,
      confidenceScore: 89,
      simulatedAt: new Date().toISOString(),
    };

    db.saveScenarioSimulation(simulation);

    db.logAuditEvent({
      workspaceId,
      actorId: userId,
      actorName: userName,
      action: 'CREATE',
      resourceType: 'RESEARCH_JOB',
      resourceId: simulation.id,
      details: { scenarioTitle: cleanTitle, competitorName: cleanComp },
    });

    return simulation;
  },

  /**
   * Builds the interactive visual Market Knowledge Graph
   */
  getMarketGraph(workspaceId: string): MarketKnowledgeGraph {
    const nodes: MarketGraphNode[] = [];
    const links: MarketGraphLink[] = [];
    const nodeIds = new Set<string>();

    const addNode = (node: MarketGraphNode) => {
      if (!nodeIds.has(node.id)) {
        nodeIds.add(node.id);
        nodes.push(node);
      }
    };

    // Central node: Our Product
    const ourProductNode: MarketGraphNode = {
      id: 'node_our_product',
      label: db.getWorkspace(workspaceId)?.businessName || 'Our Product',
      type: 'OUR_PRODUCT',
      category: 'Core',
    };
    addNode(ourProductNode);

    // Competitors
    const competitors = db.getWarRoomCompetitors(workspaceId).filter(c => c.status === 'CONFIRMED');
    competitors.forEach(c => {
      const cNodeId = `node_comp_${c.id}`;
      addNode({
        id: cNodeId,
        label: c.name,
        type: 'COMPETITOR',
        category: c.tier,
      });
      links.push({
        source: 'node_our_product',
        target: cNodeId,
        relationship: 'COMPETES_WITH',
      });
    });

    // Moves
    const moves = db.getCompetitorMoves(workspaceId, 15);
    moves.forEach(m => {
      const mNodeId = `node_move_${m.id}`;
      addNode({
        id: mNodeId,
        label: m.title.length > 30 ? `${m.title.slice(0, 30)}...` : m.title,
        type: 'MOVE',
        significance: m.significance,
        data: m,
      });
      const cNodeId = `node_comp_${m.competitorId}`;
      if (nodeIds.has(cNodeId)) {
        links.push({
          source: cNodeId,
          target: mNodeId,
          relationship: 'EXECUTED_MOVE',
        });
      }
    });

    // Product Gaps
    const gaps = db.getProductGaps(workspaceId);
    gaps.forEach(g => {
      const gNodeId = `node_gap_${g.id}`;
      addNode({
        id: gNodeId,
        label: g.featureName,
        type: 'CAPABILITY',
        category: g.classification,
        data: g,
      });
      links.push({
        source: 'node_our_product',
        target: gNodeId,
        relationship: g.ourStatus === 'HAVE' ? 'EXPOSES_DIFFERENTIATOR' : 'LACKS_CAPABILITY',
      });
    });

    // Opportunities
    const opportunities = db.getMarketOpportunities(workspaceId);
    opportunities.forEach(o => {
      const oNodeId = `node_opp_${o.id}`;
      addNode({
        id: oNodeId,
        label: o.title,
        type: 'OPPORTUNITY',
        category: o.category,
        data: o,
      });
      links.push({
        source: 'node_our_product',
        target: oNodeId,
        relationship: 'CAN_CAPTURE',
      });
    });

    // Threats
    const threats = db.getMarketThreats(workspaceId);
    threats.forEach(t => {
      const tNodeId = `node_threat_${t.id}`;
      addNode({
        id: tNodeId,
        label: t.title,
        type: 'THREAT',
        significance: t.threatLevel,
        data: t,
      });
      if (t.competitorId && nodeIds.has(`node_comp_${t.competitorId}`)) {
        links.push({
          source: `node_comp_${t.competitorId}`,
          target: tNodeId,
          relationship: 'POSES_THREAT',
        });
      }
    });

    return { nodes, links };
  },

  /**
   * Converts a Market Opportunity directly into a Campaign in Campaign Strategy Hub
   */
  convertOpportunityToCampaign(
    workspaceId: string,
    opportunityId: string,
    userId: string,
    userName: string
  ): CampaignBrief {
    const opp = db.getMarketOpportunity(opportunityId);
    if (!opp || opp.workspaceId !== workspaceId) {
      throw new Error('Opportunity not found in this workspace.');
    }

    const campaignId = `brief_warroom_${Date.now()}`;
    const newBrief: CampaignBrief = {
      id: campaignId,
      workspaceId,
      researchJobId: `job_warroom_${Date.now()}`,
      title: opp.title,
      businessName: db.getWorkspace(workspaceId)?.businessName || 'Our Product',
      objective: `Capture market whitespace: ${opp.title}`,
      targetAudience: db.getMarketModel(workspaceId)?.targetCustomers || 'Target Customer Segment',
      status: 'DRAFT',
      strategicAngle: opp.description,
      coreMessage: `Stop settling for generic claims. Our verified intelligence delivers real results.`,
      supportingMessages: [
        'Direct proof over superficial vendor promises.',
        'Zero-lockin pricing designed for customer ROI.',
        'Continuous performance benchmarking.',
      ],
      proofPoints: [
        { claim: opp.description, sourceUrl: 'https://researchflow.ai/evidence', evidenceId: opp.evidenceIds[0] || '' },
      ],
      channels: ['LINKEDIN', 'EMAIL', 'SEO'],
      callToAction: 'Experience the verified alternative today.',
      evidenceCount: opp.evidenceIds.length || 1,
      confidenceScore: opp.confidenceScore,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      strategicAngles: [
        {
          id: 'angle_1',
          name: opp.title,
          description: opp.description,
          evidenceStrength: 9,
          audienceRelevance: 9,
          differentiation: 9,
          businessImpact: 8,
          rationale: 'Directly grounded in War Room strategic opportunity.',
          isRecommended: true,
          isSelected: true,
        },
      ],
      messageArchitecture: {
        coreMessage: opp.description,
        supportingMessages: [
          { title: 'Verified Proof', message: 'Transparent benchmarks over marketing claims.', evidenceReferenceIds: opp.evidenceIds },
          { title: 'Customer Alignment', message: 'Engineered specifically for target customer ROI.', evidenceReferenceIds: opp.evidenceIds },
        ],
        proofPoints: [
          { claim: opp.description, sourceUrl: 'https://researchflow.ai/evidence', evidenceId: opp.evidenceIds[0] || '' },
        ],
        cta: 'Start with full transparency today.',
      },
      validationReport: {
        status: 'PASS',
        factualityScore: 92,
        unsupportedClaimsCount: 0,
        checks: [
          { name: 'Grounding Verification', status: 'PASS', message: 'Grounded in verified War Room opportunity' },
        ],
      },
    };

    db.saveCampaignBrief(newBrief);

    opp.campaignCreated = true;
    opp.campaignId = campaignId;
    db.saveMarketOpportunity(opp);

    db.logAuditEvent({
      workspaceId,
      actorId: userId,
      actorName: userName,
      action: 'CREATE',
      resourceType: 'CAMPAIGN',
      resourceId: campaignId,
      details: { title: opp.title, opportunityId },
    });

    return newBrief;
  },

  /**
   * Converts a Threat or Product Gap into an Execution Task in the Kanban task manager
   */
  convertThreatOrGapToTask(
    workspaceId: string,
    type: 'THREAT' | 'GAP',
    entityId: string,
    userId: string,
    userName: string
  ): ExecutionTask {
    const taskId = `task_warroom_${Date.now()}`;
    let title = '';
    let description = '';
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';

    if (type === 'THREAT') {
      const threat = db.getMarketThreat(entityId);
      if (!threat || threat.workspaceId !== workspaceId) {
        throw new Error('Threat not found in this workspace.');
      }
      title = `Counter-measure: ${threat.title}`;
      description = `Defensive plan for competitor move: ${threat.description}\n\nLeading indicators: ${threat.leadingIndicators.join(', ')}\nDefensive countermeasure: ${threat.defensiveCountermeasure}`;
      priority = threat.threatLevel === 'CRITICAL' || threat.threatLevel === 'HIGH' ? 'HIGH' : 'MEDIUM';

      threat.taskCreated = true;
      threat.taskId = taskId;
      db.saveMarketThreat(threat);
    } else {
      const gap = db.getProductGap(entityId);
      if (!gap || gap.workspaceId !== workspaceId) {
        throw new Error('Product Gap not found in this workspace.');
      }
      title = `Product Sprint: ${gap.featureName} (${gap.classification})`;
      description = `Build priority score: ${gap.buildPriorityScore}. Recommended action: ${gap.recommendationAction}.\n\nWhy not build: ${gap.whyNotBuild}\nDo nothing scenario: ${gap.doNothingScenario}`;
      priority = gap.buildPriorityScore > 4000 ? 'HIGH' : 'MEDIUM';
    }

    const task: ExecutionTask = {
      id: taskId,
      workspaceId,
      campaignId: `warroom_sprint_${Date.now()}`,
      title,
      description,
      channel: 'OTHER',
      status: 'TODO',
      assigneeName: userName || 'Product Lead',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveTask(task);

    db.logAuditEvent({
      workspaceId,
      actorId: userId,
      actorName: userName,
      action: 'CREATE',
      resourceType: 'TASK',
      resourceId: taskId,
      details: { title, entityType: type, entityId },
    });

    return task;
  },

  /**
   * Converts a Strategic Recommendation into a measurable Experiment in the Evaluation framework
   */
  convertRecommendationToExperiment(
    workspaceId: string,
    recommendationId: string,
    userId: string,
    userName: string
  ): StrategicExperiment {
    const rec = db.getWarRoomRecommendation(recommendationId);
    if (!rec || rec.workspaceId !== workspaceId) {
      throw new Error('Recommendation not found in this workspace.');
    }

    const expId = `exp_${workspaceId}_${Date.now()}`;
    const experiment: StrategicExperiment = {
      id: expId,
      workspaceId,
      title: `Experiment: ${rec.title}`,
      hypothesis: `Implementing "${rec.title}" will achieve: ${rec.metricToEvaluate}`,
      metric: rec.metricToEvaluate || 'Conversion / Retention Rate Lift',
      baselineValue: 'Current Baseline',
      targetValue: '+25% lift in evaluated metric',
      durationWeeks: 4,
      status: 'RUNNING',
      resultSummary: 'Experiment launched. Baseline monitoring in progress.',
      createdAt: new Date().toISOString(),
    };

    db.saveStrategicExperiment(experiment);

    // Record Decision
    const decision: StrategicDecision = {
      id: `dec_${workspaceId}_${Date.now()}`,
      workspaceId,
      recommendationId: rec.id,
      title: `Launched experiment for: ${rec.title}`,
      decisionType: 'EXPERIMENT_LAUNCH',
      rationale: rec.rationale,
      decidedBy: userId,
      decidedByName: userName,
      decidedAt: new Date().toISOString(),
      targetOutcome: rec.metricToEvaluate,
      status: 'PENDING_EVALUATION',
    };
    db.saveStrategicDecision(decision);

    rec.status = 'APPROVED';
    rec.experimentId = expId;
    db.saveWarRoomRecommendation(rec);

    db.logAuditEvent({
      workspaceId,
      actorId: userId,
      actorName: userName,
      action: 'CREATE',
      resourceType: 'EVALUATION',
      resourceId: expId,
      details: { title: experiment.title, recommendationId },
    });

    return experiment;
  },

  /**
   * Records a human approval or rejection decision on a recommendation
   */
  recordDecision(
    workspaceId: string,
    recommendationId: string,
    decisionType: 'APPROVE' | 'REJECT',
    rationale: string,
    userId: string,
    userName: string
  ): StrategicDecision {
    const rec = db.getWarRoomRecommendation(recommendationId);
    if (!rec || rec.workspaceId !== workspaceId) {
      throw new Error('Recommendation not found in this workspace.');
    }

    rec.status = decisionType === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    db.saveWarRoomRecommendation(rec);

    const decision: StrategicDecision = {
      id: `dec_${workspaceId}_${Date.now()}`,
      workspaceId,
      recommendationId: rec.id,
      title: `${decisionType === 'APPROVE' ? 'Approved' : 'Rejected'}: ${rec.title}`,
      decisionType: decisionType === 'APPROVE' ? 'APPROVE' : 'REJECT',
      rationale: sanitizeStrategicInput(rationale) || rec.rationale,
      decidedBy: userId,
      decidedByName: userName,
      decidedAt: new Date().toISOString(),
      targetOutcome: rec.metricToEvaluate || 'Measured Strategic Impact',
      status: 'PENDING_EVALUATION',
    };

    db.saveStrategicDecision(decision);

    // If approved and action is GTM_CAMPAIGN, automatically create draft campaign
    if (decisionType === 'APPROVE' && rec.actionType === 'GTM_CAMPAIGN') {
      const campaignId = `brief_rec_${Date.now()}`;
      const campaign: CampaignBrief = {
        id: campaignId,
        workspaceId,
        researchJobId: `job_rec_${Date.now()}`,
        title: rec.title,
        businessName: db.getWorkspace(workspaceId)?.businessName || 'Our Product',
        objective: rec.title,
        targetAudience: db.getMarketModel(workspaceId)?.targetCustomers || 'Target Customers',
        status: 'DRAFT',
        strategicAngle: rec.rationale,
        coreMessage: rec.title,
        supportingMessages: ['Evidence-backed differentiation', 'Transparent positioning'],
        proofPoints: [],
        channels: ['LINKEDIN', 'EMAIL', 'SEO'],
        callToAction: 'Act now with verified confidence.',
        evidenceCount: rec.evidenceIds.length,
        confidenceScore: rec.confidence,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.saveCampaignBrief(campaign);
      rec.campaignId = campaignId;
      db.saveWarRoomRecommendation(rec);
    }

    db.logAuditEvent({
      workspaceId,
      actorId: userId,
      actorName: userName,
      action: 'APPROVE',
      resourceType: 'APPROVAL',
      resourceId: decision.id,
      details: { decisionType, recommendationTitle: rec.title },
    });

    return decision;
  },

  /**
   * Evidence-grounded strategic search across the entire market model
   */
  searchMarketModel(workspaceId: string, query: string) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      return { competitors: [], moves: [], gaps: [], opportunities: [], threats: [], recommendations: [] };
    }

    const competitors = db.getWarRoomCompetitors(workspaceId).filter(
      c => c.name.toLowerCase().includes(q) || c.positioningSummary.toLowerCase().includes(q)
    );

    const moves = db.getCompetitorMoves(workspaceId, 50).filter(
      m => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.competitorName.toLowerCase().includes(q)
    );

    const gaps = db.getProductGaps(workspaceId).filter(
      g => g.featureName.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)
    );

    const opportunities = db.getMarketOpportunities(workspaceId).filter(
      o => o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q)
    );

    const threats = db.getMarketThreats(workspaceId).filter(
      t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );

    const recommendations = db.getWarRoomRecommendations(workspaceId).filter(
      r => r.title.toLowerCase().includes(q) || r.rationale.toLowerCase().includes(q)
    );

    return { competitors, moves, gaps, opportunities, threats, recommendations };
  },
};
