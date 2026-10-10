import { validateSafeUrl } from '../server/crawler/ssrfGuard';
import { categorizeUrlPath } from '../server/crawler/sitemapParser';
import { connectorRegistry } from '../server/connectors/connectorRegistry';
import { db } from '../server/db/store';
import { companyIntelligenceService } from '../server/services/companyIntelligenceService';

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 RUNNING DEEP COMPANY INTELLIGENCE & DIGITAL FOOTPRINT TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` (${detail})` : ''}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST SUITE 1: SSRF Guard Security Checks
  // -------------------------------------------------------------
  console.log('--- 1. Enterprise SSRF Guard Verification ---');
  
  const ssrf1 = await validateSafeUrl('http://127.0.0.1:8080/admin');
  assert(!ssrf1.isValid, 'Blocks loopback IPv4 127.0.0.1');

  const ssrf2 = await validateSafeUrl('http://169.254.169.254/latest/meta-data');
  assert(!ssrf2.isValid, 'Blocks AWS/GCP cloud metadata IP 169.254.169.254');

  const ssrf3 = await validateSafeUrl('http://10.0.0.5/internal/dashboard');
  assert(!ssrf3.isValid, 'Blocks RFC 1918 Class A private IP (10.0.0.0/8)');

  const ssrf4 = await validateSafeUrl('http://192.168.1.1/router');
  assert(!ssrf4.isValid, 'Blocks RFC 1918 Class C private IP (192.168.0.0/16)');

  const ssrf5 = await validateSafeUrl('file:///etc/passwd');
  assert(!ssrf5.isValid, 'Blocks non-HTTP/HTTPS protocol (file://)');

  const ssrf6 = await validateSafeUrl('https://nextgenresume.ai/features');
  assert(ssrf6.isValid, 'Permits valid public HTTPS website');

  // -------------------------------------------------------------
  // TEST SUITE 2: Sitemap & URL Path Categorization
  // -------------------------------------------------------------
  console.log('\n--- 2. URL Path Categorization ---');

  assert(categorizeUrlPath('https://acme.com/pricing').category === 'PRICING_PAGE', 'Classifies /pricing as PRICING_PAGE');
  assert(categorizeUrlPath('https://acme.com/about-us').category === 'ABOUT_PAGE', 'Classifies /about-us as ABOUT_PAGE');
  assert(categorizeUrlPath('https://acme.com/docs/api').category === 'DOCS_HELP', 'Classifies /docs/api as DOCS_HELP');
  assert(categorizeUrlPath('https://acme.com/customers/stories').category === 'CASE_STUDIES', 'Classifies /customers as CASE_STUDIES');
  assert(categorizeUrlPath('https://acme.com/blog/ai-trends').category === 'BLOG_NEWS', 'Classifies /blog as BLOG_NEWS');

  // -------------------------------------------------------------
  // TEST SUITE 3: Connector Registry Scope Disclosure
  // -------------------------------------------------------------
  console.log('\n--- 3. Unified Connector Registry Honest Scopes ---');

  const ghReport = await connectorRegistry.inspect('GITHUB', 'https://github.com/nextgenresume');
  assert(ghReport.connectionStatus === 'CONNECTED', 'GitHub connector returns CONNECTED status');
  assert(ghReport.authStatus === 'NONE', 'GitHub reports public API without requiring private OAuth');

  const liReport = await connectorRegistry.inspect('LINKEDIN_COMPANY', 'https://linkedin.com/company/nextgenresume');
  assert(Boolean(liReport.recommendedAlternative), 'LinkedIn connector discloses OAuth alternative for private data');

  // -------------------------------------------------------------
  // TEST SUITE 4: Storage Persistence & Multi-Tenant Isolation
  // -------------------------------------------------------------
  console.log('\n--- 4. Database Store & Multi-Tenant Isolation ---');

  const testWsA = 'ws_test_tenant_a';
  const testWsB = 'ws_test_tenant_b';

  // Seed Company Profile for Tenant A
  db.saveCompanyProfile({
    id: 'cp_test_a',
    workspaceId: testWsA,
    companyName: 'Tenant Alpha Corp',
    website: 'https://alpha.example.com',
    description: 'Alpha enterprise testing workspace',
    industry: 'Cybersecurity',
    businessModel: 'B2B',
    stage: 'GROWING',
    marketsServed: ['North America'],
    primaryObjective: 'Dominate enterprise identity testing',
    customerSegments: ['CISO', 'Security Architects'],
    profileCompleteness: 90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Verify Tenant A retrieval
  const profileA = db.getCompanyProfile(testWsA);
  assert(profileA?.companyName === 'Tenant Alpha Corp', 'Tenant A company profile successfully persisted');

  // Verify Tenant B isolation (must not see Tenant A data)
  const profileB = db.getCompanyProfile(testWsB);
  assert(profileB === null, 'Tenant B has zero access to Tenant A profile (strict multi-tenant isolation)');

  // -------------------------------------------------------------
  // TEST SUITE 5: Completeness Calculation & Service Logic
  // -------------------------------------------------------------
  console.log('\n--- 5. Company Intelligence Service & Completeness ---');

  const score1 = companyIntelligenceService.calculateCompleteness({});
  assert(score1 === 0, 'Empty profile receives 0% completeness score');

  const score2 = companyIntelligenceService.calculateCompleteness({
    companyName: 'Acme Test',
    website: 'https://acme.test',
    description: 'This is a sufficiently long description that satisfies the length threshold requirement for calculation.',
    industry: 'Enterprise Software',
    businessModel: 'B2B',
    stage: 'GROWING',
    marketsServed: ['Global'],
    primaryObjective: 'Scale to 10M ARR in 24 months with reliable margins',
    customerSegments: ['CTOs', 'VPs of Engineering'],
  });
  assert(score2 === 100, `Fully populated profile receives 100% score (actual: ${score2}%)`);

  // -------------------------------------------------------------
  // TEST SUITE 6: Epistemic Facts & User Truth Corrections
  // -------------------------------------------------------------
  console.log('\n--- 6. Fact Verification & Ground-Truth Corrections ---');

  // Retrieve demo business intelligence profile
  const demoBI = db.getBusinessIntelligenceProfile('ws_demo_sandbox');
  assert(Boolean(demoBI), 'Demo workspace Business Intelligence profile is seeded');
  assert(demoBI!.whatWeKnow.length > 0, 'What We Know dimension has verified facts');
  assert(demoBI!.whatCompanySaysAboutItself.length > 0, 'Company Stated dimension has marketing claims');

  // Apply user correction
  const testFactId = demoBI!.whatCompanySaysAboutItself[0]?.id || 'fact_demo_test';
  const correctedClaim = 'Verified: Interview callback rate improved by measured 2.8x in cohort study.';
  
  const correction = companyIntelligenceService.applyFactCorrection(
    'ws_demo_sandbox',
    testFactId,
    correctedClaim,
    'Alex Chen'
  );

  assert(correction.status === 'ACTIVE', 'UserFactCorrection record is created with ACTIVE status');
  assert(correction.correctedText === correctedClaim, 'Correction matches user input');

  // Check that the profile fact was updated
  const updatedBI = db.getBusinessIntelligenceProfile('ws_demo_sandbox');
  const targetFact = updatedBI?.whatCompanySaysAboutItself.find(f => f.id === testFactId);
  assert(targetFact?.isUserVerified === true, 'Fact is now marked as User Verified (100% confidence)');
  assert(targetFact?.claim === correctedClaim, 'Fact claim reflects verified correction');

  // Verify Audit Trail
  const auditCorrections = db.getUserFactCorrections('ws_demo_sandbox');
  assert(auditCorrections.some(c => c.id === correction.id), 'Correction exists in permanent audit trail');

  console.log('\n================================================================');
  console.log(`🏁 TEST SUITE SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal error during test suite:', err);
  process.exit(1);
});
