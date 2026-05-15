import { Worker, Job } from 'bullmq';
import { prisma } from '../config/prisma';
import { redis } from '../config/redis';
import type { AnalyticsJobData } from './analytics.queue';

export function startAnalyticsWorker(): Worker<AnalyticsJobData> {
  const worker = new Worker<AnalyticsJobData>(
    'analytics',
    async (job: Job<AnalyticsJobData>) => {
      const { shortCode, ipAddress, userAgent, referrer, clickedAt } = job.data;

      await prisma.analytics.create({
        data: {
          shortCode,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          referrer: referrer || null,
          clickedAt: new Date(clickedAt),
        },
      });

      console.log(`[AnalyticsWorker] Recorded click for ${shortCode}`);
    },
    {
      connection: redis,
      concurrency: 10,
    },
  );

  worker.on('completed', (job) => {
    console.log(`[AnalyticsWorker] Job ${job.id} completed for ${job.data.shortCode}`);
  });

  worker.on('failed', (job, err) => {
    console.error(
      `[AnalyticsWorker] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`,
      err.message,
    );
  });

  worker.on('error', (err) => {
    console.error('[AnalyticsWorker] Worker error:', err.message);
  });

  console.log('[AnalyticsWorker] Analytics worker started (concurrency: 10)');
  return worker;
}
