# File: skills/paystack-integration/SKILL.md

# SKILL: Paystack Integration

> Skill ID: paystack-integration
> Phase: P0 — Launch Blocker
> Source: PRD (SlawsNigeria) + Paystack Docs

---

## Purpose

This skill defines how to implement secure and production-ready Paystack payment workflows for SlawsNigeria.

It handles:

* Payment initialization
* Transaction verification
* Webhook processing

All payments are processed in **Nigerian Naira (NGN)**.

The system MUST NOT store or process raw card data. All sensitive payment handling is delegated to Paystack.

---

## Required Environment Variables

Add the following to `.env`:

```env
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

### Rules

* Use `sk_test_` and `pk_test_` keys in development
* NEVER expose `PAYSTACK_SECRET_KEY` on the client
* Store all secrets securely using environment configuration

---

## Payment Flow Architecture

The system MUST follow this sequence:

1. **Initialize Payment**

   * Backend calls Paystack `/transaction/initialize`
   * Returns `authorization_url` and `reference`

2. **User Completes Payment**

   * User is redirected to Paystack hosted checkout

3. **Verification**

   * Backend verifies transaction using `reference`

4. **Webhook Confirmation (Source of Truth)**

   * Paystack sends event to webhook endpoint
   * System validates signature and processes event

5. **Persist & Update State**

   * Store transaction details
   * Update user subscription status

> Webhook confirmation MUST be treated as the source of truth.

---

## API Routes Definition

### 1. Initialize Payment

**Endpoint**

```
POST /api/v1/payments/initialize
```

**Request Body**

```json
{
  "userId": "string",
  "email": "string",
  "amount": 5000,
  "callback_url": "string"
}
```

**Response**

```json
{
  "authorization_url": "string",
  "access_code": "string",
  "reference": "string"
}
```

**Errors**

* 400 → Invalid input
* 503 → Paystack unavailable

---

### 2. Verify Transaction

**Endpoint**

```
GET /api/v1/payments/verify/:reference
```

**Response**

```json
{
  "status": "success | failed | abandoned",
  "amount": 500000,
  "currency": "NGN",
  "paid_at": "string"
}
```

**Errors**

* 404 → Reference not found
* 500 → Verification failed

---

### 3. Paystack Webhook

**Endpoint**

```
POST /api/v1/webhooks/paystack
```

**Headers**

```
x-paystack-signature
```

**Behavior**

* Validate signature
* Process event
* Return `200 OK` immediately after successful handling

---

## Webhook Handling

### Signature Validation

* Compute HMAC SHA512 of raw request body
* Compare with `x-paystack-signature`
* Reject request if invalid

### Events to Handle

* `charge.success` → Mark payment successful and update system state

### Idempotency

* Store processed event references
* Ignore duplicate events
* Use Redis or DB-based locking

---

## Data Handling

The system MUST persist the following:

### Transaction Data

* reference
* userId
* amount (stored in kobo)
* currency
* status
* paid_at

### Subscription / Payment Mapping

* reference → payment record
* payment record → userId

All data MUST align strictly with PRD-defined models.

---

## Security Rules

* NEVER expose `PAYSTACK_SECRET_KEY` to frontend
* ALWAYS validate all incoming request payloads
* Webhook endpoint MUST use raw body parsing
* ALWAYS verify Paystack webhook signatures
* Prevent replay attacks using idempotency checks
* Use HTTPS for all payment-related endpoints
* Do NOT trust client-side payment success — verify server-side

---

## Failure & Edge Cases

Handle the following scenarios:

* **Payment Failed**

  * Mark transaction as failed
  * Do not activate service

* **Abandoned Payment**

  * Mark as abandoned after timeout
  * Allow retry

* **Duplicate Webhook Events**

  * Detect via reference
  * Ignore duplicates safely

* **Verification Mismatch**

  * If amount or currency differs → flag as suspicious
  * Do NOT process

* **Paystack Downtime**

  * Return 503
  * Retry logic handled at client level

---

## Inputs & Outputs

### Initialize Payment Input

```ts
{
  userId: string;
  email: string;
  amount: number; // in NGN
  callback_url: string;
}
```

### Initialize Payment Output

```ts
{
  authorization_url: string;
  access_code: string;
  reference: string;
}
```

### Verify Transaction Output

```ts
{
  status: 'success' | 'failed' | 'abandoned';
  amount: number;
  currency: string;
  paid_at: string;
}
```

---

## Usage Pattern

### Step 1 — Initialize Payment

```ts
const response = await paystack.initializeTransaction({
  email,
  amount: amount * 100,
  callback_url,
});
```

---

### Step 2 — Verify Transaction

```ts
const verification = await paystack.verifyTransaction(reference);
```

---

### Step 3 — Handle Webhook

* Validate signature
* Confirm `charge.success`
* Update database
* Return 200

---

## Testing Guidelines

* Use Paystack test keys (`sk_test_`, `pk_test_`)
* Mock Paystack API in unit tests
* NEVER call live Paystack in tests

Example:

```ts
vi.mock('@/services/paystack.client');
```

---

## Notes

* Webhook is the **single source of truth**
* All monetary values MUST be handled in kobo internally
* System MUST remain consistent even under retries or failures

---
