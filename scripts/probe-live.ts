import fetch from 'node-fetch';

const BASE_URL = 'https://research-flow-ai-nine.vercel.app';

async function runLiveProbes() {
  console.log(`\n======================================================`);
  console.log(`RESEARCHFLOW AI — LIVE VERCEL PRODUCTION VERIFICATION`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let allPassed = true;

  // 1. Health check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data: any = await res.json();
    if (res.status === 200 && data.status === 'healthy') {
      console.log(`[PASS] 1. GET /api/health -> HTTP 200 (platform: ${data.platform}, app: ${data.app})`);
    } else {
      console.error(`[FAIL] 1. GET /api/health -> HTTP ${res.status}`, data);
      allPassed = false;
    }
  } catch (err: any) {
    console.error(`[FAIL] 1. GET /api/health -> ${err.message}`);
    allPassed = false;
  }

  // 2. Auth Login with demo credentials
  let token = '';
  let workspaceId = 'ws_demo_sandbox';
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'founder@researchflow.ai',
        password: 'DemoPassword123!',
      }),
    });
    const data: any = await res.json();
    if (res.status === 200 && data.token) {
      token = data.token;
      workspaceId = data.workspace?.id || workspaceId;
      console.log(`[PASS] 2. POST /api/auth/login -> HTTP 200 (User: ${data.user?.name}, Workspace: ${workspaceId})`);
    } else {
      console.error(`[FAIL] 2. POST /api/auth/login -> HTTP ${res.status}`, data);
      allPassed = false;
    }
  } catch (err: any) {
    console.error(`[FAIL] 2. POST /api/auth/login -> ${err.message}`);
    allPassed = false;
  }

  const authHeaders: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-workspace-id': workspaceId,
  };

  // 3. Auth Me
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, { headers: authHeaders });
    const data: any = await res.json();
    if (res.status === 200 && data.user?.email === 'founder@researchflow.ai') {
      console.log(`[PASS] 3. GET /api/auth/me -> HTTP 200 (Email verified: ${data.user?.email})`);
    } else {
      console.error(`[FAIL] 3. GET /api/auth/me -> HTTP ${res.status}`, data);
      allPassed = false;
    }
  } catch (err: any) {
    console.error(`[FAIL] 3. GET /api/auth/me -> ${err.message}`);
    allPassed = false;
  }

  // 4. Workspaces list
  try {
    const res = await fetch(`${BASE_URL}/api/workspaces`, { headers: authHeaders });
    const data: any = await res.json();
    if (res.status === 200 && Array.isArray(data) && data.length > 0) {
      console.log(`[PASS] 4. GET /api/workspaces -> HTTP 200 (${data.length} workspace(s) available)`);
    } else {
      console.error(`[FAIL] 4. GET /api/workspaces -> HTTP ${res.status}`, data);
      allPassed = false;
    }
  } catch (err: any) {
    console.error(`[FAIL] 4. GET /api/workspaces -> ${err.message}`);
    allPassed = false;
  }

  // 5. War Room Overview
  try {
    const res = await fetch(`${BASE_URL}/api/war-room/overview`, { headers: authHeaders });
    const data: any = await res.json();
    if (res.status === 200 && (data.marketModel || data.competitors)) {
      console.log(`[PASS] 5. GET /api/war-room/overview -> HTTP 200 (${data.competitors?.length || 0} competitors, category: ${data.marketModel?.category || 'General'})`);
    } else {
      console.error(`[FAIL] 5. GET /api/war-room/overview -> HTTP ${res.status}`, data);
      allPassed = false;
    }
  } catch (err: any) {
    console.error(`[FAIL] 5. GET /api/war-room/overview -> ${err.message}`);
    allPassed = false;
  }

  // 6. Research Jobs list
  try {
    const res = await fetch(`${BASE_URL}/api/research/jobs`, { headers: authHeaders });
    const data: any = await res.json();
    if (res.status === 200 && Array.isArray(data)) {
      console.log(`[PASS] 6. GET /api/research/jobs -> HTTP 200 (${data.length} research job(s) found)`);
    } else {
      console.error(`[FAIL] 6. GET /api/research/jobs -> HTTP ${res.status}`, data);
      allPassed = false;
    }
  } catch (err: any) {
    console.error(`[FAIL] 6. GET /api/research/jobs -> ${err.message}`);
    allPassed = false;
  }

  // 7. Execution Tasks
  try {
    const res = await fetch(`${BASE_URL}/api/tasks`, { headers: authHeaders });
    const data: any = await res.json();
    if (res.status === 200 && Array.isArray(data)) {
      console.log(`[PASS] 7. GET /api/tasks -> HTTP 200 (${data.length} task(s) found)`);
    } else {
      console.error(`[FAIL] 7. GET /api/tasks -> HTTP ${res.status}`, data);
      allPassed = false;
    }
  } catch (err: any) {
    console.error(`[FAIL] 7. GET /api/tasks -> ${err.message}`);
    allPassed = false;
  }

  // 8. Create Research Job
  try {
    const res = await fetch(`${BASE_URL}/api/research/jobs`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        businessName: 'Live Audit Probe AI',
        businessDescription: 'Real-time verification of deployed intelligence system',
        campaignObjective: 'Validate end-to-end cloud persistence and AI workflows',
        targetAudience: 'Enterprise Technology Officers',
        competitorUrls: ['https://example.com/competitor'],
        isDemo: true,
      }),
    });
    const data: any = await res.json();
    if ((res.status === 200 || res.status === 201) && data.id) {
      console.log(`[PASS] 8. POST /api/research/jobs -> HTTP ${res.status} (Created Job: ${data.id}, status: ${data.status})`);
    } else {
      console.error(`[FAIL] 8. POST /api/research/jobs -> HTTP ${res.status}`, data);
      allPassed = false;
    }
  } catch (err: any) {
    console.error(`[FAIL] 8. POST /api/research/jobs -> ${err.message}`);
    allPassed = false;
  }

  console.log(`\n======================================================`);
  if (allPassed) {
    console.log(`PROD AUDIT RESULT: ALL LIVE ENDPOINTS FUNCTIONING PERFECTLY!`);
  } else {
    console.log(`PROD AUDIT RESULT: SOME CHECKS FAILED`);
  }
  console.log(`======================================================\n`);
}

runLiveProbes();
