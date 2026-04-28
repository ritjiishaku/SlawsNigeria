# SKILL: API Route Scaffolder

> Skill ID: api-route-scaffolder
> Phase: P0
> Source: SNG-PRD-AI-001 v3.0 + architecture.md + security.md + code-style.md

---

## Purpose

This skill defines how to scaffold new API endpoints for the SlawsNigeria
backend. Every route generated must follow the patterns defined in
`architecture.md`. No agent should create ad-hoc route patterns.

---

## Inputs

When asked to scaffold an API route, the agent needs:
1. **Resource name** — e.g. `subscription`, `event`, `volunteer`
2. **HTTP method** — GET, POST, PUT, PATCH, DELETE
3. **Path** — e.g. `/api/v1/subscriptions/initiate`
4. **Auth required?** — yes (most routes) or no (public routes only)
5. **Subscriber-only?** — yes if the route is gated to active subscribers
6. **Request body schema** — Zod schema definition
7. **Response shape** — what the endpoint returns on success

---

## Outputs

Each scaffolded route generates:
- `src/api/routes/<resource>.routes.ts` — route definitions
- `src/api/controllers/<resource>.controller.ts` — business logic
- `src/api/validators/<resource>.validator.ts` — Zod schema
- `tests/integration/<resource>.routes.test.ts` — integration test

---

## Standard Route Pattern

All routes follow this 5-layer pattern:

```
Route definition → Auth middleware → Access control → Validation → Controller
```

### Route file pattern

```typescript
// src/api/routes/subscription.routes.ts
import { Router } from 'express';

import { requireAuth } from '@/api/middleware/auth.middleware';
import { requireSubscriber } from '@/api/middleware/access-control';
import { validate } from '@/api/middleware/validate';
import {
  InitiateSubscriptionSchema,
  VerifySubscriptionSchema,
} from '@/api/validators/subscription.validator';
import { SubscriptionController } from '@/api/controllers/subscription.controller';

const router = Router();
const controller = new SubscriptionController();

// POST /api/v1/subscriptions/initiate
// Auth: required | Subscriber: not required (initiating subscription)
router.post(
  '/initiate',
  requireAuth,
  validate(InitiateSubscriptionSchema),
  controller.initiate,
);

// GET /api/v1/subscriptions/status
// Auth: required | Subscriber: not required (checking own status)
router.get(
  '/status',
  requireAuth,
  controller.getStatus,
);

// POST /api/v1/subscriptions/cancel
// Auth: required | Subscriber: required
router.post(
  '/cancel',
  requireAuth,
  requireSubscriber,
  controller.cancel,
);

export { router as subscriptionRoutes };
```

---

### Controller file pattern

```typescript
// src/api/controllers/subscription.controller.ts
import { Request, Response, NextFunction } from 'express';

import { PaystackService } from '@/services/payment/paystack.service';
import { prisma } from '@/db/client';
import { formatNGN } from '@/shared/currency';
import type { InitiateSubscriptionInput } from '@/api/validators/subscription.validator';

export class SubscriptionController {
  private paystackService: PaystackService;

  constructor() {
    this.paystackService = new PaystackService();
  }

  /**
   * Initiates a Paystack subscription payment and returns the checkout URL.
   * The subscription is not activated here — activation happens via webhook.
   */
  initiate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { plan, billing_cycle } = req.body as InitiateSubscriptionInput;
      const userId = req.user!.id;
      const userEmail = req.user!.email;

      const PLAN_PRICES: Record<string, Record<string, number>> = {
        basic: { monthly: 2500, quarterly: 7000, annually: 25000 },
        premium: { monthly: 5000, quarterly: 14000, annually: 50000 },
      };

      const amount = PLAN_PRICES[plan]?.[billing_cycle];
      if (!amount) {
        res.status(400).json({ error: 'Invalid plan or billing cycle' });
        return;
      }

      const result = await this.paystackService.initiateSubscription({
        userId,
        email: userEmail,
        plan,
        billing_cycle,
        amount,
        callback_url: `slawsnigeria://subscription/callback`,
      });

      res.status(200).json({
        authorization_url: result.authorization_url,
        reference: result.reference,
        amount_display: formatNGN(amount),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Returns the current subscription status for the authenticated user.
   */
  getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const subscription = await prisma.subscription.findUnique({
        where: { user_id: userId },
        select: {
          plan: true,
          status: true,
          billing_cycle: true,
          end_date: true,
          amount_paid: true,
          auto_renew: true,
        },
      });

      res.status(200).json({
        has_subscription: subscription !== null,
        subscription: subscription
          ? {
              ...subscription,
              amount_display: formatNGN(subscription.amount_paid.toNumber()),
            }
          : null,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancels auto-renewal for the subscriber's current plan.
   * The plan remains active until the end_date.
   */
  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      await prisma.subscription.update({
        where: { user_id: userId },
        data: { auto_renew: false },
      });

      res.status(200).json({ message: 'Auto-renewal cancelled. Your plan remains active until renewal date.' });
    } catch (error) {
      next(error);
    }
  };
}
```

---

### Validator file pattern

```typescript
// src/api/validators/subscription.validator.ts
import { z } from 'zod';

export const InitiateSubscriptionSchema = z.object({
  plan: z.enum(['basic', 'premium'], {
    errorMap: () => ({ message: 'Plan must be basic or premium' }),
  }),
  billing_cycle: z.enum(['monthly', 'quarterly', 'annually'], {
    errorMap: () => ({ message: 'Billing cycle must be monthly, quarterly, or annually' }),
  }),
});

export type InitiateSubscriptionInput = z.infer<typeof InitiateSubscriptionSchema>;
```

---

### Auth middleware pattern

```typescript
// src/api/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { prisma } from '@/db/client';

interface JWTPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Always read subscription status from DB — never trust JWT for access control
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        subscription: {
          select: { status: true, end_date: true },
        },
      },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      full_name: user.full_name,
      email: user.email ?? '',
      phone: user.phone,
      role: user.role,
      isSubscriber:
        user.subscription?.status === 'active' &&
        user.subscription.end_date > new Date(),
    };

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

---

### Access control middleware pattern

```typescript
// src/api/middleware/access-control.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Restricts route to active subscribers only.
 * Apply AFTER requireAuth middleware.
 */
export function requireSubscriber(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user?.isSubscriber) {
    res.status(200).json({
      gated: true,
      message:
        'This content is available to SlawsNigeria subscribers. ' +
        'It takes less than a minute to subscribe and unlock full access.',
      next_action: 'open_subscription',
    });
    return;
  }
  next();
}
```

---

### Validation middleware

```typescript
// src/api/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        issues: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
```

---

### Error handler middleware

```typescript
// src/api/middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/shared/logger';

export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log full error server-side with request context
  logger.error({
    message: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    userId: req.user?.id,
  });

  // Return generic message to client — never expose internals
  res.status(500).json({
    error: 'Something went wrong on our end. Please try again shortly.',
    next_action: 'escalate',
  });
}
```

---

## Scaffolding Checklist

When generating a new route, verify:

- [ ] Route file in `src/api/routes/<resource>.routes.ts`
- [ ] Controller file in `src/api/controllers/<resource>.controller.ts`
- [ ] Validator file in `src/api/validators/<resource>.validator.ts`
- [ ] `requireAuth` applied to all non-public routes
- [ ] `requireSubscriber` applied to all subscriber-gated routes
- [ ] `validate()` middleware applied to all POST/PUT/PATCH routes
- [ ] All monetary values formatted with `formatNGN()` in responses
- [ ] All phone numbers in `+234XXXXXXXXXX` format in responses
- [ ] Controller methods use `try/catch` and call `next(error)` on failure
- [ ] Integration test file created at `tests/integration/<resource>.routes.test.ts`
- [ ] Route registered in `src/api/index.ts` under `/api/v1/<resource>`
