import 'dotenv/config';

async function testResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set!');
    process.exit(1);
  }

  console.log('Testing Resend API connection with key:', apiKey.slice(0, 8) + '...');
  try {
    const res = await fetch('https://api.resend.com/api-keys', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    console.log('Resend HTTP status:', res.status);
    const data = await res.json();
    console.log('Resend response:', data);
  } catch (err: any) {
    console.error('Resend test error:', err.message);
  }
}

testResend();
