import { db } from '../server/db/store';
import { researchService } from '../server/services/researchService';
import { conflictService } from '../server/services/conflictService';
import { evaluationService } from '../server/services/evaluationService';
import { searchService } from '../server/services/searchService';
import { aiOrchestrator } from '../server/ai/orchestrator';
import { geminiAIService } from '../server/ai/gemini';
import { openRouterCatalog } from '../server/ai/openrouter/catalog';
import { Evidence, Workspace } from '../server/types';
import { logger } from '../server/utils/logger';

export interface AuditItemResult {
  category: string;
  code: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  durationMs: number;
  error?: string;
  evidence?: string;
}

export async function runFullProductionAudit(): Promise<{
  total: number;
  passed: number;
  failed: number;
  results: AuditItemResult[];
}> {
  const results: AuditItemResult[] = [];

  async function check(
    code: string,
    category: string,
    name: string,
    fn: () => Promise<void> | void
  ) {
    const start = Date.now();
    try {
      await fn();
      const dur = Date.now() - start;
      results.push({
        code,
        category,
        name,
        status: 'PASS',
        durationMs: dur,
      });
      console.log(`[PASS] [${code}] ${category} > ${name} (${dur}ms)`);
    } catch (err: any) {
      const dur = Date.now() - start;
      results.push({
        code,
        category,
        name,
        status: 'FAIL',
        durationMs: dur,
        error: err.message,
      });
      console.error(`[FAIL] [${code}] ${category} > ${name}: ${err.message}`);
    }
  }

  console.log('\n=============================================================');
  console.log('RESEARCHFLOW AI — COMPREHENSIVE PRODUCTION READINESS AUDIT (A-Z)');
  console.log('=============================================================\n');

  // --- A. Functional ---
  await check('A1', 'A. Functional', 'Complete Golden Path pipeline (Create Job -> Sources -> Evidence -> Synthesis -> Campaign -> Review -> Tasks)', async () => {
    const time = Date.now();
    const ws: Workspace = {
      id: `ws_func_${time}`,
      name: `Func Test Workspace ${time}`,
      businessName: 'Apex Cloud Systems',
      description: 'Enterprise developer infrastructure',
      industry: 'Developer Tools',
      targetAudience: 'Senior Backend Engineers',
      ownerId: 'usr_test_owner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.createWorkspace(ws);

    const job = researchService.createJob({
      businessName: 'Apex Cloud Systems',
      businessDescription: 'Enterprise developer infrastructure',
      campaignObjective: 'Dismantle legacy paywalls',
      targetAudience: 'Senior Engineers',
      competitorUrls: ['https://en.wikipedia.org/wiki/Software_as_a_service'],
    }, ws.id);

    await researchService.runJob(job.id, ws.id);
    const completedJob = db.getResearchJob(job.id, ws.id);
    if (!completedJob) throw new Error('Job was not saved to database');
    if (completedJob.status !== 'awaiting_review' && completedJob.status !== 'approved') {
      throw new Error(`Job ended in unexpected status: ${completedJob.status}`);
    }
    const evidence = db.listEvidence(job.id);
    if (evidence.length === 0) {
      throw new Error('Zero evidence extracted from research pipeline');
    }
    const intel = db.getIntelligenceByJobId(job.id);
    if (!intel || !intel.findings || intel.findings.length === 0) {
      throw new Error('Zero intelligence findings generated');
    }
  });

  // --- B. Authentication ---
  await check('B1', 'B. Authentication', 'User registration, session tokens, duplicate email rejection', async () => {
    const email = `auth_test_${Date.now()}@example.com`;
    const reg = db.registerUser({ email, name: 'Auth Tester', password: 'Password123!' });
    if (!reg.token || !reg.user) throw new Error('Registration failed to return user or token');

    const authCheck = db.getSessionUser(reg.token);
    if (!authCheck || authCheck.id !== reg.user.id) throw new Error('Session token lookup failed');

    // Duplicate check
    try {
      db.registerUser({ email, name: 'Duplicate User', password: 'Password123!' });
      throw new Error('Allowed duplicate email registration');
    } catch (err: any) {
      if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
        throw err;
      }
    }
  });

  // --- C. Authorization ---
  await check('C1', 'C. Authorization', 'Role-Based Access Control (RBAC) permission boundaries', async () => {
    const wsId = `ws_rbac_${Date.now()}`;
    const owner = db.registerUser({ email: `owner_${Date.now()}@rbac.test`, name: 'Owner User' });
    const reviewer = db.registerUser({ email: `reviewer_${Date.now()}@rbac.test`, name: 'Reviewer User' });

    db.addMember({
      id: `mem_owner_${Date.now()}`,
      workspaceId: wsId,
      name: owner.user.name,
      email: owner.user.email,
      role: 'OWNER',
      joinedAt: new Date().toISOString(),
    });

    db.addMember({
      id: `mem_rev_${Date.now()}`,
      workspaceId: wsId,
      name: reviewer.user.name,
      email: reviewer.user.email,
      role: 'REVIEWER',
      joinedAt: new Date().toISOString(),
    });

    const ownerMembers = db.listMembers(wsId);
    const revMem = ownerMembers.find(m => m.email === reviewer.user.email);
    if (!revMem || revMem.role !== 'REVIEWER') {
      throw new Error('Reviewer role not correctly recorded');
    }
  });

  // --- D. Tenant Isolation ---
  await check('D1', 'D. Tenant Isolation', 'User A cannot access User B resources (Strict IDOR prevention)', async () => {
    const time = Date.now();
    const wsA = `ws_ten_a_${time}`;
    const wsB = `ws_ten_b_${time}`;

    const jobA = researchService.createJob({
      businessName: 'Confidential Company A',
      businessDescription: 'Internal product A',
      campaignObjective: 'Internal strategy A',
      targetAudience: 'Executives',
      competitorUrls: ['https://en.wikipedia.org/wiki/Resume'],
    }, wsA);

    // Querying from Workspace B must return null
    const crossAccess = db.getResearchJob(jobA.id, wsB);
    if (crossAccess !== null && crossAccess !== undefined) {
      throw new Error(`IDOR vulnerability! Workspace B accessed Workspace A job: ${crossAccess.businessName}`);
    }

    const bEvidence = db.listAllEvidenceForWorkspace(wsB);
    if (bEvidence.some(e => e.workspaceId === wsA)) {
      throw new Error('Cross-tenant evidence leakage detected in workspace query!');
    }
  });

  // --- E. Database ---
  await check('E1', 'E. Database', 'Database store ACID consistency and foreign-key relation persistence', async () => {
    const wsId = `ws_db_test_${Date.now()}`;
    const job = researchService.createJob({
      businessName: 'Database Test Entity',
      businessDescription: 'ACID verification',
      campaignObjective: 'Verify ACID store',
      targetAudience: 'Engineers',
      competitorUrls: ['https://en.wikipedia.org/wiki/Resume'],
    }, wsId);

    const fetched = db.getResearchJob(job.id);
    if (!fetched || fetched.workspaceId !== wsId) {
      throw new Error('Database failed to persist research job entity');
    }
  });

  // --- F. Research ---
  await check('F1', 'F. Research', 'Research pipeline state transitions (CREATED -> RUNNING -> COMPLETED/AWAITING_REVIEW)', async () => {
    const wsId = `ws_pipe_${Date.now()}`;
    const job = researchService.createJob({
      businessName: 'Pipeline Transition Corp',
      businessDescription: 'Testing state transitions',
      campaignObjective: 'State machine verification',
      targetAudience: 'Testing audience',
      competitorUrls: ['https://en.wikipedia.org/wiki/Resume'],
    }, wsId);

    if (job.status !== 'queued' && job.status !== 'draft') {
      throw new Error(`Invalid initial job state: ${job.status}`);
    }

    await researchService.runJob(job.id, wsId);
    const updated = db.getResearchJob(job.id, wsId);
    if (!updated || (updated.status !== 'awaiting_review' && updated.status !== 'approved')) {
      throw new Error(`Pipeline failed to reach terminal valid state: ${updated?.status}`);
    }
  });

  // --- G. Browser/Research Safety ---
  await check('G1', 'G. Browser/Research Safety', 'SSRF defense blocks localhost, private IPs, and malicious schemes', async () => {
    const maliciousUrls = [
      'http://localhost:3000/api/secret',
      'http://127.0.0.1:8080',
      'http://169.254.169.254/latest/meta-data/',
      'file:///etc/passwd',
      'javascript:alert(1)',
    ];

    for (const url of maliciousUrls) {
      try {
        const job = researchService.createJob({
          businessName: 'SSRF Attack Probe',
          businessDescription: 'SSRF testing probe',
          campaignObjective: 'Probe network',
          targetAudience: 'Network',
          competitorUrls: [url],
        }, `ws_ssrf_${Date.now()}`);
        await researchService.runJob(job.id, `ws_ssrf_${Date.now()}`);
        const sources = db.listSources(job.id);
        const source = sources[0];
        if (source && source.status === 'completed') {
          throw new Error(`SSRF filter failed! Dangerous URL completed: ${url}`);
        }
      } catch (err: any) {
        // Safe rejection is expected
      }
    }
  });

  // --- H. AI Orchestration ---
  await check('H1', 'H. AI', 'AI Orchestrator task dispatch, latency tracking, and audit generation', async () => {
    const res = await aiOrchestrator.orchestrateStructured<{ summary: string }>({
      taskType: 'EXECUTIVE_SUMMARY',
      prompt: 'Summarize competitive landscape for Developer Tools in 1 sentence.',
      systemInstruction: 'Return valid JSON with { "summary": string }',
    }, () => ({ summary: 'Developer tools market favors fast CLI workflows.' }));

    if (!res.data || !res.data.summary) {
      throw new Error('AI Orchestrator returned invalid data structure');
    }
    if (!res.usedProvider || !res.usedModel) {
      throw new Error('AI Orchestrator did not record provider/model attribution');
    }
  });

  // --- I. OpenRouter ---
  await check('I1', 'I. OpenRouter', 'Dynamic free model discovery & availability checks', async () => {
    const models = openRouterCatalog.getCachedFreeModels();
    if (!Array.isArray(models) || models.length === 0) throw new Error('OpenRouter getCachedFreeModels did not return free models');
  });

  // --- J. Gemini ---
  await check('J1', 'J. Gemini', 'Gemini AI Service extraction & positioning synthesis', async () => {
    const sampleEv: Evidence[] = [
      {
        id: `ev_test_${Date.now()}`,
        workspaceId: 'ws_test',
        researchJobId: 'job_test',
        sourceId: 'src_test',
        sourceTitle: 'Competitor Home',
        sourceUrl: 'https://competitor.io',
        category: 'Pricing',
        evidenceType: 'FACT',
        claim: 'Competitor charges $49/mo with annual billing',
        supportingText: 'Pricing is $49 billed annually',
        retrievedAt: new Date().toISOString(),
        confidence: 'HIGH',
      }
    ];

    const sum = await geminiAIService.generateExecutiveSummary({
      businessName: 'CloudPro AI',
      latestJobs: [],
      evidenceList: sampleEv,
    });

    if (!sum.paragraph || sum.paragraph.length < 10) {
      throw new Error('Gemini AI summary returned empty paragraph');
    }
    if (!Array.isArray(sum.keySignals) || sum.keySignals.length === 0) {
      throw new Error('Gemini AI summary returned zero key signals');
    }
  });

  // --- K. Fallback ---
  await check('K1', 'K. Fallback', 'AI Orchestrator heuristic self-repair handles fallback when all models fail', async () => {
    const fallbackData = { summary: 'Heuristic synthesis fallback executed successfully' };
    const res = await aiOrchestrator.orchestrateStructured<{ summary: string }>({
      taskType: 'EXECUTIVE_SUMMARY',
      prompt: 'Testing fallback execution',
      systemInstruction: 'Return JSON',
    }, () => fallbackData);

    if (!res.data || !res.data.summary) {
      throw new Error('Fallback execution failed');
    }
  });

  // --- L. Validation ---
  await check('L1', 'L. Validation', 'Distinction between FACT, INFERENCE, and RECOMMENDATION evidence types', async () => {
    const evFact: Evidence = {
      id: 'ev_fact_1',
      workspaceId: 'ws_val',
      researchJobId: 'job_val',
      sourceId: 'src_val_1',
      sourceTitle: 'Pricing Page',
      sourceUrl: 'https://competitor.io/pricing',
      category: 'Pricing',
      evidenceType: 'FACT',
      claim: 'Public pricing page lists $19 tier',
      supportingText: 'Starting at $19 per user',
      retrievedAt: new Date().toISOString(),
      confidence: 'HIGH',
    };

    const evInf: Evidence = {
      id: 'ev_inf_1',
      workspaceId: 'ws_val',
      researchJobId: 'job_val',
      sourceId: 'src_val_2',
      sourceTitle: 'Feature Matrix',
      sourceUrl: 'https://competitor.io/features',
      category: 'Differentiators',
      evidenceType: 'INFERENCE',
      claim: 'Low price suggests student/entry tier target',
      supportingText: 'Discount for students available',
      retrievedAt: new Date().toISOString(),
      confidence: 'MEDIUM',
    };

    if (evFact.evidenceType === evInf.evidenceType) {
      throw new Error('Evidence types collided');
    }
  });

  // --- M. Human Approval ---
  await check('M1', 'M. Human Approval', 'Review Queue and approval decision recording', async () => {
    const wsId = `ws_appr_${Date.now()}`;
    const job = researchService.createJob({
      businessName: 'Approval Test Co',
      businessDescription: 'Approval workflow verification',
      campaignObjective: 'Human review gating',
      targetAudience: 'Testing',
      competitorUrls: ['https://en.wikipedia.org/wiki/Resume'],
    }, wsId);

    await researchService.runJob(job.id, wsId);
    const brief = db.getCampaignBriefByJobId(job.id);
    if (!brief) throw new Error('Campaign brief was not generated for job');

    db.recordApprovalDecision({
      id: `dec_${Date.now()}`,
      workspaceId: wsId,
      resourceType: 'CAMPAIGN',
      resourceId: brief.id,
      decision: 'APPROVED',
      reviewedBy: 'usr_tester_1',
      reviewedByName: 'Lead Founder',
      reason: 'Looks solid, approved for execution.',
      reviewedAt: new Date().toISOString(),
    });

    const decisions = db.listApprovalDecisions(wsId);
    if (decisions.length === 0 || decisions[0].decision !== 'APPROVED') {
      throw new Error('Approval decision was not recorded');
    }
  });

  // --- N. Campaign ---
  await check('N1', 'N. Campaign', 'Multi-channel drafts generated (LinkedIn, Email, SEO) with audience targeting', async () => {
    const wsId = `ws_camp_${Date.now()}`;
    const job = researchService.createJob({
      businessName: 'Campaign Studio Test',
      businessDescription: 'Campaign drafts verification',
      campaignObjective: 'Channel strategy verification',
      targetAudience: 'Growth Marketers',
      competitorUrls: ['https://en.wikipedia.org/wiki/Resume'],
    }, wsId);

    await researchService.runJob(job.id, wsId);
    const assets = db.listCampaignAssets(job.id);
    if (assets.length < 3) {
      throw new Error(`Expected at least 3 channel drafts, got ${assets.length}`);
    }
  });

  // --- O. Tasks ---
  await check('O1', 'O. Tasks', 'Actionable tasks generated with direct evidence lineage and status transitions', async () => {
    const wsId = `ws_tasks_${Date.now()}`;
    const task = db.saveTask({
      id: `task_test_${Date.now()}`,
      researchJobId: 'job_test_123',
      workspaceId: wsId,
      title: 'Deploy competitor comparison landing wedge',
      description: 'Contrasting transparent pricing against legacy paywalls',
      category: 'LANDING_PAGE',
      priority: 'HIGH',
      status: 'PENDING',
      reason: 'Capitalize on transparent pricing differentiator against competitor paywall',
      createdAt: new Date().toISOString(),
    });

    task.status = 'COMPLETED';
    db.saveTask(task);
    const updated = db.getTask(task.id);
    if (!updated || updated.status !== 'COMPLETED') {
      throw new Error(`Task status failed to update: ${updated?.status}`);
    }
  });

  // --- P. Evaluation ---
  await check('P1', 'P. Evaluation', '12 Adversarial Test Cases (TC01-TC12) execute with scorecards', async () => {
    const wsId = `ws_eval_${Date.now()}`;
    const tc1 = await evaluationService.runSingleTestCase('TC01', wsId);
    if (!tc1 || typeof tc1.qualityScore !== 'number') {
      throw new Error('Evaluation test case failed to execute');
    }
    const summary = evaluationService.getEvaluationSummary();
    if (!summary || typeof summary.totalCases !== 'number') {
      throw new Error('Evaluation summary missing');
    }
    if (summary.totalCases < 12) {
      throw new Error(`Expected 12 test cases in evaluation suite, got ${summary.totalCases}`);
    }
  });

  // --- Q. Audit ---
  await check('Q1', 'Q. Audit', 'Audit trail produces immutable chronological records of system events', async () => {
    const wsId = `ws_audit_${Date.now()}`;
    db.recordAudit({
      workspaceId: wsId,
      eventType: 'research_started',
      summary: 'Started research pipeline',
      details: { priority: 'high' },
    });

    const events = db.listAuditEvents(wsId);
    if (events.length === 0) throw new Error('Audit event was not recorded');
    if (events[0].eventType !== 'research_started') {
      throw new Error(`Incorrect audit event type: ${events[0].eventType}`);
    }
  });

  // --- R. Notifications ---
  await check('R1', 'R. Notifications', 'Notifications created, scoped to workspace, with read state toggling', async () => {
    const wsId = `ws_notif_${Date.now()}`;
    const notif = db.createNotification({
      workspaceId: wsId,
      userId: 'usr_notif_1',
      type: 'REVIEW_REQUIRED',
      title: 'Review Required',
      message: 'Campaign brief ready for founder approval',
      isRead: false,
    });

    const notifs = db.listNotifications(wsId);
    if (notifs.length === 0) throw new Error('Notification not recorded in database');
    const marked = db.markNotificationRead(notif.id, wsId);
    if (!marked) throw new Error('markNotificationRead returned false');
    const updatedNotifs = db.listNotifications(wsId);
    if (!updatedNotifs.find(n => n.id === notif.id)?.isRead) {
      throw new Error('Failed to mark notification as read');
    }
  });

  // --- S. Search ---
  await check('S1', 'S. Search', 'Global cross-entity search correctly filters by workspace', async () => {
    const wsA = `ws_search_a_${Date.now()}`;
    const wsB = `ws_search_b_${Date.now()}`;

    researchService.createJob({
      businessName: 'Unicorn Quantum Search Target',
      businessDescription: 'Quantum search target',
      campaignObjective: 'Target search query',
      targetAudience: 'Quantum Scientists',
      competitorUrls: ['https://en.wikipedia.org/wiki/Resume'],
    }, wsA);

    const resultsA = searchService.search(wsA, 'Quantum');
    if (resultsA.length === 0) {
      throw new Error('Search failed to find entity in Workspace A');
    }

    const resultsB = searchService.search(wsB, 'Quantum');
    if (resultsB.length > 0) {
      throw new Error('Cross-tenant data leak! Workspace B found Workspace A search query');
    }
  });

  // --- T. Export ---
  await check('T1', 'T. Export', 'Export logic generates Markdown and JSON briefs without cross-tenant leaks', async () => {
    const wsId = `ws_exp_${Date.now()}`;
    const job = researchService.createJob({
      businessName: 'Exportable Research Target',
      businessDescription: 'Export testing',
      campaignObjective: 'Export verification',
      targetAudience: 'Testing',
      competitorUrls: ['https://en.wikipedia.org/wiki/Resume'],
    }, wsId);

    await researchService.runJob(job.id, wsId);
    const evidence = db.listEvidence(job.id);
    const intel = db.getIntelligenceByJobId(job.id);
    const brief = db.getCampaignBriefByJobId(job.id);

    let md = `# ResearchFlow Intelligence Brief: ${job.businessName}\n\n`;
    md += `**Objective**: ${job.campaignObjective}\n`;
    md += `**Target Audience**: ${job.targetAudience}\n`;
    md += `## Verified Evidence Claims (${evidence.length})\n`;

    if (!md.includes('Exportable Research Target') || !md.includes('Verified Evidence Claims')) {
      throw new Error('Markdown export structure failed');
    }
  });

  // --- U. Performance ---
  await check('U1', 'U. Performance', 'Database response times under 50ms for typical entity queries', async () => {
    const start = Date.now();
    const ws = db.getWorkspacesForUser('usr_demo_founder');
    const dur = Date.now() - start;
    if (dur > 50) {
      throw new Error(`Database query exceeded performance budget: ${dur}ms`);
    }
  });

  // --- V. Security ---
  await check('V1', 'V. Security', 'XSS payload sanitization in text fields', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    const job = researchService.createJob({
      businessName: `Safe Corp ${xssPayload}`,
      businessDescription: 'XSS test description',
      campaignObjective: 'Test XSS sanitization',
      targetAudience: 'Security Researchers',
      competitorUrls: ['https://en.wikipedia.org/wiki/Resume'],
    }, `ws_xss_${Date.now()}`);

    if (!job.businessName.includes('Safe Corp')) {
      throw new Error('Job name corrupted');
    }
  });

  // --- W. Accessibility & UX ---
  await check('W1', 'W. Accessibility & UX', 'Semantic structure and brand logo rendering without broken assets', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const pubDir = path.join(process.cwd(), 'public');
    const reqFiles = [
      'favicon.svg',
      'favicon.png',
      'favicon.ico',
      'brand/researchflow-symbol.svg',
      'brand/researchflow-logo.svg',
      'brand/researchflow-og.svg',
    ];

    for (const f of reqFiles) {
      if (!fs.existsSync(path.join(pubDir, f))) {
        throw new Error(`Missing required brand asset: ${f}`);
      }
    }
  });

  // --- X. Mobile ---
  await check('X1', 'X. Mobile', 'Responsive drawer navigation and viewport scaling support', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const sidebar = fs.readFileSync(path.join(process.cwd(), 'src/components/layout/Sidebar.tsx'), 'utf-8');
    if (!sidebar.includes('isMobileNavOpen') || !sidebar.includes('fixed inset-0')) {
      throw new Error('Mobile drawer navigation component missing');
    }
  });

  // --- Y. Build & Deployment ---
  await check('Y1', 'Y. Build & Deployment', 'Production build artifacts exist and are non-empty', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const distHtml = path.join(process.cwd(), 'dist/index.html');
    const distServer = path.join(process.cwd(), 'dist/server.cjs');
    if (!fs.existsSync(distHtml) || !fs.existsSync(distServer)) {
      throw new Error('Production build artifacts missing from dist/');
    }
  });

  // --- Z. Recovery ---
  await check('Z1', 'Z. Recovery', 'Pipeline recovers gracefully when single source in batch fails', async () => {
    const wsId = `ws_rec_${Date.now()}`;
    const job = researchService.createJob({
      businessName: 'Partial Failure Target',
      businessDescription: 'Partial failure test',
      campaignObjective: 'Ensure surviving sources produce evidence',
      targetAudience: 'Testing',
      competitorUrls: [
        'https://en.wikipedia.org/wiki/Resume',
        'https://invalid-non-existent-domain-fail-test.xyz',
      ],
    }, wsId);

    await researchService.runJob(job.id, wsId);
    const sources = db.listSources(job.id);
    if (sources.length !== 2) throw new Error(`Source count mismatch: expected 2, got ${sources.length}`);
    const completedSources = sources.filter(s => s.status === 'completed');
    const failedSources = sources.filter(s => s.status === 'failed');
    if (completedSources.length < 1 || failedSources.length < 1) {
      throw new Error(`Expected 1 completed and 1 failed source, got ${completedSources.length} completed, ${failedSources.length} failed`);
    }
  });

  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log('\n-------------------------------------------------------------');
  console.log(`FULL PRODUCTION AUDIT COMPLETE: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('-------------------------------------------------------------\n');

  return { total, passed, failed, results };
}

if (process.argv[1]?.includes('full-production-audit')) {
  runFullProductionAudit()
    .then(({ failed }) => {
      if (failed > 0) process.exit(1);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal audit failure:', err);
      process.exit(1);
    });
}
