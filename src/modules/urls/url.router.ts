import { Router } from 'express';
import * as urlController from './url.controller';
import { optionalAuth, protect } from '../auth/auth.middleware';

const router = Router();

/**
 * @openapi
 * /api/urls/me/links:
 *   get:
 *     tags: [URLs]
 *     summary: Get all URLs created by the authenticated user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of user URLs
 *       401:
 *         description: Not authenticated
 */
router.get('/me/links', protect, urlController.getMyLinks);

/**
 * @openapi
 * /api/urls:
 *   post:
 *     tags: [URLs]
 *     summary: Shorten a long URL
 *     description: Creates a short URL. If optional authentication is provided, the URL will be linked to the user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [longUrl]
 *             properties:
 *               longUrl:
 *                 type: string
 *                 example: https://google.com
 *     responses:
 *       201:
 *         description: URL shortened successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', optionalAuth, urlController.createUrl);

export { router as urlRouter };
