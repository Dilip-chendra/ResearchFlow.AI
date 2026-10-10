import { db } from '../server/db/store';

async function testFullAuthLifecycle() {
  console.log('========================================================');
  console.log('LOCAL STORE AUTH LIFECYCLE VERIFICATION');
  console.log('========================================================');

  const testEmail = `user_${Date.now()}@growthlab.io`;
  const testPassword = 'InitialSecretPassword123!';
  const newPassword = 'ResetSecretPassword456!';
  const testName = 'Jane Doe';

  // 1. Registration
  console.log('\n1. Registering user...');
  const regResult = db.registerUser({
    email: testEmail,
    password: testPassword,
    name: testName,
  });
  console.log('Registered User ID:', regResult.user.id);
  console.log('Registration Session Token:', regResult.token.slice(0, 15) + '...');

  // 2. Validate Session immediately
  const sessionUser = db.getSessionUser(regResult.token);
  console.log('Session User lookup immediately:', sessionUser ? sessionUser.email : 'FAILED');
  if (!sessionUser) throw new Error('Session user lookup failed immediately after registration');

  // 3. Invalidate Session (Logout)
  console.log('\n2. Logging out (invalidating session)...');
  const loggedOut = db.invalidateSession(regResult.token);
  console.log('Session invalidated:', loggedOut);
  const afterLogoutUser = db.getSessionUser(regResult.token);
  console.log('Session User lookup after logout (should be null):', afterLogoutUser);
  if (afterLogoutUser !== null) throw new Error('Session was not invalidated on logout');

  // 4. Authenticate with correct credentials
  console.log('\n3. Logging in with registered credentials...');
  const loginResult = db.authenticateUser(testEmail, testPassword);
  console.log('Login result:', loginResult ? `SUCCESS (${loginResult.user.email})` : 'FAILED');
  if (!loginResult) throw new Error('Authentication failed with correct credentials');

  // 5. Authenticate with wrong password
  console.log('\n4. Attempting login with wrong password...');
  const wrongLogin = db.authenticateUser(testEmail, 'WrongPassword!');
  console.log('Wrong password rejected:', wrongLogin === null);
  if (wrongLogin !== null) throw new Error('Wrong password was accepted');

  // 6. Forgot Password token generation
  console.log('\n5. Requesting forgot-password reset token...');
  const resetToken = db.createPasswordResetToken(testEmail);
  console.log('Generated reset token:', resetToken ? resetToken.slice(0, 15) + '...' : 'FAILED');
  if (!resetToken) throw new Error('Failed to generate password reset token');

  // 7. Reset password with token
  console.log('\n6. Resetting password with token...');
  const resetOk = db.resetPasswordWithToken(resetToken, newPassword);
  console.log('Password reset result:', resetOk);
  if (!resetOk) throw new Error('resetPasswordWithToken returned false');

  // 8. Login with OLD password (must fail)
  console.log('\n7. Attempting login with OLD password...');
  const oldLogin = db.authenticateUser(testEmail, testPassword);
  console.log('Old password rejected:', oldLogin === null);
  if (oldLogin !== null) throw new Error('Old password was still accepted after reset');

  // 9. Login with NEW password (must succeed)
  console.log('\n8. Attempting login with NEW password...');
  const newLogin = db.authenticateUser(testEmail, newPassword);
  console.log('New password login result:', newLogin ? `SUCCESS (${newLogin.user.email})` : 'FAILED');
  if (!newLogin) throw new Error('Authentication failed with new password');

  // 10. Reuse token (must fail)
  console.log('\n9. Attempting to reuse already consumed reset token...');
  const reuseToken = db.resetPasswordWithToken(resetToken, 'AnotherPassword789!');
  console.log('Token reuse rejected:', !reuseToken);
  if (reuseToken) throw new Error('Consumed reset token was accepted again');

  console.log('\n========================================================');
  console.log('ALL LOCAL STORE TESTS PASSED PERFECTLY');
  console.log('========================================================');
}

testFullAuthLifecycle().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
