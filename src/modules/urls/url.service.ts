import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { redis } from '../../config/redis';
import { encodeBase62 } from '../../utils/base62';
import { createError } from '../../utils/errors';
import { env } from '../../config/env';
import type { CreateUrlInput } from './url.schema';
import { analyticsQueue } from '@/queues/analytics.queue';

const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours


function buildShortUrl(shortCode: string): string {
  return `${env.BASE_URL}/${shortCode}`;
}

function cacheKey(shortCode: string): string {
  return `url:${shortCode}`;
}


export async function createShortUrl(
  input: CreateUrlInput,
  userId?: bigint,
): Promise<{
  shortUrl: string;
  shortCode: string;
  longUrl: string;
  isNew: boolean;
}> {
  // Check for existing entry (idempotent creation)
  // If a user is logged in, we always create a new entry for them to manage
  // unless they already have this specific URL shortened.
  const existing = await prisma.url.findFirst({
    where: { 
      longUrl: input.longUrl,
      userId: userId || null
    },
  });

  if (existing) {
    return {
      shortUrl: buildShortUrl(existing.shortCode),
      shortCode: existing.shortCode,
      longUrl: existing.longUrl,
      isNew: false,
    };
  }

  // Create a temp row with a placeholder shortCode to obtain the auto-increment ID
  const url = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const placeholder = await tx.url.create({
      data: {
        longUrl: input.longUrl,
        shortCode: `__pending_${Date.now()}`,
        userId: userId || null,
      },
    });

    const shortCode = encodeBase62(placeholder.id);

    return tx.url.update({
      where: { id: placeholder.id },
      data: { shortCode },
    });
  });

  // Cache the shortCode → longUrl mapping in Redis
  await redis.setex(cacheKey(url.shortCode), CACHE_TTL_SECONDS, url.longUrl);

  console.log(`[UrlService] Created short URL: ${url.shortCode} → ${url.longUrl}`);

  return {
    shortUrl: buildShortUrl(url.shortCode),
    shortCode: url.shortCode,
    longUrl: url.longUrl,
    isNew: true,
  };
}

/**
 * Resolves a shortCode to its original long URL.
 * Cache-first strategy: checks Redis before hitting PostgreSQL.
 */
export async function resolveShortCode(
  shortCode: string,
  meta: { ip: string; userAgent: string; referrer: string },
): Promise<string> {
  // 1. Cache hit
  const cached = await redis.get(cacheKey(shortCode));
  if (cached) {
    console.log(`[UrlService] Cache HIT for ${shortCode}`);
    await enqueueAnalytics(shortCode, meta);
    return cached;
  }

  // 2. Cache miss — query PostgreSQL
  console.log(`[UrlService] Cache MISS for ${shortCode} — querying DB`);
  const url = await prisma.url.findUnique({ where: { shortCode } });

  if (!url) {
    throw createError(`Short URL not found: ${shortCode}`, 404);
  }

  // Repopulate cache
  await redis.setex(cacheKey(shortCode), CACHE_TTL_SECONDS, url.longUrl);
  await enqueueAnalytics(shortCode, meta);

  return url.longUrl;
}



async function enqueueAnalytics(
  shortCode: string,
  meta: { ip: string; userAgent: string; referrer: string },
): Promise<void> {
  try {
    await analyticsQueue.add('click', {
      shortCode,
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
      referrer: meta.referrer,
      clickedAt: new Date().toISOString(),
    });
  } catch (err) {
    // Analytics failure must NEVER block a redirect — log and continue
    console.error('[UrlService] Failed to enqueue analytics event:', err);
  }
}
