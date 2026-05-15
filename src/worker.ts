import { prisma } from './config/prisma';
import { redis } from './config/redis';
import { startAnalyticsWorker } from './queues/analytics.worker';

async function bootstrapWorker(): Promise<void> {
  console.log('[Worker] Connecting to PostgreSQL...');
  await prisma.$connect();
  console.log('[Worker] ✓ PostgreSQL connected');

  console.log('[Worker] Connecting to Redis...');
  await redis.ping();
  console.log('[Worker] ✓ Redis connected');

  const analyticsWorker = startAnalyticsWorker();

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n[Worker] ${signal} received — shutting down gracefully...`);
    
    await analyticsWorker.close();
    console.log('[Worker] Analytics worker closed');

    await prisma.$disconnect();
    console.log('[Worker] PostgreSQL disconnected');

    redis.disconnect();
    console.log('[Worker] Redis disconnected');

    console.log('[Worker] ✓ Shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrapWorker().catch((err: unknown) => {
  console.error('[Worker] Fatal startup error:', err);
  process.exit(1);
});
