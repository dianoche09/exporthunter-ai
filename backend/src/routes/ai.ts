import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
    generateEmail,
    analyzeResponse,
    improveEmail,
    discoverLeads,
    getDiscoverySuggestions,
    getHsCodeSuggestions,
    handleCommand,
    analyzeSupplyChain,
    enrichLead,
    generatePitch
} from '../controllers/aiController';

const router = Router();
router.use(authMiddleware);

router.post('/generate-email', generateEmail);
router.post('/generate-pitch', generatePitch);
router.post('/analyze-response', analyzeResponse);
router.post('/improve-email', improveEmail);
router.post('/discover-leads', discoverLeads);
router.post('/discover-suggestions', getDiscoverySuggestions);
router.post('/hs-code-suggestions', getHsCodeSuggestions);

// Advanced Intelligence
router.post('/analyze-supply-chain', analyzeSupplyChain);
router.post('/enrich-lead', enrichLead);

// New Magic Command Endpoint
router.post('/command', handleCommand);

export { router as aiRouter };
