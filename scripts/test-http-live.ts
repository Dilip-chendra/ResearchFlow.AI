async function testHttpLive() {
  const baseUrl = 'http://localhost:3000';

  console.log('1. Logging in as dilip.madagari@gmail.com...');
  // We can authenticate or login
  const resLogin = await fetch(`${baseUrl}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dilip.madagari@gmail.com', name: 'Dilip' }),
  });
  const dataLogin = await resLogin.json();
  const token = dataLogin.token;
  console.log('Login token received. Current user name:', dataLogin.user.name);

  console.log('2. Updating profile to Dilipchendra with custom photo...');
  const fakePhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const resUpdate = await fetch(`${baseUrl}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'Dilipchendra',
      displayName: 'Dilipchendra',
      avatarType: 'IMAGE',
      avatarValue: fakePhoto,
      profileImageUrl: fakePhoto,
    }),
  });
  const dataUpdate = await resUpdate.json();
  console.log('Update result name:', dataUpdate.user?.name, 'avatarType:', dataUpdate.user?.avatarType);

  console.log('3. Simulating page refresh (GET /api/auth/me)...');
  const resMe = await fetch(`${baseUrl}/api/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const dataMe = await resMe.json();
  console.log('GET /api/auth/me user name:', dataMe.user?.name, 'avatarType:', dataMe.user?.avatarType);

  if (dataMe.user?.name === 'Dilipchendra' && dataMe.user?.avatarType === 'IMAGE') {
    console.log('🎉 LIVE REFRESH PERSISTENCE TEST PASSED: Name and Photo Avatar Preserved!');
  } else {
    console.error('❌ FAILED: Profile reverted after refresh!');
    process.exit(1);
  }
}

testHttpLive();
