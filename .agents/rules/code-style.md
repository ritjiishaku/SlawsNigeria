# Code Style Rules — SlawsNigeria AI Assistant

> Source: SNG-PRD-AI-001 v3.0
> These rules govern all code written in this project.
> Every agent must apply them consistently across every file it creates or modifies.

---

## 1. Language & Runtime

- **TypeScript** (strict mode) for all source files
- **Node.js 20 LTS** (minimum)
- **React Native + Expo** for mobile app
- Never use `any` type. If a type is genuinely unknown, use `unknown` and
  narrow it explicitly.
- Enable `"strict": true` in `tsconfig.json`. Do not disable strict checks.

---

## 2. File Naming

| Type | Convention | Example |
|---|---|---|
| Source files | kebab-case | `intent-classifier.ts` |
| React Native components | PascalCase | `SubscribeButton.tsx` |
| Test files | `<name>.test.ts` | `intent-classifier.test.ts` |
| Schema files | kebab-case | `user.schema.ts` |
| Route files | kebab-case | `subscription.routes.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Environment keys | SCREAMING_SNAKE_CASE | `PAYSTACK_SECRET_KEY` |

---

## 3. Folder Structure Within `src/`

```
src/
├── ai/
│   ├── intent-classifier.ts
│   ├── response-generator.ts
│   ├── context-manager.ts
│   └── types.ts                  # IntentType, ResponseContract, NextAction
├── api/
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── ai.routes.ts
│   │   ├── subscription.routes.ts
│   │   ├── product.routes.ts
│   │   ├── event.routes.ts
│   │   ├── volunteer.routes.ts
│   │   └── webhook.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── ai.controller.ts
│   │   ├── subscription.controller.ts
│   │   ├── product.controller.ts
│   │   ├── event.controller.ts
│   │   ├── volunteer.controller.ts
│   │   └── webhook.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT validation
│   │   ├── access-control.ts      # Subscriber vs non-subscriber
│   │   ├── paystack-signature.ts  # Webhook HMAC verification
│   │   └── error-handler.ts
│   └── validators/                # Zod schemas for request validation
├── db/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── services/
│   ├── payment/
│   │   ├── paystack.client.ts
│   │   ├── paystack.service.ts
│   │   └── types.ts
│   ├── whatsapp/
│   │   ├── whatsapp.client.ts
│   │   ├── whatsapp.service.ts
│   │   └── types.ts
│   └── automation/
│       ├── broadcast.service.ts
│       ├── email.service.ts       # Phase 3
│       └── social.service.ts     # Phase 3
├── admin/
│   ├── routes/
│   └── controllers/
├── app/                           # React Native / Expo
│   ├── screens/
│   ├── components/
│   ├── hooks/
│   ├── navigation/
│   └── store/
└── shared/
    ├── constants.ts
    ├── currency.ts                # ₦ formatting helpers
    ├── phone.ts                   # +234 format helpers
    └── errors.ts                  # Typed error classes
```

---

## 4. TypeScript Style

### Imports
Order imports as follows, with a blank line between each group:
1. Node.js built-ins (`path`, `crypto`, etc.)
2. Third-party packages
3. Internal project imports (use `@/` alias for `src/`)

```typescript
// ✅ Correct
import crypto from 'crypto';

import { Request, Response } from 'express';
import { z } from 'zod';

import { prisma } from '@/db/client';
import { PaystackService } from '@/services/payment/paystack.service';
```

### Functions
- Use named exports. Avoid default exports except for React Native screens.
- Use `async/await`. Never use `.then()` chains.
- Always type function parameters and return values.

```typescript
// ✅ Correct
export async function classifyIntent(message: string): Promise<IntentType> {
  // ...
}

// ❌ Wrong
export default async (message) => { ... }
```

### Error handling
- Always use typed error classes from `src/shared/errors.ts`
- Never swallow errors silently
- All async functions must have try/catch or propagate errors to the
  global error handler middleware

```typescript
// ✅ Correct
try {
  const result = await paystackService.initiate(payload);
  return result;
} catch (error) {
  throw new PaymentInitiationError('Failed to initiate Paystack payment', { cause: error });
}
```

### Zod validation
- All API request bodies MUST be validated with Zod before processing
- All Zod schemas live in `src/api/validators/`
- Never access `req.body` without validating it first

```typescript
// src/api/validators/subscription.validator.ts
import { z } from 'zod';

export const InitiateSubscriptionSchema = z.object({
  plan: z.enum(['basic', 'premium']),
  billing_cycle: z.enum(['monthly', 'quarterly', 'annually']),
});

export type InitiateSubscriptionInput = z.infer<typeof InitiateSubscriptionSchema>;
```

---

## 5. Currency Rules

- ALL monetary values are stored as `Decimal` in the database in **NGN**
- ALL monetary values displayed to users are formatted as **₦X,XXX.XX**
- Use the shared helper `src/shared/currency.ts` for formatting — never
  format inline

```typescript
// src/shared/currency.ts
export function formatNGN(amount: number | Decimal): string {
  const num = typeof amount === 'number' ? amount : amount.toNumber();
  return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ✅ Correct usage
const display = formatNGN(subscription.amount_paid); // "₦5,000.00"

// ❌ Wrong — never format inline
const display = `₦${plan.price}`;
```

---

## 6. Phone Number Rules

- ALL phone numbers stored and validated in `+234XXXXXXXXXX` format
- Use the shared helper `src/shared/phone.ts`

```typescript
// src/shared/phone.ts
export function normaliseNigerianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234')) return `+${digits}`;
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`;
  return `+234${digits}`;
}

export function isValidNigerianPhone(phone: string): boolean {
  return /^\+234[789][01]\d{8}$/.test(phone);
}
```

---

## 7. Formatting & Linting

- **Prettier** for formatting (enforced via pre-commit hook)
- **ESLint** with `@typescript-eslint` rules
- 2-space indentation
- Single quotes for strings
- Semicolons: yes
- Max line length: 100 characters
- Trailing commas: `'all'` (ES5+)

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

---

## 8. Testing Standards

- Test runner: **Vitest**
- All P0 features MUST have unit tests before the feature is marked complete
- Integration tests for all API routes
- Test file co-location: `src/ai/intent-classifier.test.ts` alongside `intent-classifier.ts`
- Naming convention: `describe('IntentClassifier', () => { it('should detect discovery intent', ...) })`
- Never test implementation details — test behaviour and outputs
- Mock all external services (Paystack, WhatsApp API) in tests

---

## 9. Git Conventions

- **Branch naming:** `feat/<ticket>-<description>`, `fix/<ticket>-<description>`
- **Commit messages:** Conventional Commits format
  - `feat:` new feature
  - `fix:` bug fix
  - `chore:` tooling/config
  - `docs:` documentation
  - `test:` tests only
  - `refactor:` no behaviour change
- Never commit directly to `main`
- Feature branches merged via Pull Request with at least one review
- Never commit `.env` — only `.env.example`
- Never commit `artifacts/` directory

---

## 10. Comments & Documentation

- All exported functions MUST have a JSDoc comment
- Comments explain **why**, not **what**
- TODO comments must include a ticket reference: `// TODO(SNG-123): explain`
- Remove all commented-out code before merging to main

```typescript
/**
 * Classifies the user's free-text message into one of the defined intent types.
 * Uses the configured LLM with a structured prompt to ensure reliable classification.
 * Falls back to 'unclear' intent if classification confidence is below threshold.
 */
export async function classifyIntent(message: string, sessionId: string): Promise<IntentType> {
  // ...
}
```
