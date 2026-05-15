import { prisma } from '../../config/prisma';
import { createError } from '../../utils/errors';
import { env } from '../../config/env';

function buildShortUrl(shortCode: string): string {
  return `${env.BASE_URL}/${shortCode}`;
}

export async function getUrlStats(shortCode: string) {
  const url = await prisma.url.findUnique({
    where: { shortCode },
    include: {
      analytics: {
        orderBy: { clickedAt: 'desc' },
        take: 10,
        select: {
          clickedAt: true,
          ipAddress: true,
          userAgent: true,
          referrer: true,
        },
      },
    },
  });

  if (!url) {
    throw createError(`Short URL not found: ${shortCode}`, 404);
  }

  const totalClicks = await prisma.analytics.count({
    where: { shortCode },
  });

  return {
    shortCode: url.shortCode,
    longUrl: url.longUrl,
    shortUrl: buildShortUrl(url.shortCode),
    totalClicks,
    createdAt: url.createdAt,
    recentClicks: url.analytics,
  };
}
