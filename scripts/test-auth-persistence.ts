import { PersistentDatabaseStore } from '../server/db/store';

console.log('====================================================');
console.log('TEST SUITE: AUTH PERSISTENCE, COLD-START & RESET');
console.log('====================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    testsFailed++;
  }
}

async function runTests() {
  // Test 1: User Registration
  const db1 = new PersistentDatabaseStore();
  const testEmail = `founder_${Date.now()}@growthflow.ai`;
  const rawPassword = 'SecureFounderPassword2026!';
  const testName = 'Alex Founder';

  console.log(`1. Testing User Registration for: ${testEmail}`);
  const regResult = db1.registerUser({
    email: testEmail,
    password: rawPassword,
    name: testName,
  });

  assert(Boolean(regResult.user?.id), 'User registration returns valid user ID');
  assert(regResult.user?.email.toLowerCase() === testEmail.toLowerCase(), 'User email matches registered email');
  assert(Boolean(regResult.token), 'Registration generates valid session token');

  // Test 2: Authentication on same instance
  console.log('\n2. Testing Authentication on initial store instance');
  const auth1 = db1.authenticateUser(testEmail, rawPassword);
  assert(Boolean(auth1?.user), 'Authentication succeeds with valid credentials');
  assert(auth1?.user?.email.toLowerCase() === testEmail.toLowerCase(), 'Authenticated user matches registered email');

  const authBadPass = db1.authenticateUser(testEmail, 'WrongPassword123');
  assert(authBadPass === null, 'Authentication rejects incorrect password');

  // Test 3: Case-insensitive & trimmed login
  console.log('\n3. Testing Case & Whitespace Normalization');
  const authCase = db1.authenticateUser(`  ${testEmail.toUpperCase()}  `, rawPassword);
  assert(Boolean(authCase?.user), 'Authentication succeeds with uppercase and padded email');

  // Test 4: Cold-start simulation (New store instance loading from disk)
  console.log('\n4. Testing Cold-Start Persistence across new store instance');
  const db2 = new PersistentDatabaseStore();
  const authCold = db2.authenticateUser(testEmail, rawPassword);
  assert(Boolean(authCold?.user), 'Cold-start store instance loads registered user and authenticates successfully');
  assert(authCold?.user?.name === testName, 'Cold-start user preserves full profile metadata');

  // Test 5: Re-registration idempotency with same password
  console.log('\n5. Testing Re-registration with same password (Client recovery flow)');
  const reReg = db2.registerUser({
    email: testEmail,
    password: rawPassword,
    name: testName,
  });
  assert(Boolean(reReg.user), 'Re-registration with matching password recovers cleanly without crashing');

  // Test 6: Password Reset Workflow
  console.log('\n6. Testing Password Reset Token Generation & Execution');
  const resetToken = db2.createPasswordResetToken(testEmail);
  assert(typeof resetToken === 'string' && resetToken.length > 10, 'createPasswordResetToken generates non-empty token string');

  const newPassword = 'NewlyUpdatedPassword2026!#';
  const resetSuccess = db2.resetPasswordWithToken(resetToken!, newPassword);
  assert(resetSuccess === true, 'resetPasswordWithToken returns true for valid token');

  // Old password should fail now
  const oldPassAuth = db2.authenticateUser(testEmail, rawPassword);
  assert(oldPassAuth === null, 'Old password is invalidated after reset');

  // New password should succeed
  const newPassAuth = db2.authenticateUser(testEmail, newPassword);
  assert(Boolean(newPassAuth?.user), 'New password authenticates successfully on db2');

  // Test 7: Cold-start simulation after password reset
  console.log('\n7. Testing Cold-Start Persistence after Password Reset');
  const db3 = new PersistentDatabaseStore();
  const authDb3 = db3.authenticateUser(testEmail, newPassword);
  assert(Boolean(authDb3?.user), 'New store instance db3 loads updated password hash and authenticates successfully');

  // Test 8: Password Reset for Unseen Email (Auto-Recovery Placeholder)
  console.log('\n8. Testing Password Reset for unseen email placeholder');
  const unseenEmail = `unseen_${Date.now()}@newfounder.ai`;
  const unseenToken = db3.createPasswordResetToken(unseenEmail);
  assert(typeof unseenToken === 'string' && unseenToken.length > 10, 'Unseen email generates valid reset token');

  const unseenReset = db3.resetPasswordWithToken(unseenToken!, 'BrandNewPass2026!');
  assert(unseenReset === true, 'Resetting unseen email placeholder succeeds');

  const unseenLogin = db3.authenticateUser(unseenEmail, 'BrandNewPass2026!');
  assert(Boolean(unseenLogin?.user), 'Logging into newly reset placeholder succeeds');

  console.log('\n====================================================');
  console.log(`SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('====================================================');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
