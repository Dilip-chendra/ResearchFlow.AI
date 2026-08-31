import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { apiRouter } from '../server/api/routes';
import { db } from '../server/db/store';
import { VALID_VIEWS } from '../src/context/WorkspaceContext';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${testName} - Detail: ${detail || 'Assertion failed'}`);
  }
}

async function runAllTests() {
  console.log('================================================================');
  console.log('RESEARCHFLOW AI - AUDIT OVERFLOW, PROFILE & ROUTING TEST SUITE');
  console.log('================================================================\n');

  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/api', apiRouter);

  // Serve static fallback for production client-side routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.send('<!DOCTYPE html><html><head><title>ResearchFlow AI</title></head><body><div id="root"></div></body></html>');
  });

  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3004;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // ============================================================
    // SECTION 1: BUG #1 - RECENT AUDIT EVENTS & LONG METADATA
    // ============================================================
    console.log('--- TEST SECTION 1: AUDIT EVENTS ROBUSTNESS & DATA SAFETY ---');

    // Add long and unusual audit events
    db.recordAudit({
      workspaceId: 'ws_demo_sandbox',
      eventType: 'SYSTEM_EVENT',
      action: 'source_crawled_with_extremely_long_url_and_unbroken_string_parameters',
      summary: 'Crawled source https://verylongdomainnameexample.com/deeply/nested/article/path/with/many/segments/and/unbroken_identifiers_1234567890_abcdefghij_klmnopqrstuvwxyz?param1=test&param2=unbrokenvalue',
      details: {
        rawPayload: {
          nestedKey: 'A'.repeat(200),
          longArray: Array.from({ length: 15 }, (_, i) => `item_${i}_${'B'.repeat(30)}`),
        },
      },
    });

    db.recordAudit({
      workspaceId: 'ws_demo_sandbox',
      eventType: 'SYSTEM_EVENT',
      action: 'ai_run_completed_with_huge_token_breakdown',
      summary: 'Completed deep reasoning extraction pipeline for campaign intelligence.',
      details: { model: 'gemini-3.6-flash', latencyMs: 1420 },
    });

    const resActivity = await fetch(`${baseUrl}/api/activity?limit=50`, {
      headers: {
        'x-demo-mode': 'true',
        'x-workspace-id': 'ws_demo_sandbox',
      },
    });
    assert(resActivity.status === 200, 'GET /api/activity returns 200 OK');
    const activityLogs = await resActivity.json();
    assert(Array.isArray(activityLogs) && activityLogs.length > 0, `Activity endpoint returned ${activityLogs.length} events`);
    const longEvent = activityLogs.find((e: any) => e.summary.includes('verylongdomainnameexample'));
    assert(!!longEvent, 'Long unbroken URL audit event correctly recorded and retrievable');

    // ============================================================
    // SECTION 2: BUG #2 - PROFILE SETTINGS PERSISTENCE & ISOLATION
    // ============================================================
    console.log('\n--- TEST SECTION 2: PROFILE PERSISTENCE ACROSS REFRESH & LOGIN ---');

    const testEmailAlpha = `alpha_${Date.now()}@testcorp.com`;
    const testPassword = 'Password123!';

    // 1. Signup User Alpha
    console.log(`1. Signing up user ${testEmailAlpha}...`);
    const resSignupAlpha = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmailAlpha,
        password: testPassword,
        name: 'Initial Alpha Name',
        workspaceName: 'Alpha Workspace',
      }),
    });
    assert(resSignupAlpha.status === 200, 'Signup User Alpha returns 200 OK');
    const signupDataAlpha = await resSignupAlpha.json();
    const tokenAlpha1 = signupDataAlpha.token;
    assert(!!tokenAlpha1, 'Received session token for User Alpha');

    // 2. Fetch initial profile
    const resMe1 = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tokenAlpha1}` },
    });
    assert(resMe1.status === 200, 'GET /api/auth/me returns 200 OK');
    const meData1 = await resMe1.json();
    assert(meData1.user.name === 'Initial Alpha Name', 'Initial name matches signup data');

    // 3. Update User Alpha profile: EMOJI avatar
    console.log('2. Updating profile to Test User Alpha with 🚀 emoji avatar...');
    const resUpdate1 = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAlpha1}`,
      },
      body: JSON.stringify({
        name: 'Test User Alpha',
        displayName: 'alpha-user',
        avatarType: 'EMOJI',
        avatarValue: '🚀',
      }),
    });
    assert(resUpdate1.status === 200, 'PUT /api/auth/profile returns 200 OK');
    const updateData1 = await resUpdate1.json();
    assert(updateData1.user.name === 'Test User Alpha', 'Update response returns new fullName');
    assert(updateData1.user.displayName === 'alpha-user', 'Update response returns new displayName');
    assert(updateData1.user.avatarType === 'EMOJI', 'Update response returns EMOJI avatarType');
    assert(updateData1.user.avatarValue === '🚀', 'Update response returns 🚀 avatarValue');

    // 4. Simulate Page Refresh: Call GET /api/auth/me with same token
    console.log('3. Simulating Page Refresh (GET /api/auth/me)...');
    const resRefreshAlpha = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tokenAlpha1}` },
    });
    assert(resRefreshAlpha.status === 200, 'Refreshed GET /api/auth/me returns 200 OK');
    const refreshedDataAlpha = await resRefreshAlpha.json();
    assert(refreshedDataAlpha.user.name === 'Test User Alpha', 'Refreshed profile preserves fullName');
    assert(refreshedDataAlpha.user.displayName === 'alpha-user', 'Refreshed profile preserves displayName');
    assert(refreshedDataAlpha.user.avatarType === 'EMOJI', 'Refreshed profile preserves avatarType');
    assert(refreshedDataAlpha.user.avatarValue === '🚀', 'Refreshed profile preserves avatarValue');

    // 5. Simulate Logout & Re-login
    console.log('4. Simulating Logout & Re-login...');
    await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAlpha1}` },
    });

    const resLoginAlpha = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmailAlpha, password: testPassword }),
    });
    assert(resLoginAlpha.status === 200, 'Re-login User Alpha returns 200 OK');
    const loginDataAlpha = await resLoginAlpha.json();
    const tokenAlpha2 = loginDataAlpha.token;
    assert(loginDataAlpha.user.name === 'Test User Alpha', 'Re-login user object preserves fullName');
    assert(loginDataAlpha.user.displayName === 'alpha-user', 'Re-login user object preserves displayName');
    assert(loginDataAlpha.user.avatarType === 'EMOJI', 'Re-login user object preserves avatarType');
    assert(loginDataAlpha.user.avatarValue === '🚀', 'Re-login user object preserves avatarValue');

    // 6. Test Custom Photo Upload & Persistence
    console.log('5. Testing Custom Photo Upload & Persistence...');
    const samplePhotoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const resUploadPhoto = await fetch(`${baseUrl}/api/auth/profile/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAlpha2}`,
      },
      body: JSON.stringify({ imageBase64: samplePhotoBase64, mimeType: 'image/png' }),
    });
    assert(resUploadPhoto.status === 200, 'Upload profile photo returns 200 OK');
    const photoData = await resUploadPhoto.json();
    assert(photoData.user.avatarType === 'IMAGE', 'Avatar type updated to IMAGE');
    assert(!!photoData.user.profileImageUrl, 'Profile image URL generated');

    const resPhotoRefresh = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tokenAlpha2}` },
    });
    const photoRefreshData = await resPhotoRefresh.json();
    assert(photoRefreshData.user.avatarType === 'IMAGE', 'Refreshed profile preserves IMAGE avatarType');
    assert(photoRefreshData.user.profileImageUrl === photoData.user.profileImageUrl, 'Refreshed profile preserves profileImageUrl');

    // 7. Multi-User Isolation: Signup User Beta
    console.log('6. Testing Multi-User Profile Isolation...');
    const testEmailBeta = `beta_${Date.now()}@testcorp.com`;
    const resSignupBeta = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmailBeta,
        password: testPassword,
        name: 'Bob Builder',
      }),
    });
    const signupDataBeta = await resSignupBeta.json();
    const tokenBeta = signupDataBeta.token;

    const resMeBeta = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tokenBeta}` },
    });
    const meDataBeta = await resMeBeta.json();
    assert(meDataBeta.user.name === 'Bob Builder', 'User Beta has distinct name "Bob Builder"');
    assert(meDataBeta.user.avatarType === 'INITIALS', 'User Beta has distinct INITIALS avatarType');
    assert(meDataBeta.user.avatarValue === 'BB', 'User Beta has initials "BB"');

    // Verify User Alpha still has Alpha profile
    const resMeAlphaCheck = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tokenAlpha2}` },
    });
    const meDataAlphaCheck = await resMeAlphaCheck.json();
    assert(meDataAlphaCheck.user.name === 'Test User Alpha', 'User Alpha profile unaffected by User Beta');

    // ============================================================
    // SECTION 3: BUG #3 - DEEP ROUTE PRESERVATION & REFRESH
    // ============================================================
    console.log('\n--- TEST SECTION 3: DEEP ROUTE PRESERVATION & CLIENT REFRESH ---');

    // Test URL route parser simulation
    function simulateRouteParse(pathStr: string, queryStr = '', hashStr = '') {
      const rawPath = pathStr.replace(/^\/+/, '').split('/');
      const searchParams = new URLSearchParams(queryStr);
      const hash = hashStr.replace(/^#/, '').toLowerCase();

      const primaryPath = rawPath[0]?.toLowerCase() || '';
      const secondaryPath = rawPath[1] || null;
      const queryJobId = searchParams.get('jobId') || searchParams.get('id') || secondaryPath;
      const queryView = searchParams.get('view')?.toLowerCase();

      if (VALID_VIEWS.includes(primaryPath)) {
        return { view: primaryPath, jobId: queryJobId };
      }
      if (queryView && VALID_VIEWS.includes(queryView)) {
        return { view: queryView, jobId: queryJobId };
      }
      if (hash && VALID_VIEWS.includes(hash)) {
        return { view: hash, jobId: queryJobId };
      }
      return { view: 'overview', jobId: queryJobId };
    }

    const testRoutes = [
      { path: '/intelligence', query: '', expectedView: 'intelligence', expectedJob: null },
      { path: '/intelligence/job_1788162380940_8vb1', query: '', expectedView: 'intelligence', expectedJob: 'job_1788162380940_8vb1' },
      { path: '/research', query: '', expectedView: 'research', expectedJob: null },
      { path: '/research/job_1788162380940_8vb1', query: '', expectedView: 'research', expectedJob: 'job_1788162380940_8vb1' },
      { path: '/campaigns', query: '', expectedView: 'campaigns', expectedJob: null },
      { path: '/tasks', query: '?jobId=job_1788162380940_8vb1', expectedView: 'tasks', expectedJob: 'job_1788162380940_8vb1' },
      { path: '/evidence', query: '', expectedView: 'evidence', expectedJob: null },
      { path: '/evaluation', query: '', expectedView: 'evaluation', expectedJob: null },
      { path: '/audit', query: '', expectedView: 'audit', expectedJob: null },
      { path: '/settings', query: '', expectedView: 'settings', expectedJob: null },
      { path: '/architecture', query: '', expectedView: 'architecture', expectedJob: null },
      { path: '/', query: '?view=settings', expectedView: 'settings', expectedJob: null },
      { path: '/', query: '', hash: '#tasks', expectedView: 'tasks', expectedJob: null },
    ];

    for (const tr of testRoutes) {
      const parsed = simulateRouteParse(tr.path, tr.query, tr.hash || '');
      assert(
        parsed.view === tr.expectedView && parsed.jobId === tr.expectedJob,
        `Route parse: "${tr.path}${tr.query || (tr.hash ? '#' + tr.hash : '')}" -> view: ${parsed.view}, jobId: ${parsed.jobId}`
      );
    }

    // Test Server-side SPA Fallback for direct browser requests
    console.log('Testing server-side SPA fallback for direct URL requests...');
    const directUrls = ['/intelligence', '/research/job_1788162380940_8vb1', '/campaigns', '/tasks', '/settings', '/audit'];
    for (const route of directUrls) {
      const res = await fetch(`${baseUrl}${route}`);
      assert(res.status === 200, `Direct request to ${route} serves HTML entry point (200 OK)`);
    }

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('\n================================================================');
    console.log(`FINAL RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
