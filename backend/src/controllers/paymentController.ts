import { Request, Response } from 'express';
import Stripe from 'stripe';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2023-10-16' as any,
});

const PRICES = {
    pro: process.env.STRIPE_PRO_PRICE_ID,
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID
};

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;
        const { plan } = req.body; // 'pro' or 'enterprise'

        if (!plan || !['pro', 'enterprise'].includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create or retrieve Stripe Customer
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

        const priceId = PRICES[plan as keyof typeof PRICES];
        if (!priceId) {
            return res.status(500).json({ error: 'Price configuration missing' });
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.FRONTEND_URL}/settings?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
            metadata: {
                userId: user._id.toString(),
                plan: plan
            }
        });

        res.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createPortalSession = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user || !user.stripeCustomerId) {
            return res.status(400).json({ error: 'No subscription found' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.FRONTEND_URL}/settings`,
        });

        res.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Portal Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (!sig || !webhookSecret) return res.status(400).send('Webhook Secret/Signature missing');

        // req.body must be raw buffer here. Accessing via logic in server.ts
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const plan = session.metadata?.plan;

            if (userId && plan) {
                await User.findByIdAndUpdate(userId, {
                    subscription: plan,
                    stripeSubscriptionId: session.subscription as string,
                    stripeCustomerId: session.customer as string
                });
                console.log(`✅ Subscription activated for user ${userId} (${plan})`);
            }
        } else if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription;
            const user = await User.findOne({ stripeSubscriptionId: subscription.id });

            if (user) {
                user.subscription = 'free';
                user.stripeSubscriptionId = undefined;
                user.stripePriceId = undefined;
                await user.save();
                console.log(`⚠️ Subscription canceled for user ${user._id}`);
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook Handler Error:', error);
        res.status(500).send('Webhook Handler Error');
    }
};
