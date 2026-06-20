import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import authRoutes from './routes/auth.routes.js';
import viewerStateRoutes from './routes/viewerState.routes.js';
import measurementsRoutes from './routes/measurements.routes.js';

export function createApp() {
  const app = express();

  const corsOptions =
    config.corsOrigin === '*'
      ? { origin: true }
      : { origin: config.corsOrigin.split(',').map((s) => s.trim()) };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  app.use('/api/auth', authRoutes);
  app.use('/api/viewer-state', viewerStateRoutes);
  app.use('/api/measurements', measurementsRoutes);

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}
