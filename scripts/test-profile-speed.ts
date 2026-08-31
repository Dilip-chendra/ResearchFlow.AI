import 'dotenv/config';
import express from 'express';
import { apiRouter } from '../server/api/routes';
import { db } from '../server/db/store';

async function measureSpeed() {
  console.log('===============================================================');
  console.log('RESEARCHFLOW AI - PROFILE UPDATE LATENCY & PERFORMANCE TEST');
  console.log('===============================================================\n');

  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/api', apiRouter);
  app.use(apiRouter);

  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3002;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const reg = db.registerUser({
      email: `speed_test_${Date.now()}@example.com`,
      name: 'Dilip',
      password: 'password123',
    });

    const token = reg.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const latencies: number[] = [];

    for (let i = 1; i <= 5; i++) {
      const start = Date.now();
      const res = await fetch(`${baseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          name: `Dilip ${i}`,
          displayName: `Dilipchendra ${i}`,
          avatarType: 'EMOJI',
          avatarValue: '🧠',
        }),
      });
      const latency = Date.now() - start;
      latencies.push(latency);
      const data = await res.json();
      console.log(`  Run ${i}: status ${res.status} | latency: ${latency}ms | name: "${data.user?.name}" | avatar: "${data.user?.avatarValue}"`);
    }

    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    console.log(`\n-> Average Profile Update Latency: ${avg.toFixed(1)}ms`);

    if (avg > 500) {
      console.error('FAILED: Average latency exceeds 500ms limit!');
      process.exit(1);
    } else {
      console.log('SUCCESS: Profile updates complete in milliseconds (< 500ms).');
    }
  } finally {
    server.close();
  }
}

measureSpeed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
