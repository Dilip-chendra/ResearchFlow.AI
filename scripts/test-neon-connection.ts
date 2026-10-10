import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function testNeon() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is not set!');
    process.exit(1);
  }

  console.log('Connecting to Neon Postgres via serverless driver...');
  const sql = neon(dbUrl);

  try {
    const result = await sql`SELECT NOW() as current_time, version() as pg_version;`;
    console.log('Connected successfully to Neon!');
    console.log('Database time:', result[0].current_time);
    console.log('Postgres version:', result[0].pg_version);
  } catch (err: any) {
    console.error('Failed to connect to Neon:', err.message);
    process.exit(1);
  }
}

testNeon();
