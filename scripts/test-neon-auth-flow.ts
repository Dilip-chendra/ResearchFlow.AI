import 'dotenv/config';
import { neonAdapter } from '../server/db/neonAdapter';
import { db } from '../server/db/store';
import { emailService } from '../server/services/emailService';

async function runTest() {
  console.log('--- STARTING NEON AUTH & PERSISTENCE VERIFICATION ---');

  if (!neonAdapter.isAvailable()) {
    console.error('FAIL: Neon database adapter is not available. Check DATABASE_URL in .env');
    process.exit(1);
  }

  // 1. Ensure Schema
  console.log('1. Ensuring Neon database schema...');
  await neonAdapter.ensureSchema();
  console.log('  Schema verified.');

  // 2. Test User Registration
  const testEmail = `test_founder_${Date.now()}@testresearchflow.ai`;
  const initialPassword = 'InitialSecretPass123!';
  const updatedPassword = 'NewSecretPass456!';
  const founderName = 'Dr. Jane Founder';

  console.log(`2. Registering user ${testEmail}...`);
  const regResult = await db.registerUserAsync({
    email: testEmail,
    password: initialPassword,
    name: founderName,
  });

  if (!regResult.user || !regResult.token) {
    console.error('FAIL: registerUserAsync failed to return user or token');
    process.exit(1);
  }
  console.log('  User registered successfully. ID:', regResult.user.id);

  // 3. Test Direct Lookup in Neon
  console.log('3. Verifying direct record in Neon Postgres...');
  const fromNeon = await neonAdapter.getUserAccountByEmail(testEmail);
  if (!fromNeon || !fromNeon.account || !fromNeon.user) {
    console.error('FAIL: User was not found in Neon database');
    process.exit(1);
  }
  console.log('  Record confirmed in Neon Postgres:', fromNeon.user.email);

  // 4. Test Normal Authentication
  console.log('4. Authenticating with correct password...');
  const auth1 = await db.authenticateUserAsync(testEmail, initialPassword);
  if (!auth1 || auth1.user.email !== testEmail) {
    console.error('FAIL: Normal authenticateUserAsync failed');
    process.exit(1);
  }
  console.log('  Authentication succeeded.');

  // 5. Test Invalid Password
  console.log('5. Testing wrong password rejection...');
  const authWrong = await db.authenticateUserAsync(testEmail, 'WrongPassword999!');
  if (authWrong !== null) {
    console.error('FAIL: authenticateUserAsync should have rejected wrong password');
    process.exit(1);
  }
  console.log('  Wrong password properly rejected.');

  // 6. Test Cold-Start Container Simulation (Clear in-memory Maps)
  console.log('6. Simulating cold-start serverless container by evicting memory cache...');
  (db as any).userAccounts.delete(testEmail.toLowerCase());
  (db as any).users.delete(regResult.user.id);

  // Authenticate should now fall back to Neon, reload account into memory, and succeed!
  const coldAuth = await db.authenticateUserAsync(testEmail, initialPassword);
  if (!coldAuth || coldAuth.user.email !== testEmail) {
    console.error('FAIL: Cold-start Neon fallback authentication failed');
    process.exit(1);
  }
  console.log('  Cold-start container simulation passed! User rehydrated from Neon.');

  // 7. Test Password Reset Flow with Neon
  console.log('7. Testing password reset token generation...');
  const resetToken = await db.createPasswordResetTokenAsync(testEmail);
  if (!resetToken) {
    console.error('FAIL: Failed to generate password reset token');
    process.exit(1);
  }
  console.log('  Reset token generated:', resetToken);

  // Verify token saved in Neon
  const tokenAccount = await neonAdapter.getAccountByResetToken(resetToken);
  if (!tokenAccount || tokenAccount.account?.email !== testEmail.toLowerCase()) {
    console.error('FAIL: Reset token was not saved to Neon');
    process.exit(1);
  }
  console.log('  Reset token confirmed in Neon Postgres.');

  // Evict from memory again to test cold-start reset
  (db as any).userAccounts.delete(testEmail.toLowerCase());
  console.log('8. Resetting password with token (cold-start test)...');
  const resetResult = await db.resetPasswordWithTokenAsync(resetToken, updatedPassword);
  if (!resetResult) {
    console.error('FAIL: resetPasswordWithTokenAsync failed');
    process.exit(1);
  }
  console.log('  Password reset succeeded.');

  // Verify old password now fails
  console.log('9. Verifying old password fails and new password succeeds...');
  const oldPassAuth = await db.authenticateUserAsync(testEmail, initialPassword);
  if (oldPassAuth !== null) {
    console.error('FAIL: Old password still accepted after reset');
    process.exit(1);
  }
  const newPassAuth = await db.authenticateUserAsync(testEmail, updatedPassword);
  if (!newPassAuth) {
    console.error('FAIL: New password rejected after reset');
    process.exit(1);
  }
  console.log('  Old password rejected, new password verified in Neon!');

  // 10. Check Email Service Configuration
  console.log('10. Checking Resend Email Service...');
  if (emailService.isConfigured()) {
    console.log('  Resend email service is configured.');
  } else {
    console.log('  Resend email service operates in fallback mode.');
  }

  console.log('\n======================================================');
  console.log('ALL NEON & AUTHENTICATION TESTS PASSED SUCCESSFULLY! 100%');
  console.log('======================================================\n');
}

runTest().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
