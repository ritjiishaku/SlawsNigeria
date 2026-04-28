// Subscription Gating Middleware - AGENTS.md Section 9
// Enforces subscriber vs non-subscriber access control

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Subscriber gating prompt (exact copy from AGENTS.md Section 9)
const SUBSCRIBER_GATE_PROMPT = "This content is available to SlawsNigeria subscribers. It takes less than a minute to subscribe and unlock full access. Would you like me to show you how?";

export interface SubscriptionGateRequest extends Request {
  user?: any;
  isSubscriber?: boolean;
}

// Middleware to check subscription status
export async function checkSubscription(
  req: SubscriptionGateRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.headers['user-id'] as string;

    if (!userId) {
      req.isSubscriber = false;
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (!user || !user.subscription || user.subscription.status !== 'active') {
      req.isSubscriber = false;
    } else {
      req.isSubscriber = true;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Middleware to enforce subscriber-only access
export function requireSubscriber(
  req: SubscriptionGateRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.isSubscriber) {
    return res.status(403).json({
      error: 'Subscriber access required',
      message: SUBSCRIBER_GATE_PROMPT,
      options: ['Subscribe Now', 'Learn More'],
      next_action: 'open_subscription'
    });
  }
  next();
}

// Apply gating to response data based on access level
export function applySubscriberGating(
  data: any,
  isSubscriber: boolean,
  accessLevelField: string = 'access_level'
): any {
  if (!isSubscriber && data[accessLevelField] === 'subscriber_only') {
    return {
      id: data.id,
      name: data.name || data.title,
      message: SUBSCRIBER_GATE_PROMPT,
      access_denied: true
    };
  }
  return data;
}

// User access rules (AGENTS.md Section 9 table)
export const ACCESS_RULES = {
  NON_SUBSCRIBER: {
    canSee: ['business overview', 'three pillar names', 'product/service names', 'event titles'],
    cannotSee: ['pricing', 'full descriptions', 'booking links', 'mentorship content']
  },
  SUBSCRIBER: {
    canSee: ['full access to all content', 'pricing', 'booking', 'personalised recommendations']
  }
};
