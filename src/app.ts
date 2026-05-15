import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './utils/errors';
import { urlRouter } from './modules/urls/url.router';
import { redirectRouter } from './modules/urls/redirect.router';
import { authRouter } from './modules/auth/auth.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';
import { env } from './config/env';

export function createApp(): Application {
  const app = express();
  
  app.use(
    cors({
      origin: env.BASE_URL.replace(':3001', ':3000'), // Allow frontend origin
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.set('trust proxy', 1);

  app.use(globalRateLimiter);

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'nanourl-backend',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/urls', urlRouter);
  app.use('/api/analytics', analyticsRouter);

  app.use('/', redirectRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: { message: 'Route not found' },
    });
  });

  app.use(errorHandler);

  return app;
}
