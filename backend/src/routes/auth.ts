import { Router } from 'express';
import { register, login, getCurrentUser, updateProfile, analyzeMarkets, refreshToken } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/me', authMiddleware, updateProfile);
router.post('/analyze-markets', authMiddleware, analyzeMarkets);

export { router as authRouter };
