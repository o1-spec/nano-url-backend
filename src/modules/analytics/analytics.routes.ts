import { Router } from 'express';
import * as analyticsController from './analytics.controller';

const router = Router();

/**
 * @openapi
 * /api/analytics/{shortCode}/stats:
 *   get:
 *     tags: [Analytics]
 *     summary: Get detailed click analytics for a short URL
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The short code of the URL
 *     responses:
 *       200:
 *         description: Analytics report retrieved
 *       404:
 *         description: Short code not found
 */
router.get('/:shortCode/stats', analyticsController.getStats);

export { router as analyticsRouter };
