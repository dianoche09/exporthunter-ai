import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getDashboardStats } from '../controllers/statsController';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', getDashboardStats);

export { router as statsRouter };
