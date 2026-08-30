import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/api/routes';
import { demoService } from './server/services/demoService';
import { logger } from './server/utils/logger';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser & CORS headers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Seed demo data on boot for instant ready-to-test experience
  try {
    demoService.seedDemoJob('ws_default_prod');
    logger.info('ResearchFlow AI seeded with default NextGen Resume AI demo workflow.');
  } catch (err) {
    logger.warn('Could not seed default demo job on boot:', err);
  }

  // Mount API router
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'ResearchFlow AI',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`ResearchFlow AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  logger.error('Fatal server startup error:', err);
  process.exit(1);
});
