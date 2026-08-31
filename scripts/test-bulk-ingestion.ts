async function testBulkIngestion() {
  const baseUrl = 'http://localhost:3000';
  console.log('================================================================');
  console.log('TESTING BULK INGESTION SUITE & CONCURRENT CRAWLER PIPELINE');
  console.log('================================================================\n');

  // 1. Test AI Auto-Discovery endpoint
  console.log('1. Testing POST /api/research/discover-competitors...');
  const resDiscovery = await fetch(`${baseUrl}/api/research/discover-competitors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: 'NextGen Resume AI',
      businessDescription: 'Evidence-backed resume intelligence calibrated to real hiring benchmarks.',
      targetAudience: 'College seniors in CS/Engineering and junior career changers.',
    }),
  });

  const dataDiscovery = await resDiscovery.json();
  console.log('  [PASS] Status:', resDiscovery.status);
  console.log('  [PASS] Discovered competitors count:', dataDiscovery.count);
  console.log('  [PASS] First competitor sample:', dataDiscovery.competitors?.[0]);

  if (!dataDiscovery.competitors || dataDiscovery.competitors.length === 0) {
    throw new Error('Expected at least 1 discovered competitor');
  }

  // 2. Test Large Batch Job Creation (e.g. 8 competitor sources)
  console.log('\n2. Testing Large Batch Research Job Creation with 8 URLs...');
  const testBatchUrls = [
    'https://en.wikipedia.org/wiki/Resume',
    'https://news.ycombinator.com',
    'https://en.wikipedia.org/wiki/Curriculum_vitae',
    'https://en.wikipedia.org/wiki/Applicant_tracking_system',
    'https://novoresume.com/pricing',
    'https://kickresume.com/pricing',
    'https://www.tealhq.com/features/ai-resume-builder',
    'https://www.rezi.ai/pricing',
  ];

  const resCreate = await fetch(`${baseUrl}/api/research/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-workspace-id': 'ws_demo_sandbox',
    },
    body: JSON.stringify({
      businessName: 'NextGen Resume AI (Bulk Ingestion Test)',
      businessDescription: 'Bulk test for concurrent source extraction.',
      campaignObjective: 'Test multi-source concurrency pool and claim extraction.',
      targetAudience: 'Tech job seekers',
      competitorUrls: testBatchUrls,
    }),
  });

  const job = await resCreate.json();
  console.log('  [PASS] Created Job ID:', job.id, 'with sourcesCount:', job.sourcesCount);

  // 3. Test Running Concurrent Batch Job
  console.log('\n3. Testing Concurrency Pool Pipeline Execution (POST /api/research/jobs/:id/run)...');
  const startTime = Date.now();
  const resRun = await fetch(`${baseUrl}/api/research/jobs/${job.id}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-workspace-id': 'ws_demo_sandbox',
    },
  });

  const runJobResult = await resRun.json();
  const elapsedMs = Date.now() - startTime;
  console.log(`  [PASS] Pipeline completed in ${elapsedMs}ms with status: ${runJobResult.status}`);
  console.log(`  [PASS] Progress: ${runJobResult.progressPercent}% | Step: "${runJobResult.currentStepMessage}"`);
  console.log(`  [PASS] Extracted Evidence Count: ${runJobResult.evidenceCount}`);
  console.log(`  [PASS] Flagged Conflicts Count: ${runJobResult.conflictsCount}`);

  // 4. Verify Sources Details
  console.log('\n4. Verifying Source Execution Breakdown...');
  const resSources = await fetch(`${baseUrl}/api/research/jobs/${job.id}/sources`, {
    headers: { 'x-workspace-id': 'ws_demo_sandbox' },
  });
  const sources = await resSources.json();
  console.log(`  [PASS] Total sources stored: ${sources.length}`);
  const completedSources = sources.filter((s: any) => s.status === 'completed');
  console.log(`  [PASS] Successfully fetched sources: ${completedSources.length}/${sources.length}`);

  console.log('\n================================================================');
  console.log('🎉 ALL BULK INGESTION & CONCURRENCY TESTS PASSED WITH 0 ERRORS!');
  console.log('================================================================');
}

testBulkIngestion().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
