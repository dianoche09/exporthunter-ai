#!/bin/bash

echo "💰 MONETIZATION PACK - Part 1: Backend Infrastructure"
echo "======================================================"
echo ""

cd exporthunter-ai/backend

# ===========================================
# 1. UPDATE USER MODEL - ADD SUBSCRIPTION
# ===========================================

cat > src/models/User.ts << 'USERMODEL'
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  company?: string;
  
  // Subscription
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  
  // Usage Tracking
  usageThisMonth: number;
  usageResetDate: Date;
  usageLimit: number; // Based on tier
  
  // Referral
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  referralCount: number;
  
  createdAt: Date;
  updatedAt: Date;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementUsage(): Promise<void>;
  resetMonthlyUsage(): Promise<void>;
  canCreateLead(): boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    company: String,
    
    // Subscription
    subscriptionTier: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing'],
      default: 'active'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    subscriptionStartDate: Date,
    subscriptionEndDate: Date,
    
    // Usage
    usageThisMonth: {
      type: Number,
      default: 0
    },
    usageResetDate: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setMonth(date.getMonth() + 1);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        return date;
      }
    },
    usageLimit: {
      type: Number,
      default: 10 // Free tier
    },
    
    // Referral
    referralCode: {
      type: String,
      unique: true,
      default: () => Math.random().toString(36).substring(2, 10).toUpperCase()
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    referralCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Increment usage
userSchema.methods.incrementUsage = async function(): Promise<void> {
  // Check if need to reset
  if (new Date() >= this.usageResetDate) {
    await this.resetMonthlyUsage();
  }
  
  this.usageThisMonth += 1;
  await this.save();
};

// Reset monthly usage
userSchema.methods.resetMonthlyUsage = async function(): Promise<void> {
  this.usageThisMonth = 0;
  
  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1);
  nextReset.setDate(1);
  nextReset.setHours(0, 0, 0, 0);
  
  this.usageResetDate = nextReset;
  await this.save();
};

// Check if can create lead
userSchema.methods.canCreateLead = function(): boolean {
  // Enterprise = unlimited
  if (this.subscriptionTier === 'enterprise') return true;
  
  // Check usage limit
  return this.usageThisMonth < this.usageLimit;
};

// Update usage limit when tier changes
userSchema.pre('save', function(next) {
  if (this.isModified('subscriptionTier')) {
    switch (this.subscriptionTier) {
      case 'free':
        this.usageLimit = 10;
        break;
      case 'pro':
        this.usageLimit = 100;
        break;
      case 'enterprise':
        this.usageLimit = 999999; // Unlimited
        break;
    }
  }
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);
USERMODEL

echo "✅ User model updated with subscription"

# ===========================================
# 2. PRICING CONFIG
# ===========================================

cat > src/config/pricing.ts << 'PRICING'
export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    interval: 'month',
    features: [
      '10 leads per month',
      'AI lead discovery',
      'Basic email templates',
      'Email tracking',
      'Standard support'
    ],
    limits: {
      leads: 10,
      campaigns: 5,
      emailsPerDay: 20
    }
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    interval: 'month',
    features: [
      '100 leads per month',
      'Everything in Free',
      'AI email generator',
      'AI email improver',
      'Auto follow-ups',
      'Advanced analytics',
      'Priority support',
      'CSV import/export'
    ],
    limits: {
      leads: 100,
      campaigns: 50,
      emailsPerDay: 500
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    interval: 'month',
    features: [
      'Unlimited leads',
      'Everything in Pro',
      'White label',
      'API access',
      'Team collaboration',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee'
    ],
    limits: {
      leads: 999999,
      campaigns: 999999,
      emailsPerDay: 999999
    }
  }
};

export type PricingTier = keyof typeof PRICING_PLANS;

export const getPlanByPriceId = (priceId: string): PricingTier | null => {
  for (const [tier, plan] of Object.entries(PRICING_PLANS)) {
    if (plan.priceId === priceId) {
      return tier as PricingTier;
    }
  }
  return null;
};
PRICING

echo "✅ Pricing config created"

# ===========================================
# 3. STRIPE SERVICE
# ===========================================

cat > src/services/stripe/stripeService.ts << 'STRIPE'
import Stripe from 'stripe';
import { User } from '../../models/User';
import { PRICING_PLANS } from '../../config/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
});

export class StripeService {
  /**
   * Create checkout session
   */
  async createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user._id.toString()
          }
        });
        
        customerId = customer.id;
        user.stripeCustomerId = customerId;
        await user.save();
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: user._id.toString()
        }
      });

      return {
        sessionId: session.id,
        url: session.url
      };
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      throw new Error(`Failed to create checkout: ${error.message}`);
    }
  }

  /**
   * Create customer portal session
   */
  async createPortalSession(userId: string, returnUrl: string) {
    try {
      const user = await User.findById(userId);
      if (!user?.stripeCustomerId) {
        throw new Error('No Stripe customer found');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: returnUrl
      });

      return { url: session.url };
    } catch (error: any) {
      console.error('Portal session error:', error);
      throw new Error(`Failed to create portal: ${error.message}`);
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) return;

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    const priceId = subscription.items.data[0].price.id;
    const tier = this.getTierFromPriceId(priceId);

    await User.findByIdAndUpdate(userId, {
      stripeSubscriptionId: subscription.id,
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date(subscription.current_period_start * 1000),
      subscriptionEndDate: new Date(subscription.current_period_end * 1000)
    });

    console.log(`✅ Subscription activated for user ${userId}: ${tier}`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const user = await User.findOne({ stripeSubscriptionId: subscription.id });
    if (!user) return;

    const priceId = subscription.items.data[0].price.id;
    const tier = this.getTierFromPriceId(priceId);

    user.subscriptionTier = tier;
    user.subscriptionStatus = subscription.status as any;
    user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    
    await user.save();

    console.log(`✅ Subscription updated for user ${user._id}: ${tier}`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const user = await User.findOne({ stripeSubscriptionId: subscription.id });
    if (!user) return;

    user.subscriptionTier = 'free';
    user.subscriptionStatus = 'canceled';
    
    await user.save();

    console.log(`❌ Subscription canceled for user ${user._id}`);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const user = await User.findOne({ stripeCustomerId: invoice.customer as string });
    if (!user) return;

    user.subscriptionStatus = 'past_due';
    await user.save();

    console.log(`⚠️ Payment failed for user ${user._id}`);
  }

  private getTierFromPriceId(priceId: string): 'free' | 'pro' | 'enterprise' {
    if (priceId === PRICING_PLANS.pro.priceId) return 'pro';
    if (priceId === PRICING_PLANS.enterprise.priceId) return 'enterprise';
    return 'free';
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string) {
    const user = await User.findById(userId);
    if (!user?.stripeSubscriptionId) {
      throw new Error('No active subscription');
    }

    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    user.subscriptionStatus = 'canceled';
    await user.save();

    return { success: true };
  }
}

export const stripeService = new StripeService();
STRIPE

echo "✅ Stripe service created"

# ===========================================
# 4. USAGE MIDDLEWARE
# ===========================================

cat > src/middleware/checkUsage.ts << 'USAGE'
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const checkUsageLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    // Check if can create lead
    if (!user.canCreateLead()) {
      return res.status(403).json({
        success: false,
        error: 'Usage limit reached',
        data: {
          usageThisMonth: user.usageThisMonth,
          usageLimit: user.usageLimit,
          subscriptionTier: user.subscriptionTier,
          upgradeRequired: true
        }
      });
    }

    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
USAGE

echo "✅ Usage middleware created"

echo ""
echo "✅ Part 1/3 Backend Infrastructure complete!"
echo ""
echo "Created:"
echo "  - Updated User model with subscription"
echo "  - Pricing config"
echo "  - Stripe service (checkout, webhooks)"
echo "  - Usage limit middleware"
echo ""
