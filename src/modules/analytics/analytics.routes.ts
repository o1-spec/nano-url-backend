import { Router } from 'express';
import * as analyticsController from './analytics.controller';

const router = Router();

router.get('/:shortCode/stats', analyticsController.getStats);

export { router as analyticsRouter };
