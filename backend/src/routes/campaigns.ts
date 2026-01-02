import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getCampaigns,
  createCampaign,
  sendCampaign,
  getCampaignStats,
  generateSequence,
  optimizeCampaign
} from '../controllers/campaignsController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.post('/generate-sequence', generateSequence); // AI Sequence
router.post('/:id/send', sendCampaign);
router.post('/:id/optimize', optimizeCampaign); // A/B Optimize
router.get('/:id/stats', getCampaignStats);

export { router as campaignsRouter };
