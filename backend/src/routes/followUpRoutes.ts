import express, { Response } from 'express';
import { authMiddleware as auth, AuthRequest } from '../middleware/auth';
import { followUpService } from '../services/email/followUpService';

const router = express.Router();

/**
 * @route   POST /api/followup/trigger/:campaignId
 * @desc    Manually trigger follow-up for a campaign
 * @access  Private
 */
router.post('/trigger/:campaignId', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { campaignId } = req.params;
        const { followUpNumber } = req.body;

        if (!followUpNumber || (followUpNumber !== 1 && followUpNumber !== 2)) {
            return res.status(400).json({
                success: false,
                error: 'followUpNumber must be 1 or 2'
            });
        }

        const result = await followUpService.triggerCampaignFollowUp(campaignId, followUpNumber);

        res.json(result);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/followup/process
 * @desc    Manually trigger follow-up processing (admin only)
 * @access  Private
 */
router.post('/process', auth, async (req: AuthRequest, res: Response) => {
    try {
        // Run follow-up processing immediately
        followUpService.processFollowUps();

        res.json({
            success: true,
            message: 'Follow-up processing triggered'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
