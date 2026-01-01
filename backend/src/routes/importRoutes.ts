import express from 'express';
import { auth } from '../middleware/auth';
import { importLeads, exportLeads } from '../controllers/importController';

const router = express.Router();

/**
 * @route   POST /api/import/leads
 * @desc    Import leads from CSV
 * @access  Private
 */
router.post('/leads', auth, importLeads);

/**
 * @route   GET /api/import/leads/export
 * @desc    Export leads to CSV
 * @access  Private
 */
router.get('/leads/export', auth, exportLeads);

export default router;
