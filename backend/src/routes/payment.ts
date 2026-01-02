import express from 'express';
import { authMiddleware as auth } from '../middleware/auth';
import { createCheckoutSession, createPortalSession, handleWebhook } from '../controllers/paymentController';

const router = express.Router();

// Private routes (require auth)
router.post('/create-checkout-session', auth, createCheckoutSession);
router.post('/create-portal-session', auth, createPortalSession);

// Public route (Stripe calls this)
// Note: This route requires raw body parsing, which must be configured in server.ts
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
