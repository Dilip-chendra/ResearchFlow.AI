import 'dotenv/config';
import express from 'express';
import { apiRouter } from '../server/api/routes';
import { db } from '../server/db/store';

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

async function runHttpTests() {
  console.log('===============================================================');
  console.log('RESEARCHFLOW AI - HTTP PROFILE ENDPOINTS INTEGRATION SUITE');
  console.log('===============================================================\n');

  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/api', apiRouter);
  app.use(apiRouter);

  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3001;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Create registered user & token
    const testEmail = `http_test_${Date.now()}@example.com`;
    const reg = db.registerUser({
      email: testEmail,
      name: 'Initial Name',
      password: 'password123',
    });
    const token = reg.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // 2. Test GET /api/auth/profile
    const resGet1 = await fetch(`${baseUrl}/api/auth/profile`, { headers: authHeaders });
    assert(resGet1.status === 200, 'GET /api/auth/profile returns 200 OK');
    const dataGet1 = await resGet1.json();
    assert(dataGet1.user.name === 'Initial Name', 'GET /api/auth/profile returns initial user name');

    // 3. Test GET /profile (alias)
    const resGet2 = await fetch(`${baseUrl}/profile`, { headers: authHeaders });
    assert(resGet2.status === 200, 'GET /profile (root alias) returns 200 OK');

    // 4. Test PUT /api/auth/profile with Full Name & Display Name (Dilip Chendra / dilip-ai)
    const resPut1 = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Dilip Chendra',
        displayName: 'dilip-ai',
        avatarType: 'INITIALS',
      }),
    });
    assert(resPut1.status === 200, 'PUT /api/auth/profile returns 200 OK');
    const dataPut1 = await resPut1.json();
    assert(dataPut1.user.name === 'Dilip Chendra', 'PUT /api/auth/profile saved name Dilip Chendra');
    assert(dataPut1.user.displayName === 'dilip-ai', 'PUT /api/auth/profile saved displayName dilip-ai');
    assert(dataPut1.user.avatarValue === 'DC', 'PUT /api/auth/profile computed DC initials');

    // 5. Test PATCH /api/auth/profile with Emoji Avatar (🚀)
    const resPatch = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        avatarType: 'EMOJI',
        avatarValue: '🚀',
      }),
    });
    assert(resPatch.status === 200, 'PATCH /api/auth/profile returns 200 OK');
    const dataPatch = await resPatch.json();
    assert(dataPatch.user.avatarType === 'EMOJI', 'PATCH /api/auth/profile set avatarType EMOJI');
    assert(dataPatch.user.avatarValue === '🚀', 'PATCH /api/auth/profile set avatarValue 🚀');

    // 6. Test POST /api/auth/profile/avatar (Custom Photo Upload)
    const testPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const resAvatar = await fetch(`${baseUrl}/api/auth/profile/avatar`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        imageBase64: testPhoto,
        mimeType: 'image/png',
      }),
    });
    assert(resAvatar.status === 200, 'POST /api/auth/profile/avatar returns 200 OK');
    const dataAvatar = await resAvatar.json();
    assert(dataAvatar.user.avatarType === 'IMAGE', 'Avatar upload set avatarType to IMAGE');
    assert(dataAvatar.user.profileImageUrl === testPhoto, 'Avatar upload saved profileImageUrl');

    // 7. Test DELETE /api/auth/profile/avatar (Custom Photo Removal)
    const resDeleteAvatar = await fetch(`${baseUrl}/api/auth/profile/avatar`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(resDeleteAvatar.status === 200, 'DELETE /api/auth/profile/avatar returns 200 OK');
    const dataDeleteAvatar = await resDeleteAvatar.json();
    assert(dataDeleteAvatar.user.avatarType === 'INITIALS', 'DELETE avatar reset avatarType to INITIALS');
    assert(dataDeleteAvatar.user.profileImageUrl === '', 'DELETE avatar cleared profileImageUrl');
    assert(dataDeleteAvatar.user.avatarValue === 'DC', 'DELETE avatar restored DC initials');

    // 8. Test PUT /profile (root path alias compatibility)
    const resPutRoot = await fetch(`${baseUrl}/profile`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        displayName: 'dilip-final',
      }),
    });
    assert(resPutRoot.status === 200, 'PUT /profile (root alias) returns 200 OK');

    // 9. Test Unauthenticated request in demo/sandbox environment
    const resDemo = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-demo-mode': 'true',
      },
      body: JSON.stringify({
        name: 'Demo Founder',
      }),
    });
    assert(resDemo.status === 200, 'Demo mode request returns 200 OK without 404');

    // 10. Test Input Validation (Empty name)
    const resInvalid = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: '',
      }),
    });
    assert(resInvalid.status === 400, 'Empty name returns 400 Bad Request');

    // Summary
    console.log('\n===============================================================');
    console.log(`HTTP TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runHttpTests().catch(err => {
  console.error('Fatal HTTP test error:', err);
  process.exit(1);
});
