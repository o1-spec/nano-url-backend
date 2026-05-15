import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { redis } from './config/redis';
import { startAnalyticsWorker } from './queues/analytics.worker';

async function bootstrap(): Promise<void> {
  console.log('[Server] Connecting to PostgreSQL...');
  await prisma.$connect();
  console.log('[Server] ✓ PostgreSQL connected');

  console.log('[Server] Connecting to Redis...');
  await redis.ping();
  console.log('[Server] ✓ Redis connected');

  // ── Start Background Worker ──
  // In a free deployment, we run the BullMQ worker in the same process
  // as the web server to save resources (only 1 web service required).
  let analyticsWorker: any;
  if (env.NODE_ENV === 'production' || process.env.RUN_WORKER_WITH_SERVER === 'true') {
    console.log('[Server] Starting built-in background worker...');
    analyticsWorker = startAnalyticsWorker();
  } else {
    console.log('[Server] Skipping built-in worker (managed by separate process in dev)');
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`\n[Server] 🚀 NanoURL running on port ${env.PORT} [${env.NODE_ENV}]`);
    console.log(`[Server] Health:   http://localhost:${env.PORT}/health`);
    console.log(`[Server] API:      http://localhost:${env.PORT}/api/urls`);
    console.log(`[Server] Redirect: http://localhost:${env.PORT}/:shortCode\n`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n[Server] ${signal} received — shutting down gracefully...`);

    server.close(async () => {
      console.log('[Server] HTTP server closed');

      if (analyticsWorker) {
        await analyticsWorker.close();
        console.log('[Server] Built-in analytics worker closed');
      }

      await prisma.$disconnect();
      console.log('[Server] PostgreSQL disconnected');

      redis.disconnect();
      console.log('[Server] Redis disconnected');

      console.log('[Server] ✓ Shutdown complete');
      process.exit(0);
    });

    // Force exit after 10s if connections are hanging
    setTimeout(() => {
      console.error('[Server] Forced shutdown after 10s timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('[Server] Unhandled rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('[Server] Uncaught exception:', err);
    process.exit(1);
  });
}

bootstrap().catch((err: unknown) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
