import { Router } from 'express';
import * as urlController from './url.controller';

const router = Router();

router.get('/:shortCode', urlController.redirect);

export { router as redirectRouter };
