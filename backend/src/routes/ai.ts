import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Placeholder routes
router.post('/generate-email', (req, res) => {
  res.json({ success: true, data: { email: 'Generated email content...' } });
});

export { router as aiRouter };
