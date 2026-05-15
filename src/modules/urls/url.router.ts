import { Router } from 'express';
import * as urlController from './url.controller';
import { optionalAuth, protect } from '../auth/auth.middleware';

const router = Router();

router.get('/me/links', protect, urlController.getMyLinks);
router.post('/', optionalAuth, urlController.createUrl);

export { router as urlRouter };
