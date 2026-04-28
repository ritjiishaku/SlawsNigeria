# Security Rules — SlawsNigeria AI Assistant

> Source: SNG-PRD-AI-001 v3.0 + Nigeria Data Protection Act 2023 (NDPA)
> These rules are non-negotiable. Every agent must apply them to every
> feature it builds. Security is not optional or post-MVP.

---

## 1. Authentication

### JWT Configuration
- Access tokens expire in **15 minutes**
- Refresh tokens expire in **30 days**, stored in `httpOnly`, `Secure`, `SameSite=Strict` cookies
- Token signing algorithm: **HS256** minimum, **RS256** preferred in production
- JWT secret minimum length: 256 bits (32 random bytes)
- Never include sensitive data (passwords, card info) in JWT payload
- Token payload must include: `userId`, `role`, `subscriptionStatus`, `iat`, `exp`

### Password Policy
- Minimum length: 8 characters
- Must include: uppercase, lowercase, number
- Hash with **bcrypt**, cost factor **12**
- Never store or log plaintext passwords — ever

### Refresh Token Rotation
- Issue a new refresh token on every refresh request
- Invalidate the old refresh token immediately
- Store refresh token hash (not plaintext) in the database
- On suspected token theft (same refresh token used twice): revoke all sessions
  for that user and notify via WhatsApp

---

## 2. API Security

### Every API route must:
- Validate the request body with a **Zod schema** before any processing
- Return generic error messages to the client (never expose stack traces)
- Log detailed errors server-side with request ID for debugging
- Rate-limit appropriately (see Section 3)

### HTTP headers (set via `helmet` middleware)
```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

### CORS
- Whitelist only the mobile app origin and the admin panel origin
- Never use `origin: '*'` in production
- Preflight cache: 24 hours

### Request size limits
- JSON body: 10KB max for most routes
- File uploads (admin content): 10MB max, validated MIME type
- Reject oversized requests with 413

---

## 3. Rate Limiting

Apply rate limiting at the API gateway / middleware level using `express-rate-limit`
with a Redis store for distributed environments.

| Endpoint | Limit | Window |
|---|---|---|
| `POST /api/v1/auth/login` | 5 requests | 15 minutes per IP |
| `POST /api/v1/auth/register` | 3 requests | 1 hour per IP |
| `POST /api/v1/ai/chat` | 30 requests | 1 minute per user |
| `POST /api/v1/subscriptions/initiate` | 10 requests | 1 hour per user |
| `POST /api/v1/webhooks/paystack` | 100 requests | 1 minute per IP |
| All other authenticated routes | 60 requests | 1 minute per user |
| All other public routes | 20 requests | 1 minute per IP |

On rate limit hit: return `429 Too Many Requests` with `Retry-After` header.

---

## 4. Payment Security (Paystack)

### Cardinal rule
> The platform NEVER touches raw card numbers, CVVs, or expiry dates.
> All card data is handled exclusively by Paystack's hosted checkout.

### Webhook signature verification
Every incoming Paystack webhook request MUST be verified before processing.

```typescript
// src/api/middleware/paystack-signature.ts
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function verifyPaystackSignature(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const signature = req.headers['x-paystack-signature'] as string;
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;

  if (!signature || !secret) {
    res.status(401).json({ error: 'Missing signature' });
    return;
  }

  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== signature) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  next();
}
```

### Webhook idempotency
- Every webhook event has a unique `event.id` from Paystack
- Before processing, check if this `event.id` has been processed before
  (store processed event IDs in Redis with 7-day TTL)
- If already processed: return `200 OK` immediately (do not reprocess)
- This prevents duplicate subscription activations

### Paystack transaction verification
- After receiving a `charge.success` webhook, ALWAYS call Paystack's
  `/transaction/verify/:reference` endpoint to confirm the amount and status
- Never activate a subscription based on webhook data alone — always verify

### Subscription references
- Store `payment_ref` (Paystack transaction reference) on every Subscription record
- Never delete payment references — they are audit records

---

## 5. Data Protection (NDPA 2023)

Nigeria's Data Protection Act 2023 is the governing law. Non-compliance
is a legal risk. Every agent building data-handling features must follow these rules.

### Consent (mandatory)
- `consent_given` on the User record MUST be `true` before ANY data is
  written to the database
- Consent is collected via an explicit checkbox during registration —
  not pre-ticked, not bundled into Terms of Service
- Consent must be recorded with a timestamp: `consent_given_at: DateTime`
- If a user declines consent, no account may be created

### Data minimisation
- Collect ONLY the fields defined in the User schema
- Do not add extra tracking fields without PRD approval
- Do not log request bodies in production (they may contain personal data)

### Data access & deletion
- Users may request: (a) a copy of their data, (b) correction, (c) deletion
- These requests are handled manually by Princess Ngozi via WhatsApp
  (automated self-service is Phase 2)
- Build an admin endpoint: `GET /api/v1/admin/users/:id/export` for data export
- Build an admin endpoint: `DELETE /api/v1/admin/users/:id` for deletion
  (soft delete with 30-day retention before hard delete)

### Data isolation
- One user's data MUST never be accessible to another user
- This includes AI conversation history, subscription status, order data
- The AI engine must never include another user's data in a response

### Sensitive data in logs
- Never log: passwords, tokens, card details, full phone numbers, full email addresses
- Mask sensitive fields: `+234****5678`, `user@***.com`
- Conversation content (AI messages) are logged to the Interaction Log schema
  for analytics — they must never appear in application logs (stdout/stderr)

### Data retention
- Interaction Logs: 12-month retention, then anonymise (null user_id)
- Refresh tokens: 30-day TTL, then delete
- Soft-deleted users: 30-day retention, then hard delete all PII
- Payment references: indefinite retention (financial audit requirement)

### NDPC registration
- If the platform processes data of more than **1,000 data subjects annually**,
  register with the Nigeria Data Protection Commission (NDPC) as a data controller
- Princess Ngozi is the designated Data Protection Officer (DPO)

---

## 6. Secrets Management

- All secrets in `.env` — never hardcoded
- `.env` is gitignored — never commit it
- `.env.example` documents all required keys with placeholder values
- In production: use a secrets manager (Google Secret Manager, AWS Secrets Manager)
- Rotate JWT secrets and Paystack webhook secrets if compromise is suspected
- Never log environment variable values

---

## 7. Input Sanitisation

- Sanitise all user-supplied text before passing to the AI engine
  (strip HTML, trim whitespace, enforce max length: 2,000 characters per message)
- Sanitise all admin-supplied content before storing (strip script tags)
- Use parameterised queries via Prisma — never build raw SQL strings with user input
- Validate all UUIDs before using them as database lookup keys

---

## 8. Infrastructure Security

- HTTPS only in production — redirect all HTTP to HTTPS
- Database: not publicly accessible — only reachable from the API server
- Redis: password-protected, not publicly accessible
- Admin panel: restricted to known IP addresses OR behind additional auth layer
- WhatsApp webhook endpoint: verify the `verify_token` on subscription handshake
- All external API calls use HTTPS — never HTTP

---

## 9. Security Incident Response

If a security incident is suspected:
1. Immediately revoke all active JWT and refresh tokens for affected users
2. Rotate the compromised secret
3. Notify Princess Ngozi via WhatsApp immediately
4. Document the incident in `artifacts/security/incident-<date>.md`
5. If personal data may have been exposed, NDPA 2023 requires notification
   to affected users and the NDPC within 72 hours
