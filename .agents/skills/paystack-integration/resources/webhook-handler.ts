/**
 * Paystack Webhook Handler — SlawsNigeria
 *
 * Handles incoming Paystack webhook events securely.
 * Signature verification is applied via middleware BEFORE this handler runs.
 * See: src/api/middleware/paystack-signature.ts
 *
 * Mount at: POST /api/v1/webhooks/paystack
 *
 * Source: SNG-PRD-AI-001 v3.0 — Section 20 (Payment Flow)
 */

import crypto from 'crypto';
import { Request, Response } from 'express';

import { prisma } from '@/db/client';
import { redis } from '@/db/redis';
import { WhatsAppService } from '@/services/whatsapp/whatsapp.service';
import { formatNGN } from '@/shared/currency';
import { logger } from '@/shared/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaystackWebhookEvent {
  event: string;
  data: PaystackChargeSuccessData | Record<string, unknown>;
}

interface PaystackChargeSuccessData {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;         // in kobo
  currency: string;
  paid_at: string;
  customer: {
    id: number;
    email: string;
    customer_code: string;
  };
  metadata: {
    userId: string;
    plan: string;
    billing_cycle: string;
  };
}

type BillingCycle = 'monthly' | 'quarterly' | 'annually';

// ─── Idempotency ──────────────────────────────────────────────────────────────

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

async function isAlreadyProcessed(eventId: string): Promise<boolean> {
  const key = `paystack:processed:${eventId}`;
  const exists = await redis.get(key);
  return exists !== null;
}

async function markAsProcessed(eventId: string): Promise<void> {
  const key = `paystack:processed:${eventId}`;
  await redis.set(key, '1', 'EX', IDEMPOTENCY_TTL_SECONDS);
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function calculateEndDate(startDate: Date, billingCycle: BillingCycle): Date {
  const end = new Date(startDate);
  switch (billingCycle) {
    case 'monthly':
      end.setMonth(end.getMonth() + 1);
      break;
    case 'quarterly':
      end.setMonth(end.getMonth() + 3);
      break;
    case 'annually':
      end.setFullYear(end.getFullYear() + 1);
      break;
  }
  return end;
}

// ─── Subscription activation ──────────────────────────────────────────────────

async function activateSubscription(data: PaystackChargeSuccessData): Promise<void> {
  const { userId, plan, billing_cycle } = data.metadata;
  const amountInNGN = data.amount / 100; // Convert kobo to ₦
  const now = new Date(data.paid_at);
  const endDate = calculateEndDate(now, billing_cycle as BillingCycle);

  // Upsert subscription record
  const subscription = await prisma.subscription.upsert({
    where: { user_id: userId },
    update: {
      plan: plan as 'basic' | 'premium',
      status: 'active',
      amount_paid: amountInNGN,
      billing_cycle: billing_cycle as BillingCycle,
      start_date: now,
      end_date: endDate,
      payment_ref: data.reference,
      auto_renew: true,
    },
    create: {
      user_id: userId,
      plan: plan as 'basic' | 'premium',
      status: 'active',
      amount_paid: amountInNGN,
      billing_cycle: billing_cycle as BillingCycle,
      start_date: now,
      end_date: endDate,
      payment_ref: data.reference,
      auto_renew: true,
    },
  });

  // Link subscription to user
  await prisma.user.update({
    where: { id: userId },
    data: { subscription_id: subscription.id },
  });

  logger.info({
    event: 'subscription.activated',
    userId,
    plan,
    billing_cycle,
    amount_ngn: amountInNGN,
    reference: data.reference,
  });
}

// ─── WhatsApp confirmation ────────────────────────────────────────────────────

async function sendSubscriptionConfirmation(
  userId: string,
  data: PaystackChargeSuccessData,
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { full_name: true, phone: true },
    });

    if (!user?.phone) {
      logger.warn({ event: 'whatsapp.confirmation.skipped', userId, reason: 'no_phone' });
      return;
    }

    const whatsapp = new WhatsAppService();
    const amountDisplay = formatNGN(data.amount / 100);
    const planLabel = data.metadata.plan.charAt(0).toUpperCase() + data.metadata.plan.slice(1);

    await whatsapp.sendTextMessage(
      user.phone,
      `🎉 Welcome to SlawsNigeria, ${user.full_name}!\n\n` +
        `Your *${planLabel}* subscription is now active.\n` +
        `Amount paid: *${amountDisplay}*\n` +
        `Reference: ${data.reference}\n\n` +
        `You now have full access to our Women's Store, Events, and Entrepreneur Hub.\n\n` +
        `Open the app to explore everything available to you. 💜`,
    );
  } catch (error) {
    // WhatsApp confirmation failure must not break the webhook response
    logger.error({ event: 'whatsapp.confirmation.failed', userId, error });
  }
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function handleChargeSuccess(data: PaystackChargeSuccessData): Promise<void> {
  const { userId } = data.metadata;

  if (!userId) {
    logger.error({
      event: 'webhook.charge.success.missing_userId',
      reference: data.reference,
    });
    throw new Error('Missing userId in webhook metadata');
  }

  if (data.currency !== 'NGN') {
    logger.error({
      event: 'webhook.charge.success.wrong_currency',
      currency: data.currency,
      reference: data.reference,
    });
    throw new Error(`Unexpected currency: ${data.currency}. Expected NGN.`);
  }

  await activateSubscription(data);
  await sendSubscriptionConfirmation(userId, data);
}

// ─── Main webhook handler ─────────────────────────────────────────────────────

/**
 * Handles Paystack webhook events.
 *
 * Preconditions (enforced by middleware before this runs):
 * - Request body is raw JSON (express.raw middleware)
 * - x-paystack-signature has been verified (verifyPaystackSignature middleware)
 *
 * @param req Express request — body is the parsed Paystack event
 * @param res Express response — must return 200 to acknowledge receipt
 */
export async function handlePaystackWebhook(req: Request, res: Response): Promise<void> {
  const event = req.body as PaystackWebhookEvent;
  const eventId = String((event.data as { id?: number }).id ?? `${event.event}-${Date.now()}`);

  // ── Idempotency check ──────────────────────────────────────────────────────
  if (await isAlreadyProcessed(eventId)) {
    logger.info({ event: 'webhook.duplicate', eventId, type: event.event });
    res.status(200).json({ status: 'already_processed' });
    return;
  }

  // ── Route event to handler ─────────────────────────────────────────────────
  try {
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data as PaystackChargeSuccessData);
        break;

      // Add additional event types here as needed (e.g. subscription.disable)
      default:
        logger.info({ event: 'webhook.unhandled', type: event.event });
        break;
    }

    // Mark as processed AFTER successful handling
    await markAsProcessed(eventId);

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error({
      event: 'webhook.processing.error',
      type: event.event,
      eventId,
      error,
    });

    // Return 500 so Paystack retries the webhook
    // Do NOT mark as processed — allow retry
    res.status(500).json({ status: 'error' });
  }
}

// ─── Signature verification middleware ────────────────────────────────────────
// Apply this middleware BEFORE handlePaystackWebhook in your route definition.
// This is also defined in src/api/middleware/paystack-signature.ts.
// Duplicated here for reference and standalone skill usage.

export function verifyPaystackSignature(
  req: Request,
  res: Response,
  next: () => void,
): void {
  const signature = req.headers['x-paystack-signature'] as string | undefined;
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;

  if (!signature || !secret) {
    logger.warn({ event: 'webhook.signature.missing' });
    res.status(401).json({ error: 'Missing signature' });
    return;
  }

  const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));

  const hash = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');

  if (hash !== signature) {
    logger.warn({ event: 'webhook.signature.invalid' });
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  // Parse the raw body for downstream handlers
  req.body = JSON.parse(rawBody.toString());
  next();
}
