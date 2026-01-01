import { Router } from 'express';
import { EmailActivity } from '../models/EmailActivity';
import { campaignStatsSync } from '../services/campaign/statsSync';

const router = Router();

// Track email opens (pixel)
router.get('/open/:campaignId/:leadId', async (req, res) => {
  try {
    const { campaignId, leadId } = req.params;

    await EmailActivity.findOneAndUpdate(
      { campaignId, leadId, openedAt: { $exists: false } },
      {
        status: 'opened',
        openedAt: new Date()
      }
    );

    // Sync campaign stats
    await campaignStatsSync.syncCampaignStats(campaignId);

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length
    });
    res.end(pixel);
  } catch (error) {
    res.status(500).end();
  }
});

// Track link clicks
router.get('/click/:campaignId/:leadId', async (req, res) => {
  try {
    const { campaignId, leadId } = req.params;
    const { url } = req.query;

    await EmailActivity.findOneAndUpdate(
      { campaignId, leadId },
      {
        status: 'clicked',
        clickedAt: new Date()
      }
    );

    // Sync campaign stats
    await campaignStatsSync.syncCampaignStats(campaignId);

    // Redirect to original URL
    res.redirect(url as string);
  } catch (error) {
    res.status(500).send('Tracking error');
  }
});

export { router as trackingRouter };
