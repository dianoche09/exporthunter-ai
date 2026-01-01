import { Router } from 'express';
import { getLeads, createLead, updateLead, deleteLead, discoverLeadsBatch } from '../controllers/leadsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getLeads);
router.post('/', createLead);
router.post('/discover-batch', discoverLeadsBatch); // Batch AI lead discovery
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export { router as leadsRouter };
