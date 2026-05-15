import { Request, Response, NextFunction } from 'express';
import { CreateUrlSchema, ShortCodeParamSchema } from './url.schema';
import * as urlService from './url.service';
import { serializeBigInt } from '../../utils/serialization';
import { prisma } from '../../config/prisma';

export async function createUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = CreateUrlSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: parsed.error.flatten() },
      });
      return;
    }

    const userId = (req as any).user?.id;
    const result = await urlService.createShortUrl(parsed.data, userId);

    res.status(result.isNew ? 201 : 200).json({
      success: true,
      data: {
        shortUrl: result.shortUrl,
        shortCode: result.shortCode,
        longUrl: result.longUrl,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function redirect(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = ShortCodeParamSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid shortCode format' },
      });
      return;
    }

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      'unknown';

    const longUrl = await urlService.resolveShortCode(parsed.data.shortCode, {
      ip,
      userAgent: req.headers['user-agent'] ?? '',
      referrer: req.headers['referer'] ?? '',
    });

    res.redirect(302, longUrl);
  } catch (err) {
    next(err);
  }
}

export async function getMyLinks(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const urls = await prisma.url.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, data: serializeBigInt(urls) });
  } catch (err) {
    next(err);
  }
}
