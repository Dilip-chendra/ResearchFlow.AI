import 'dotenv/config';
import express, { Request, Response } from 'express';
import { apiRouter } from '../server/api/routes';
import { demoService } from '../server/services/demoService';

const app = express();

// JSON Body Parser & URL-encoded parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Seed demo data on initial boot
try {
  demoService.seedDemoJob('ws_demo_sandbox');
  demoService.seedDemoJob('ws_default_prod');
} catch (err) {
  // Safe ignore
}

// Health check endpoint
app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    app: 'ResearchFlow AI',
    version: '1.0.0',
    platform: 'vercel-serverless',
    timestamp: new Date().toISOString(),
  });
});

// Support both /api/... prefix and root routing for Vercel rewrites
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
