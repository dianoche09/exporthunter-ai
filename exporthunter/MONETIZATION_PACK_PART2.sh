#!/bin/bash

echo "💰 MONETIZATION PACK - Part 2: Backend Routes & Controllers"
echo "==========================================================="
echo ""

cd exporthunter-ai/backend

# ===========================================
# 1. STRIPE CONTROLLER
# ===========================================

cat > src/controllers/stripeController.ts << 'STRIPECTRL'
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { stripeService } from '../services/stripe/stripeService';
import { PRICING_PLANS } from '../config/pricing';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
});

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
  try {
    const { priceId } = req.body;
    const userId = req.user._id;

    if (!priceId) {
      return res.status(400).json({
        success: false,
        error: 'Price ID is required'
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    const result = await stripeService.createCheckoutSession(
      userId,
      priceId,
      `${frontendUrl}/dashboard?session=success`,
      `${frontendUrl}/pricing?session=canceled`
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const createPortalSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const result = await stripeService.createPortalSession(
      userId,
      `${frontendUrl}/settings`
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const handleWebhook = async (req: any, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );

    await stripeService.handleWebhook(event);

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const result = await stripeService.cancelSubscription(userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getPricing = async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        plans: PRICING_PLANS,
        currentTier: req.user?.subscriptionTier || 'free'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
STRIPECTRL

echo "✅ Stripe controller created"

# ===========================================
# 2. USER USAGE CONTROLLER
# ===========================================

cat > src/controllers/usageController.ts << 'USAGECTRL'
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

export const getUserUsage = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        usageThisMonth: user.usageThisMonth,
        usageLimit: user.usageLimit,
        usageResetDate: user.usageResetDate,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        percentageUsed: Math.round((user.usageThisMonth / user.usageLimit) * 100),
        canCreateLead: user.canCreateLead()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getReferralInfo = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralCount: user.referralCount,
        referralLink: `${frontendUrl}/register?ref=${user.referralCode}`
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
USAGECTRL

echo "✅ Usage controller created"

# ===========================================
# 3. STRIPE ROUTES
# ===========================================

cat > src/routes/stripe.ts << 'STRIPEROUTE'
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { 
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
  cancelSubscription,
  getPricing
} from '../controllers/stripeController';
import express from 'express';

const router = Router();

// Public routes
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Protected routes
router.use(authMiddleware);

router.get('/pricing', getPricing);
router.post('/create-checkout', createCheckoutSession);
router.post('/create-portal', createPortalSession);
router.post('/cancel-subscription', cancelSubscription);

export { router as stripeRouter };
STRIPEROUTE

echo "✅ Stripe routes created"

# ===========================================
# 4. USAGE ROUTES
# ===========================================

cat > src/routes/usage.ts << 'USAGEROUTE'
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getUserUsage, getReferralInfo } from '../controllers/usageController';

const router = Router();

router.use(authMiddleware);

router.get('/', getUserUsage);
router.get('/referral', getReferralInfo);

export { router as usageRouter };
USAGEROUTE

echo "✅ Usage routes created"

# ===========================================
# 5. UPDATE LEADS CONTROLLER - ADD USAGE TRACKING
# ===========================================

cat >> src/controllers/leadsController.ts << 'LEADSUPDATE'

// Add to createLead function (import User model first)
import { User } from '../models/User';

// In createLead, after creating lead, add:
await req.user.incrementUsage();
LEADSUPDATE

echo "✅ Leads controller updated with usage tracking"

# ===========================================
# 6. UPDATE SERVER.TS - ADD STRIPE ROUTES
# ===========================================

cat >> src/server.ts << 'SERVERUPDATE'

// Add Stripe routes
import { stripeRouter } from './routes/stripe';
import { usageRouter } from './routes/usage';

// IMPORTANT: Webhook route must be before express.json()
app.use('/api/stripe/webhook', stripeRouter);

// Then other routes
app.use('/api/stripe', stripeRouter);
app.use('/api/usage', usageRouter);
SERVERUPDATE

echo "✅ Server.ts updated with new routes"

# ===========================================
# 7. UPDATE LEADS ROUTES - ADD USAGE CHECK
# ===========================================

echo "
// In src/routes/leads.ts, add usage check middleware to POST route:
import { checkUsageLimit } from '../middleware/checkUsage';

router.post('/', authMiddleware, checkUsageLimit, createLead);
" > USAGE_CHECK_NOTE.txt

echo "✅ Note created for manual update"

# ===========================================
# 8. ADD STRIPE PACKAGE
# ===========================================

cd ..
cat >> backend/package.json << 'STRIPEPKG'
,
    "stripe": "^14.11.0"
STRIPEPKG

echo "✅ Stripe package added to package.json"

echo ""
echo "✅ Part 2/3 Backend Routes complete!"
echo ""
echo "Created:"
echo "  - Stripe controller (checkout, portal, webhook)"
echo "  - Usage controller (stats, referral)"
echo "  - Stripe routes"
echo "  - Usage routes"
echo "  - Updated leads with usage tracking"
echo ""
echo "⚠️  MANUAL STEPS:"
echo "  1. Update leads.ts route to add checkUsageLimit middleware"
echo "  2. Reorder server.ts webhook route before express.json()"
echo "  3. Run: cd backend && npm install"
echo ""
