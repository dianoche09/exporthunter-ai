import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { importLeads, exportLeads, uploadMiddleware } from '../controllers/importExportController';

const router = Router();

router.use(authMiddleware);

router.post('/leads', uploadMiddleware, importLeads);
router.get('/leads/export', exportLeads);

export { router as importRouter };
