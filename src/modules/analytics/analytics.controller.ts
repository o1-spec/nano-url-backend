import { Request, Response, NextFunction } from 'express';
import * as analyticsService from './analytics.service';
import { ShortCodeParamSchema } from '../urls/url.schema';

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = ShortCodeParamSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid shortCode', details: parsed.error.flatten() },
      });
      return;
    }

    const stats = await analyticsService.getUrlStats(parsed.data.shortCode);

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}
