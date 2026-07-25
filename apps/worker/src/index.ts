import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

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
  console.log(`Worker listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
