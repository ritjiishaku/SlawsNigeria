// Express Server - Main Entry Point
// Implements API routes with subscription gating and Slaws AI integration

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateResponse } from '../ai/response-generator';
import { checkNDPAConsent } from '../middleware/ndpa-consent';
import { checkSubscription, SubscriptionGateRequest } from './middleware/subscription-gate';
import subscriptionRoutes from './subscription-routes';
import whatsappWebhook from './whatsapp-webhook';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Slaws AI Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, userId, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'message and sessionId are required' });
    }

    // Check NDPA consent if userId provided
    if (userId) {
      const consentCheck = await checkNDPAConsent(userId);
      if (!consentCheck.allowed) {
        return res.status(403).json({
          error: 'NDPA Consent Required',
          message: consentCheck.message
        });
      }
    }

    // Get user subscription status
    const user = userId ? await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    }) : null;

    const isSubscriber = user?.subscription?.status === 'active';

    // Generate AI response
    const response = generateResponse({
      userMessage: message,
      userId,
      sessionId,
      isSubscriber: !!isSubscriber
    });

    // Log interaction (only if consent given)
    if (userId && isSubscriber !== undefined) {
      await prisma.interactionLog.create({
        data: {
          user_id: userId,
          session_id: sessionId,
          intent: response.intent_detected,
          message,
          response: response.message,
          resolved: !response.escalate,
          escalated_to: response.escalate ? '+23481058478551' : null,
          response_ms: 0 // TODO: calculate actual response time
        }
      });
    }

    return res.json(response);
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Products/Services (with subscriber gating)
app.get('/api/products', checkSubscription, async (req: SubscriptionGateRequest, res: Response) => {
  try {
    const products = await prisma.productService.findMany();

    // Apply gating (AGENTS.md Section 9)
    const gatedProducts = products.map(product => {
      if (!req.isSubscriber && product.access_level === 'subscriber_only') {
        return {
          id: product.id,
          name: product.name,
          category: product.category,
          message: "This content is available to SlawsNigeria subscribers. It takes less than a minute to subscribe and unlock full access. Would you like me to show you how?"
        };
      }
      return product;
    });

    return res.json(gatedProducts);
  } catch (error) {
    console.error('Products endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Events (with subscriber gating)
app.get('/api/events', checkSubscription, async (req: SubscriptionGateRequest, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'upcoming' }
    });

    // Apply gating (AGENTS.md Section 9)
    const gatedEvents = events.map(event => {
      if (!req.isSubscriber && event.access_level === 'subscriber_only') {
        return {
          id: event.id,
          title: event.title,
          type: event.type,
          date: event.date,
          message: "This content is available to SlawsNigeria subscribers. It takes less than a minute to subscribe and unlock full access. Would you like me to show you how?"
        };
      }
      return event;
    });

    return res.json(gatedEvents);
  } catch (error) {
    console.error('Events endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply subscription routes
app.use('/api/subscription', subscriptionRoutes);

// WhatsApp webhook (AGENTS.md Rule 1 - Critical P0)
app.use('/api/v1/webhooks/whatsapp', whatsappWebhook);

// Apply subscription check middleware to protected routes
app.use('/api/products', checkSubscription);
app.use('/api/events', checkSubscription);

// Start server
app.listen(PORT, () => {
  console.log(`SlawsNigeria API server running on port ${PORT}`);
});

export default app;
