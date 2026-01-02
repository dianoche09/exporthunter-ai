import express from 'express';
import { getBriefing, getOpportunities, getStats, getAcquisitionChart } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all dashboard routes
router.use(authMiddleware);

router.get('/briefing', getBriefing);
router.get('/opportunities', getOpportunities);
router.get('/stats', getStats);
router.get('/chart/acquisition', getAcquisitionChart);

export default router;
