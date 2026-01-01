import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getCampaigns,
  createCampaign,
  sendCampaign,
  getCampaignStats
} from '../controllers/campaignsController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getCampaigns);
router.post('/', createCampaign);
router.post('/:id/send', sendCampaign);
router.get('/:id/stats', getCampaignStats);

export { router as campaignsRouter };
