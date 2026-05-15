import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export interface AnalyticsJobData {
  shortCode: string;
  ipAddress: string;
  userAgent: string;
  referrer: string;
  clickedAt: string;
}

export const analyticsQueue = new Queue<AnalyticsJobData>('analytics', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 500 },
  },
});

analyticsQueue.on('error', (err) => {
  console.error('[AnalyticsQueue] Queue error:', err.message);
});

console.log('[AnalyticsQueue] Analytics queue initialized');
