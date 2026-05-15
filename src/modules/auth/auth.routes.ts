import { Router } from 'express';
import * as authController from './auth.controller';
import { protect } from './auth.middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);

export { router as authRouter };
