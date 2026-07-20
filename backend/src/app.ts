import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import healthRoute from './routes/health.route';
import authRoute from './routes/auth.route';
import { errorHandler, notFoundHandler } from './middleware/error-handler';

/**
 * Builds and configures the Express application. Kept separate from
 * server.ts so the app instance can be imported directly in tests
 * (e.g., via Supertest) without binding to a real port or database.
 */
export function createApp(): Express {
  const app = express();

  // Security headers first, per Volume 4's backend security requirements.
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // HTTP access logging. 'dev' format in development, 'combined' in production.
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

  // Versioned API routes, per the Implementation Blueprint's API conventions.
  app.use('/api/v1/health', healthRoute);
  app.use('/api/v1/auth', authRoute);

  // Must be registered after all routes.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
