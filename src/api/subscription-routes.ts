// Subscription Routes - AGENTS.md Section 10 (Payment Flow)
// Handles subscription plans, payments, and renewals

import 'dotenv/config';
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  initializePayment,
  handleSuccessfulPayment,
  handleFailedPayment,
  SUBSCRIPTION_PLANS
} from '../services/payment/paystack';

const router = express.Router();
const prisma = new PrismaClient();

// Get subscription plans (all prices in ₦)
router.get('/plans', (req: Request, res: Response) => {
  const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, value]) => ({
    id: key,
    name: value.name,
    amount: value.amount,
    currency: value.currency,
    billingCycle: value.interval,
    displayPrice: `₦${value.amount.toLocaleString()}`
  }));

  return res.json(plans);
});

// Initialize subscription payment
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { userId, plan, callbackUrl } = req.body;

    if (!userId || !plan || !callbackUrl) {
      return res.status(400).json({ error: 'userId, plan, and callbackUrl are required' });
    }

    // Check if user exists and has NDPA consent
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.consent_given) {
      return res.status(403).json({
        error: 'NDPA Consent Required',
        message: 'Under Nigeria\'s Data Protection Act 2023, we need your consent before proceeding.'
      });
    }

    // Check for existing active subscription
    const existingSub = await prisma.subscription.findUnique({
      where: { user_id: userId }
    });

    if (existingSub && existingSub.status === 'active') {
      return res.status(400).json({
        error: 'Active subscription exists',
        message: 'You already have an active subscription. Would you like to upgrade?',
        next_action: 'open_subscription'
      });
    }

    // Initialize Paystack payment
    const payment = await initializePayment(
      user.email || `${userId}@slawsnigeria.com`,
      plan,
      userId,
      callbackUrl
    );

    return res.json({
      authorization_url: payment.authorization_url,
      reference: payment.reference,
      plan: SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]
    });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return res.status(500).json({
      error: 'Payment initialization failed',
      message: error.message || 'Please try again or contact support.'
    });
  }
});

// Paystack callback/webhook
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { reference, trxref } = req.query;
    const ref = reference || trxref;

    if (!ref || typeof ref !== 'string') {
      return res.status(400).json({ error: 'Invalid reference' });
    }

    // Extract userId from reference (format: slaws_userId_timestamp)
    const parts = ref.split('_');
    if (parts.length < 3) {
      return res.status(400).json({ error: 'Invalid reference format' });
    }

    const userId = parts[1];

    // Handle successful payment
    await handleSuccessfulPayment(ref, userId);

    // Redirect to success page or return success response
    return res.json({
      success: true,
      message: 'Subscription activated successfully! You now have full access to SlawsNigeria services.',
      next_action: 'show_catalogue'
    });
  } catch (error: any) {
    console.error('Callback error:', error);
    const failure = handleFailedPayment();
    return res.status(400).json(failure);
  }
});

// Get user's subscription status
router.get('/status/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const subscription = await prisma.subscription.findUnique({
      where: { user_id: userId }
    });

    if (!subscription) {
      return res.json({ hasSubscription: false });
    }

    return res.json({
      hasSubscription: true,
      status: subscription.status,
      plan: subscription.plan,
      endDate: subscription.end_date,
      autoRenew: subscription.auto_renew
    });
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel subscription
router.post('/cancel/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    await prisma.subscription.update({
      where: { user_id: userId },
      data: {
        status: 'cancelled',
        auto_renew: false
      }
    });

    return res.json({
      success: true,
      message: 'Subscription cancelled. You can still access services until your current billing period ends.'
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
