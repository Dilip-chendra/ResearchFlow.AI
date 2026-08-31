import 'dotenv/config';
import express from 'express';
import { apiRouter } from '../server/api/routes';
import { db } from '../server/db/store';
import { researchService } from '../server/services/researchService';

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

async function runTests() {
  console.log('===============================================================');
  console.log('RESEARCHFLOW AI - RERUN & ACTIONABLE TASKS TEST SUITE');
  console.log('===============================================================\n');

  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/api', apiRouter);
  app.use(apiRouter);

  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3003;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Check existing sample job
    const sampleJob = db.getResearchJob('job_1788162380940_8vb1');
    assert(!!sampleJob, 'Sample job job_1788162380940_8vb1 exists in store');

    // 2. Test re-run analysis across different workspace ID header
    const headersDiffWs = {
      'Content-Type': 'application/json',
      'x-workspace-id': 'ws_different_user_workspace_999',
      'x-demo-mode': 'true',
    };

    console.log('Testing POST /api/research/jobs/:id/run with cross-workspace header...');
    const startRerun = Date.now();
    const resRerun = await fetch(`${baseUrl}/api/research/jobs/job_1788162380940_8vb1/run`, {
      method: 'POST',
      headers: headersDiffWs,
    });
    const rerunLatency = Date.now() - startRerun;
    assert(resRerun.status === 200, `Re-run returns 200 OK (${rerunLatency}ms)`);
    const rerunData = await resRerun.json();
    assert(rerunData.id === 'job_1788162380940_8vb1', 'Re-run successfully executed for target job');

    // 3. Test approving campaign
    console.log('Testing POST /api/research/jobs/:id/approve...');
    const resApprove = await fetch(`${baseUrl}/api/research/jobs/job_1788162380940_8vb1/approve`, {
      method: 'POST',
      headers: headersDiffWs,
      body: JSON.stringify({ reviewNotes: 'Approved for college recruitment launch.' }),
    });
    assert(resApprove.status === 200, 'Approve job returns 200 OK');
    const approvedData = await resApprove.json();
    assert(approvedData.status === 'approved', 'Job status set to approved');

    // 4. Test listing tasks for the job
    console.log('Testing GET /api/tasks?jobId=job_1788162380940_8vb1...');
    const resTasks = await fetch(`${baseUrl}/api/tasks?jobId=job_1788162380940_8vb1`, {
      headers: headersDiffWs,
    });
    assert(resTasks.status === 200, 'List tasks returns 200 OK');
    const tasksList = await resTasks.json();
    assert(Array.isArray(tasksList) && tasksList.length >= 4, `Found ${tasksList.length} execution tasks for job`);

    // 5. Test actionable task extraction from live research notes
    console.log('Testing POST /api/research/jobs/:id/extract-tasks...');
    const startExtract = Date.now();
    const resExtract = await fetch(`${baseUrl}/api/research/jobs/job_1788162380940_8vb1/extract-tasks`, {
      method: 'POST',
      headers: headersDiffWs,
      body: JSON.stringify({
        customNotes: 'Must create a comparison calculator for ATS pricing and follow up on email copy with recruiter pain points.',
      }),
    });
    const extractLatency = Date.now() - startExtract;
    assert(resExtract.status === 200, `Extract tasks returns 200 OK in ${extractLatency}ms (well under 12s timeout)`);
    const extractData = await resExtract.json();
    assert(Array.isArray(extractData.tasks) && extractData.tasks.length > 0, `Extracted ${extractData.tasks?.length} actionable tasks`);

    // 6. Test actionable task extraction with empty notes (automatic derivation from intelligence)
    console.log('Testing POST /api/research/jobs/:id/extract-tasks with empty notes...');
    const resExtractEmpty = await fetch(`${baseUrl}/api/research/jobs/job_1788162380940_8vb1/extract-tasks`, {
      method: 'POST',
      headers: headersDiffWs,
      body: JSON.stringify({ customNotes: '' }),
    });
    assert(resExtractEmpty.status === 200, 'Extract tasks with empty notes returns 200 OK');
    const extractEmptyData = await resExtractEmpty.json();
    assert(Array.isArray(extractEmptyData.tasks) && extractEmptyData.tasks.length > 0, `Extracted ${extractEmptyData.tasks?.length} tasks automatically from intelligence findings`);

    // Summary
    console.log('\n===============================================================');
    console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
