import express from 'express';
import dotenv from 'dotenv';
import { logger } from './logger';
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

dotenv.config();

import { validateEnv } from '@leadlens/shared';
// Validate required environment variables on startup
validateEnv();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, 
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Sentry request handler must be the first middleware on the app
Sentry.setupExpressErrorHandler(app);

// Worker Auth Middleware (stub)
const requireWorkerAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const secret = req.headers['x-worker-secret'];
  if (secret !== process.env.WORKER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Internal Job Routes
const internalRouter = express.Router();
internalRouter.use(requireWorkerAuth);

internalRouter.post('/jobs/claim', (req, res) => {
  res.json({ message: 'claim stub' });
});

internalRouter.post('/jobs/:id/progress', (req, res) => {
  res.json({ message: 'progress stub' });
});

internalRouter.post('/jobs/:id/complete', (req, res) => {
  res.json({ message: 'complete stub' });
});

internalRouter.post('/jobs/:id/fail', (req, res) => {
  res.json({ message: 'fail stub' });
});

app.use('/internal', internalRouter);

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, `Worker listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
