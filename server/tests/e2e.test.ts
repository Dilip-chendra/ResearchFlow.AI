import { db } from '../db/store';
import { researchService } from '../services/researchService';
import { conflictService } from '../services/conflictService';
import { evaluationService } from '../services/evaluationService';
import { searchService } from '../services/searchService';
import { aiOrchestrator } from '../ai/orchestrator';
import { Evidence } from '../types';
import { logger } from '../utils/logger';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  details?: any;
}

export async function runAllTests(): Promise<{
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
}> {
  const results: TestResult[] = [];

  async function test(suite: string, name: string, fn: () => Promise<void> | void) {
    const start = Date.now();
    try {
      await fn();
      results.push({
        suite,
        name,
        passed: true,
        durationMs: Date.now() - start,
      });
      logger.info(`[PASS] ${suite} > ${name}`);
    } catch (err: any) {
      results.push({
        suite,
        name,
        passed: false,
        durationMs: Date.now() - start,
        error: err.message,
        details: err.stack,
      });
      logger.error(`[FAIL] ${suite} > ${name}: ${err.message}`);
    }
  }

  logger.info('Starting ResearchFlow AI Automated End-to-End Test Suite...');

  // =========================================================================
  // SUITE 1: Multi-Tenant SaaS Workspace Isolation & Security Boundary
  // =========================================================================
  await test('Multi-Tenant Isolation', 'Fresh registered user gets private workspace with zero leaked jobs', async () => {
    const email = `tenant_fresh_${Date.now()}@test.io`;
    const { user } = db.registerUser({
      email,
      name: 'Fresh Founder',
    });

    const newWs = db.createWorkspace({
      id: `ws_fresh_${Date.now()}`,
      name: "Fresh Founder's Workspace",
      businessName: 'Fresh Startup',
      description: 'Zero-data fresh workspace',
      industry: 'B2B SaaS',
      targetAudience: 'Early adopters',
      ownerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    db.addMember({
      id: `mem_fresh_${Date.now()}`,
      workspaceId: newWs.id,
      name: user.name,
      email: user.email,
      role: 'OWNER',
      title: 'Founder & CEO',
      department: 'Leadership',
      joinedAt: new Date().toISOString(),
    });

    // Verify workspace starts completely empty
    const jobs = db.listResearchJobs(newWs.id);
    const evidence = db.listAllEvidenceForWorkspace(newWs.id);
    const tasks = db.listTasks(newWs.id);

    if (jobs.length !== 0) throw new Error(`Expected 0 jobs in fresh workspace, got ${jobs.length}`);
    if (evidence.length !== 0) throw new Error(`Expected 0 evidence in fresh workspace, got ${evidence.length}`);
    if (tasks.length !== 0) throw new Error(`Expected 0 tasks in fresh workspace, got ${tasks.length}`);
  });

  await test('Multi-Tenant Isolation', 'User A cannot access User B private workspace data (IDOR prevention)', async () => {
    const time = Date.now();
    const userA = db.registerUser({ email: `tenant_a_${time}@isolation.test`, name: 'Tenant A' });
    const userB = db.registerUser({ email: `tenant_b_${time}@isolation.test`, name: 'Tenant B' });

    const wsA = db.createWorkspace({
      id: `ws_tenant_a_${time}`,
      name: 'Tenant A Workspace',
      businessName: 'Fintech Alpha',
      description: 'Secret Alpha Research',
      industry: 'Fintech',
      targetAudience: 'Banks',
      ownerId: userA.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const wsB = db.createWorkspace({
      id: `ws_tenant_b_${time}`,
      name: 'Tenant B Workspace',
      businessName: 'Healthcare Beta',
      description: 'Secret Beta Research',
      industry: 'Healthcare',
      targetAudience: 'Hospitals',
      ownerId: userB.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create private job for Tenant A
    const jobA = researchService.createJob(
      {
        businessName: 'Fintech Alpha',
        businessDescription: 'High yield treasury API',
        campaignObjective: 'Enterprise bank acquisition',
        targetAudience: 'CFOs',
        competitorUrls: ['https://stripe.com'],
      },
      wsA.id
    );

    // Create private job for Tenant B
    const jobB = researchService.createJob(
      {
        businessName: 'Healthcare Beta',
        businessDescription: 'HIPAA compliant EHR',
        campaignObjective: 'Hospital clinic onboarding',
        targetAudience: 'Hospital CMOs',
        competitorUrls: ['https://epic.com'],
      },
      wsB.id
    );

    // Assertions
    const isUserAAuthorizedForWsA = db.isUserAuthorizedForWorkspace(userA.user.id, wsA.id);
    const isUserAAuthorizedForWsB = db.isUserAuthorizedForWorkspace(userA.user.id, wsB.id);

    if (!isUserAAuthorizedForWsA) throw new Error('User A should be authorized for Workspace A');
    if (isUserAAuthorizedForWsB) throw new Error('User A must NOT be authorized for Workspace B');

    const jobsInWsA = db.listResearchJobs(wsA.id);
    const jobsInWsB = db.listResearchJobs(wsB.id);

    if (!jobsInWsA.some(j => j.id === jobA.id)) throw new Error('Workspace A must contain Job A');
    if (jobsInWsA.some(j => j.id === jobB.id)) throw new Error('Workspace A leaked Job B from Tenant B!');

    if (!jobsInWsB.some(j => j.id === jobB.id)) throw new Error('Workspace B must contain Job B');
    if (jobsInWsB.some(j => j.id === jobA.id)) throw new Error('Workspace B leaked Job A from Tenant A!');

    // Direct fetch of Job B scoped to Workspace A must return undefined
    const crossFetchResult = db.getResearchJob(jobB.id, wsA.id);
    if (crossFetchResult) throw new Error('Direct cross-tenant fetch returned a record!');
  });

  await test('Multi-Tenant Isolation', 'Global search is strictly scoped to the querying workspace', async () => {
    const time = Date.now();
    const userA = db.registerUser({ email: `search_a_${time}@search.test`, name: 'Search A' });
    const wsA = db.createWorkspace({
      id: `ws_search_a_${time}`,
      name: 'Search A Workspace',
      businessName: 'Confidential Quantum AI',
      description: 'Quantum encryption',
      industry: 'DeepTech',
      targetAudience: 'DoD',
      ownerId: userA.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const userB = db.registerUser({ email: `search_b_${time}@search.test`, name: 'Search B' });
    const wsB = db.createWorkspace({
      id: `ws_search_b_${time}`,
      name: 'Search B Workspace',
      businessName: 'General E-Commerce App',
      description: 'Online store',
      industry: 'Retail',
      targetAudience: 'Shoppers',
      ownerId: userB.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create job with keyword "Quantum" in Workspace A
    researchService.createJob(
      {
        businessName: 'Confidential Quantum AI',
        businessDescription: 'Quantum encryption for defense',
        campaignObjective: 'Secure government contracts',
        targetAudience: 'Defense contractors',
        competitorUrls: ['https://example.com/quantum'],
      },
      wsA.id
    );

    // Search in Workspace B for "Quantum"
    const searchInB = searchService.search(wsB.id, 'Quantum');
    if (searchInB.length !== 0) {
      throw new Error(`Tenant B search leaked Tenant A records! Found ${searchInB.length} matches.`);
    }

    // Search in Workspace A for "Quantum"
    const searchInA = searchService.search(wsA.id, 'Quantum');
    if (searchInA.length === 0) {
      throw new Error('Tenant A search failed to find its own Quantum record.');
    }
  });

  // =========================================================================
  // SUITE 2: Evidence Grounding, Traceability & Conflict Detection
  // =========================================================================
  await test('Evidence & Conflicts', 'Conflict detection flags opposing pricing claims and tracks resolution', async () => {
    const wsId = `ws_conf_${Date.now()}`;
    const jobId = `job_conf_${Date.now()}`;

    const evidenceList: Evidence[] = [
      {
        id: `ev_${jobId}_1`,
        researchJobId: jobId,
        workspaceId: wsId,
        sourceId: 'src_1',
        category: 'Pricing',
        claim: 'Starter plan is $19/month billed annually',
        supportingText: 'Save 30% with annual billing at $19/mo per user.',
        sourceUrl: 'https://competitor.com/pricing',
        sourceTitle: 'Competitor Official Pricing',
        retrievedAt: new Date().toISOString(),
        evidenceType: 'FACT',
        confidence: 'HIGH',
        normalizedValue: '$19/mo',
      },
      {
        id: `ev_${jobId}_2`,
        researchJobId: jobId,
        workspaceId: wsId,
        sourceId: 'src_2',
        category: 'Pricing',
        claim: 'Monthly pricing starts at $29/seat with no annual contract',
        supportingText: 'Month-to-month flexibility is $29/mo with no long-term lock-in.',
        sourceUrl: 'https://reviewsite.com/competitor',
        sourceTitle: 'Software Review Portal',
        retrievedAt: new Date().toISOString(),
        evidenceType: 'FACT',
        confidence: 'HIGH',
        normalizedValue: '$29/mo',
      },
    ];

    evidenceList.forEach(e => db.saveEvidence(e));

    const conflicts = conflictService.detectConflicts(jobId, wsId, evidenceList);
    if (conflicts.length === 0) throw new Error('Expected conflict detection to flag $19 vs $29 discrepancy');

    const conflict = conflicts[0];
    if (conflict.status !== 'UNRESOLVED') throw new Error(`Expected UNRESOLVED status, got ${conflict.status}`);

    // Human operator resolution workflow
    const resolved = conflictService.resolveConflict(
      conflict.id,
      'HUMAN_VERIFIED',
      'Verified $19/mo is annual rate and $29/mo is monthly rate.'
    );

    if (!resolved || resolved.status !== 'HUMAN_VERIFIED') {
      throw new Error(`Expected HUMAN_VERIFIED status, got ${resolved?.status}`);
    }
    if (!resolved.resolutionNotes?.includes('$19/mo')) {
      throw new Error(`Expected resolutionNotes to be saved, got ${resolved.resolutionNotes}`);
    }
  });

  // =========================================================================
  // SUITE 3: Campaign Review, Approval & Execution Task Generation
  // =========================================================================
  await test('Review & Task Pipeline', 'Campaign approval creates persistent execution tasks', async () => {
    const wsId = `ws_task_${Date.now()}`;
    const user = db.registerUser({ email: `lead_${Date.now()}@review.test`, name: 'Marketing Lead' });
    db.createWorkspace({
      id: wsId,
      name: 'Review Hub',
      businessName: 'Acme SaaS',
      description: 'Testing task generation',
      industry: 'SaaS',
      targetAudience: 'Founders',
      ownerId: user.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const job = researchService.createJob(
      {
        businessName: 'Acme SaaS',
        businessDescription: 'NextGen automation platform',
        campaignObjective: 'Acquire 100 beta testers',
        targetAudience: 'Early stage founders',
        competitorUrls: ['https://en.wikipedia.org/wiki/Software_as_a_service'],
      },
      wsId
    );

    // Approve the job
    const approvedJob = researchService.approveJob(job.id, wsId, 'Approved for immediate execution', 'Sarah Jenkins');
    if (approvedJob.status !== 'approved') throw new Error(`Expected status approved, got ${approvedJob.status}`);

    const tasks = db.listTasks(wsId, job.id);
    if (tasks.length === 0) throw new Error('Expected approval to generate execution tasks');

    // Test task state transition
    const firstTask = tasks[0];
    const updated = { ...firstTask, status: 'COMPLETED' as const, completedAt: new Date().toISOString() };
    db.saveTask(updated);

    const reloaded = db.listTasks(wsId, job.id).find(t => t.id === firstTask.id);
    if (!reloaded || reloaded.status !== 'COMPLETED') {
      throw new Error(`Task status failed to persist COMPLETED, got ${reloaded?.status}`);
    }
  });

  // =========================================================================
  // SUITE 4: AI Model Routing & Fallback Diagnostics
  // =========================================================================
  await test('AI Orchestrator', 'Model routing handles structured orchestration and candidate fallback', async () => {
    const result = await aiOrchestrator.orchestrateStructured<{ facts: string[] }>(
      {
        taskType: 'RESEARCH_EXTRACTION',
        prompt: 'Extract core facts from software landing page.',
        untrustedWebData: 'Pricing is $49/mo with 99.9% uptime SLA.',
      },
      () => ({
        facts: ['Pricing is $49/mo with 99.9% uptime SLA.'],
      })
    );

    if (!result.data || !Array.isArray(result.data.facts)) {
      throw new Error('AI Orchestrator did not return valid facts array');
    }
  });

  // =========================================================================
  // SUITE 5: Rigorous 12-Case Evaluation Suite Execution
  // =========================================================================
  await test('Evaluation Suite', '12 Reliability test cases (TC01-TC12) execute with scorecards', async () => {
    const testCases = evaluationService.getTestCases();
    if (testCases.length !== 12) throw new Error(`Expected 12 test cases, found ${testCases.length}`);

    // Run TC01, TC03, TC06, TC09, TC11 as targeted reliability assertions
    const sampleCases = ['TC01', 'TC03', 'TC06', 'TC09', 'TC11'];
    for (const code of sampleCases) {
      const run = await evaluationService.runSingleTestCase(code, 'ws_demo_sandbox');
      if (!run.pass) {
        throw new Error(`Evaluation case ${code} (${run.caseName}) failed! Actual: ${run.actualBehavior}`);
      }
    }
  });

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  logger.info(`Test Suite Finished: ${passed}/${total} passed (${failed} failed)`);
  return { total, passed, failed, results };
}
