// Paystack Integration - AGENTS.md Section 10 (Payment Flow)
// Secure payment initialization - no card data touches our platform

import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_...'; // Store in .env
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Subscription plans in ₦ (Nigerian Naira)
export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Plan',
    amount: 2500, // ₦2,500
    currency: 'NGN',
    interval: 'monthly'
  },
  quarterly: {
    name: 'Quarterly Plan',
    amount: 6500, // ₦6,500
    currency: 'NGN',
    interval: 'quarterly'
  },
  annually: {
    name: 'Annual Plan',
    amount: 22000, // ₦22,000
    currency: 'NGN',
    interval: 'annually'
  }
};

export interface PaystackInitializeRequest {
  email: string;
  amount: number; // in kobo (₦1 = 100 kobo)
  currency: string;
  callback_url: string;
  reference?: string;
  metadata?: any;
}

export interface PaystackTransaction {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: string;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: any;
  customer: any;
}

// Initialize payment (AGENTS.md Section 10, Step 2)
export async function initializePayment(
  email: string,
  plan: 'monthly' | 'quarterly' | 'annually',
  userId: string,
  callbackUrl: string
): Promise<{ authorization_url: string; reference: string }> {
  const planDetails = SUBSCRIPTION_PLANS[plan];
  
  const payload: PaystackInitializeRequest = {
    email,
    amount: planDetails.amount * 100, // Convert to kobo
    currency: planDetails.currency,
    callback_url: callbackUrl,
    reference: `slaws_${userId}_${Date.now()}`,
    metadata: {
      userId,
      plan,
      billingCycle: planDetails.interval
    }
  };

  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      authorization_url: response.data.data.authorization_url,
      reference: payload.reference!
    };
  } catch (error: any) {
    console.error('Paystack initialization error:', error.response?.data || error.message);
    throw new Error('Payment initialization failed. Please try again or contact support.');
  }
}

// Verify payment (AGENTS.md Section 10, Step 3A)
export async function verifyPayment(reference: string): Promise<PaystackTransaction> {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    return response.data.data;
  } catch (error: any) {
    console.error('Paystack verification error:', error.response?.data || error.message);
    throw new Error('Payment verification failed.');
  }
}

// Handle successful payment (AGENTS.md Section 10, Step 3A)
export async function handleSuccessfulPayment(
  reference: string,
  userId: string
): Promise<void> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  const transaction = await verifyPayment(reference);
  
  if (transaction.status !== 'success') {
    throw new Error('Payment not successful');
  }

  const metadata = transaction.metadata;
  const planDetails = SUBSCRIPTION_PLANS[metadata.plan as keyof typeof SUBSCRIPTION_PLANS];

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date();
  if (metadata.billingCycle === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (metadata.billingCycle === 'quarterly') {
    endDate.setMonth(endDate.getMonth() + 3);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  // Create or update subscription
  await prisma.subscription.upsert({
    where: { user_id: userId },
    create: {
      user_id: userId,
      plan: metadata.plan === 'monthly' ? 'basic' : 'premium',
      status: 'active',
      amount_paid: planDetails.amount,
      billing_cycle: metadata.billingCycle,
      start_date: startDate,
      end_date: endDate,
      auto_renew: true,
      payment_ref: reference
    },
    update: {
      status: 'active',
      amount_paid: planDetails.amount,
      start_date: startDate,
      end_date: endDate,
      payment_ref: reference,
      auto_renew: true
    }
  });

  // Send WhatsApp confirmation (to be implemented in WhatsApp integration)
  console.log(`Payment successful for user ${userId}. Reference: ${reference}`);
}

// Handle failed payment (AGENTS.md Section 10, Step 3B)
export function handleFailedPayment(): { message: string; next_action: string } {
  return {
    message: 'Payment failed. Please try again or contact us on WhatsApp for assistance.',
    next_action: 'escalate'
  };
}

// Check subscription renewal (AGENTS.md Section 10, Step 4)
export async function checkRenewal(userId: string): Promise<boolean> {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  const subscription = await prisma.subscription.findUnique({
    where: { user_id: userId }
  });

  if (!subscription || !subscription.auto_renew) {
    return false;
  }

  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  // Notify 3 days prior to renewal
  if (subscription.end_date <= threeDaysFromNow && subscription.end_date > now) {
    console.log(`Renewal reminder for user ${userId}`);
    // Send WhatsApp notification
  }

  // Auto-renew if end_date has passed
  if (subscription.end_date < now && subscription.status === 'active') {
    // Attempt renewal
    return true;
  }

  return false;
}
