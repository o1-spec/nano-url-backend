import Redis from 'ioredis';
import { env } from './env';

// Singleton Redis client — connection reuse across modules
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const options: any = {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
  };

  const client = env.REDIS_URL
    ? new Redis(env.REDIS_URL, options)
    : new Redis({
        ...options,
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      });

  client.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });

  client.on('error', (err: Error) => {
    console.error('[Redis] Connection error:', err.message);
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
