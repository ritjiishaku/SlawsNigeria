# SKILL: WhatsApp Business API Integration

> Skill ID: whatsapp-integration
> Phase: P0 — Launch Blocker
> Source: AGENTS.md Section 2 (Critical Rules) + Meta for Developers Documentation

---

## Purpose

This skill defines how to implement the automated WhatsApp messaging system for SlawsNigeria. WhatsApp is the **primary channel** for automated notifications, broadcasts, and human escalation.

The integration MUST be reliable, secure, and handle the high-volume requirements of a launch-ready product.

---

## Environment Configuration

Add these to `.env`:

```env
WHATSAPP_ACCESS_TOKEN=eaag... (Permanent System User Token)
WHATSAPP_PHONE_NUMBER_ID=123456789...
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321...
WHATSAPP_VERIFY_TOKEN=random_string_for_handshake
WHATSAPP_APP_SECRET=for_signature_verification
```

---

## Core Workflows

### 1. Inbound Webhook (Receiving Messages)
- **GET /api/v1/webhooks/whatsapp**: Handle the Hub challenge for Meta verification.
- **POST /api/v1/webhooks/whatsapp**: Receive message notifications.
- **Security**: Verify the `x-hub-signature-256` header using `WHATSAPP_APP_SECRET`.

### 2. Automated Response Flow
1. Receive user message via webhook.
2. Route to **AI Engine** (Slaws) for intent classification.
3. If intent is resolved → Send automated reply via Cloud API.
4. If intent is unresolved/escalated → Route to human (Princess Ngozi) and notify user.

### 3. Outbound Notifications (Templates)
- Send ₦ payment confirmations after successful Paystack transactions.
- Send re-engagement prompts for incomplete onboarding.
- Send event booking confirmations.
- **Rule**: Templates MUST be approved by Meta before use.

### 4. Human Escalation
- When Slaws cannot resolve a query, trigger the escalation flow.
- Notify the user: "I'm connecting you with Princess Ngozi for further assistance."
- Forward the conversation context to the designated WhatsApp number (+23481058478551).

---

## API Implementation Patterns

### Sending a Message

```typescript
// src/services/whatsapp/whatsapp.client.ts
export async function sendMessage(to: string, message: string) {
  const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  await axios.post(url, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to, // Must be in +234XXXXXXXXXX format
    type: "text",
    text: { body: message }
  }, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` }
  });
}
```

---

## Critical Constraints

- **Localisation**: All phone numbers MUST be in `+234` format.
- **Currency**: All automated price mentions MUST be in **Nigerian Naira (₦)**.
- **Privacy**: NEVER log full PII (card details, IDs) in the Interaction Log. Mask sensitive data.
- **Reliability**: Return `200 OK` to Meta immediately to prevent retry loops; process logic asynchronously.

---

## Failure & Edge Cases

| Case | Behaviour |
|---|---|
| Webhook Timeout | Meta will retry. Ensure idempotency via `wamid` check. |
| User Blocks Bot | Log as "Undeliverable"; do not retry to avoid account flagging. |
| API Rate Limit | Implement exponential backoff for outbound broadcasts. |
| Media Fetch Failure | Fallback to text-only description of the content. |

---

## Testing

- Use **WhatsApp Test Numbers** provided in the Meta App Dashboard.
- Mock the WhatsApp Client in unit tests to avoid hitting Meta's API during CI.
- Verify signature validation logic with sample payloads from Meta docs.
