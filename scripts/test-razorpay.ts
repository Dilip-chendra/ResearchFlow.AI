import 'dotenv/config';

async function testRazorpay() {
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  console.log('Testing Razorpay credentials...');
  console.log('Key ID:', key ? `${key.substring(0, 12)}...` : 'Not set');

  if (!key || !secret) {
    console.error('Razorpay credentials missing from .env');
    return;
  }

  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  try {
    const res = await fetch('https://api.razorpay.com/v1/orders?count=1', {
      headers: { Authorization: `Basic ${auth}` },
    });
    console.log('Razorpay HTTP Status:', res.status);
    const data = await res.json();
    if (res.status === 200) {
      console.log('SUCCESS: Razorpay live credentials verified! Entity:', data.entity);
    } else {
      console.log('Razorpay response error:', data.error);
    }
  } catch (err: any) {
    console.error('Network error testing Razorpay:', err.message);
  }
}

testRazorpay();
