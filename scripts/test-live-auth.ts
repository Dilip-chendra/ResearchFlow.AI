async function testLive() {
  console.log('Testing live production forgot-password API...');
  const res = await fetch('https://research-flow-ai-nine.vercel.app/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_live_verify@growthflow.ai' }),
  });
  console.log('HTTP Status:', res.status);
  const data = await res.json();
  console.log('Response:', data);
}

testLive();
