import 'dotenv/config';
import express, { Request, Response } from 'express';
import { apiRouter } from './api/routes';
import { db } from './db/store';
import { demoService } from './services/demoService';
import { logger } from './utils/logger';

const app = express();

// Enable JSON Body Parser with rawBody for Razorpay webhook HMAC & URL-encoded parser
app.use(express.json({
  limit: '10mb',
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS & Preflight headers for Vercel Serverless environment
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-workspace-id, x-demo-mode, x-user-id');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Hydrate persistent data from Neon Postgres on serverless container start
if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
  db.hydrateFromNeon().catch(err => {
    logger.warn('[VERCEL] Cold boot hydration caught error:', err?.message || err);
  });
}

// Seed demo data on initial cold boot safely
try {
  demoService.seedDemoJob('ws_demo_sandbox');
  demoService.seedDemoJob('ws_default_prod');
} catch (err) {
  logger.warn('Seed demo sandbox on serverless boot:', err);
}

// Health check and root API diagnostic endpoints
app.get(['/api/health', '/health', '/api/index', '/api'], (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    app: 'ResearchFlow AI',
    version: '1.0.0',
    platform: 'vercel-serverless',
    database: (process.env.DATABASE_URL || process.env.POSTGRES_URL) ? 'neon-serverless-postgres' : 'file-json',
    emailService: process.env.RESEND_API_KEY ? 'resend-configured' : 'fallback-mode',
    timestamp: new Date().toISOString(),
  });
});

// Mount API router on both /api prefix and root for full rewrite flexibility
app.use('/api', apiRouter);
app.use(apiRouter);

// Export robust Vercel serverless function handler
export default function handler(req: any, res: any) {
  // If Vercel rewrote the path to /api/index, restore original URL from headers
  const matchedPath = (req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'] || req.headers['x-forwarded-uri'] || '') as string;
  if (matchedPath && (req.url === '/api/index' || req.url === '/api' || req.url?.startsWith('/api/index?'))) {
    req.url = matchedPath;
  }
  return app(req, res);
}
