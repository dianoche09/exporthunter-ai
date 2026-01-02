import { Router } from 'express';
import { getLeads, createLead, updateLead, deleteLead, discoverLeadsBatch, createLeadsBulk, getLeadStats, getSupplyChainIntel } from '../controllers/leadsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// Stats & Special Routes (Must be before dynamic /:id routes if any exist)
router.get('/stats', getLeadStats);
router.post('/hunt', discoverLeadsBatch); // Alias for AI Hunt
router.post('/batch', createLeadsBulk);
router.post('/discover-batch', discoverLeadsBatch);

// CRUD Routes
router.get('/', getLeads);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.get('/:id/supply-chain-intel', getSupplyChainIntel);

export { router as leadsRouter };
