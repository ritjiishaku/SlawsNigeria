// WhatsApp Webhook Handler - AGENTS.md Rule 1 (Critical P0)
// Handles inbound messages, escalation, and automated replies

import express, { Request, Response, NextFunction } from 'express';
import {
  verifySignature,
  parseWebhook,
  sendMessage,
  sendEscalationNotification,
} from '../services/whatsapp/whatsapp-client';
import { classifyIntent, getActionForIntent } from '../ai/intent-classifier';
import { generateResponse } from '../ai/response-generator';
import { checkNDPAConsent } from '../middleware/ndpa-consent';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// =================== WEBHOOK VERIFICATION (GET) ===================
// Meta requires this for initial webhook setup (AGENTS.md Skill)
router.get('/webhooks/whatsapp', (req: Request, res: Response) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// =================== INBOUND MESSAGE (POST) ===================
router.post(
  '/webhooks/whatsapp',
  express.raw({ type: 'application/json' }), // Raw body for signature verification
  async (req: Request, res: Response, next: NextFunction) => {
    // Verify signature (AGENTS.md Skill - Security)
    const signature = req.headers['x-hub-signature-256'] as string;
    
    if (!verifySignature(signature, req.body)) {
      console.error('Invalid webhook signature');
      return res.sendStatus(401);
    }

    // Parse webhook payload
    const payload = JSON.parse(req.body.toString());
    const messageData = parseWebhook(payload);

    if (!messageData) {
      // Return 200 immediately to prevent Meta retries (AGENTS.md Skill)
      return res.sendStatus(200);
    }

    const { messageId, from, text, timestamp } = messageData;

    // Process message asynchronously (return 200 immediately)
    setImmediate(() => processInboundMessage(messageId, from, text));

    // Return 200 OK immediately (AGENTS.md Skill - Reliability)
    return res.sendStatus(200);
  }
);

// =================== MESSAGE PROCESSING ===================
async function processInboundMessage(messageId: string, from: string, text: string) {
  try {
    // Find or create user by phone (+234 format enforced)
    let user = await prisma.user.findFirst({
      where: { phone: from }
    });

    if (!user) {
      // Create temporary user record (NDPA consent not given yet)
      user = await prisma.user.create({
        data: {
          full_name: 'WhatsApp User',
          phone: from,
          state: 'Lagos', // Default to Lagos for initial contact
          gender: 'female', // Slaws is primarily for women
          age_group: 'age_20_30',
          role: 'customer',
          consent_given: false,
          onboarding_stage: 'not_started',
        }
      });
    }

    // Check NDPA consent (AGENTS.md Section 4, Rule 4)
    if (!user.consent_given) {
      await sendMessage({
        to: from,
        messageId,
        message: 'Welcome to SlawsNigeria! Under Nigeria\'s Data Protection Act 2023, we need your consent before storing your information. Please register via our app first.',
      });
      return;
    }

    // Get subscription status separately
    const subscription = await prisma.subscription.findUnique({
      where: { user_id: user.id }
    });
    const isSubscriber = subscription?.status === 'active';

    // Route to AI Engine (Slaws) for intent classification (AGENTS.md Skill)
    const classification = classifyIntent(text);
    const intent = classification.intent;
    const nextAction = getActionForIntent(intent);

    // Generate Slaws response
    const slawsResponse = generateResponse({
      userMessage: text,
      userId: user.id,
      sessionId: `whatsapp_${user.id}_${Date.now()}`,
      isSubscriber,
    });

    // Send automated reply via WhatsApp
    await sendMessage({
      to: from,
      messageId,
      message: slawsResponse.message,
    });

    // Handle escalation (AGENTS.md Skill - Human Escalation)
    if (slawsResponse.escalate || nextAction === 'escalate') {
      await sendEscalationNotification(
        from,
        user.full_name,
        text,
        `whatsapp_${user.id}`
      );

      await sendMessage({
        to: from,
        message: "I'm connecting you with Princess Ngozi for further assistance. She'll be with you shortly.",
      });
    }

    // Log interaction (AGENTS.md Section 6 - Interaction Log)
    await prisma.interactionLog.create({
      data: {
        user_id: user.id,
        session_id: `whatsapp_${user.id}_${Date.now()}`,
        intent,
        message: text,
        response: slawsResponse.message,
        resolved: !slawsResponse.escalate,
        escalated_to: slawsResponse.escalate ? '+23481058478551' : null,
        response_ms: 0,
      },
    });
  } catch (error) {
    console.error('Message processing error:', error);
  }
}

export default router;
