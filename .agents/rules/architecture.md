# Architecture Rules — SlawsNigeria AI Assistant

> Source: SNG-PRD-AI-001 v3.0
> These rules govern every architectural decision made in this project.
> No agent may deviate from these rules without explicit written approval
> from the product owner.

---

## 1. Architecture Pattern

This project uses a **modular monolith** architecture with clearly separated
concerns. Do NOT propose microservices — the team size, budget, and June 1
launch deadline make a distributed architecture inappropriate at this stage.

```
slawsnigeria/
├── src/
│   ├── ai/           # AI engine — intent, response, context
│   ├── api/          # HTTP layer — routes, middleware, controllers
│   ├── db/           # Database — schemas, migrations, queries
│   ├── services/     # Business logic — payment, whatsapp, automation
│   │   ├── payment/
│   │   ├── whatsapp/
│   │   └── automation/
│   ├── admin/        # CEO-facing admin panel (server-rendered or API)
│   └── app/          # Mobile app entry (React Native / Expo)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── PRD_v3.0.md
│   └── system-prompt-final.md
├── artifacts/        # Agent plans and logs — never commit
│   ├── plans/
│   └── logs/
├── .agents/
│   ├── rules/
│   └── skills/
├── AGENTS.md
└── .env.example
```

---

## 2. System Layers

### Client Layer
- **Mobile app (Android & iOS)** — PRIMARY platform, Phase 1
  - Framework: React Native with Expo (cross-platform, single codebase)
  - Entry point: `src/app/`
- **WhatsApp Interface** — Phase 1, via WhatsApp Business API
- **Website** — Phase 3 ONLY. Do not build it until Phase 1 and 2 are complete.

### API Layer
- RESTful API using **Node.js + Express** (or Fastify if performance requires)
- All routes live in `src/api/routes/`
- All controllers in `src/api/controllers/`
- All middleware in `src/api/middleware/`
- Route naming convention: `/api/v1/<resource>`
- Every route must be authenticated unless explicitly marked `@public`

### AI Engine
- Lives entirely in `src/ai/`
- Three modules, one responsibility each:

```
src/ai/
├── intent-classifier.ts    # Detects intent from free-text input
├── response-generator.ts   # Produces structured Response Contract objects
└── context-manager.ts      # Maintains session state
```

- The AI engine MUST return a valid **Response Contract** on every call.
  See `architecture.md` Section 6 for the contract definition.
- Never return raw LLM output to the client. Always parse and validate
  through the Response Contract schema first.

### Database Layer
- **PostgreSQL** as the primary database
- ORM: **Prisma** (type-safe, migration-friendly, works well with TypeScript)
- Schema files: `src/db/schema.prisma`
- Migrations: `src/db/migrations/`
- Seed data: `src/db/seed.ts`
- All monetary values stored as `Decimal` in **NGN (Nigerian Naira)**
- All phone numbers stored in `+234XXXXXXXXXX` format
- All address fields use **Nigerian state names** (not ISO codes)

### External Services
- **Paystack** — primary payment gateway for all ₦ transactions
- **Flutterwave** — fallback payment gateway
- **WhatsApp Business API** — automated messaging, broadcasts, group management
- All external service calls wrapped in `src/services/<service>/client.ts`
- All external service calls MUST have retry logic and timeout handling

---

## 3. Data Flow Rules

### Standard request flow
```
Mobile App → API (POST /api/v1/ai/chat)
  → auth middleware (validate JWT)
  → access control middleware (subscriber vs non-subscriber)
  → AI Engine (intent-classifier → response-generator)
  → context-manager (save session state)
  → Interaction Log (write to DB)
  → Response Contract (return to client)
```

### Payment flow
```
Mobile App → API (POST /api/v1/subscriptions/initiate)
  → auth middleware
  → Paystack service (initialise transaction)
  → Return checkout URL to client

Client → Paystack (user completes payment off-platform)

Paystack → API (POST /api/v1/webhooks/paystack) — webhook
  → signature verification middleware
  → subscription service (activate plan)
  → notification service (WhatsApp confirmation to user)
  → Response 200 OK to Paystack
```

### Escalation flow
```
AI Engine → intent = "support" + unresolved after 1 follow-up
  → set escalate = true in Response Contract
  → write escalation record to Interaction Log
  → trigger WhatsApp notification to Princess Ngozi
  → return escalation message to user
```

---

## 4. Authentication & Sessions

- Authentication: **JWT (JSON Web Tokens)**
  - Access token: 15-minute expiry
  - Refresh token: 30-day expiry, stored in httpOnly cookie
- All protected routes require `Authorization: Bearer <token>` header
- Session state for AI conversations stored in **Redis** (keyed by `session_id`)
- Session TTL: 30 minutes of inactivity, then expire
- `session_id` is a UUID generated on first message, returned to client,
  and sent on all subsequent messages in the same conversation

---

## 5. Access Control

Two tiers. This is a hard rule — never relax without PRD approval.

| Tier | Condition | Access |
|---|---|---|
| `NON_SUBSCRIBER` | `user.subscription_id = null` OR `subscription.status != 'active'` | Public content only: pillar names, product names, event titles |
| `SUBSCRIBER` | `subscription.status = 'active'` | Full access: pricing, descriptions, booking, mentorship |

- Access control middleware runs on EVERY AI and content route
- The middleware reads `subscription_status` from the User record (not the JWT)
  to prevent stale token exploits
- Non-subscribers hitting gated content ALWAYS receive the subscribe prompt —
  never a 403 error in the UI

---

## 6. Response Contract

Every response from the AI engine MUST conform to this TypeScript interface.
Reject and log any response that fails validation.

```typescript
interface ResponseContract {
  message: string;              // required — text delivered to user
  options: string[] | null;     // optional — quick reply buttons
  next_action: NextAction;      // required — system action
  intent_detected: IntentType;  // required — logged to Interaction Log
  escalate: boolean;            // required — true = route to Princess Ngozi
  language: 'en-NG' | 'pcm-NG'; // required — match user's input language
}

type NextAction =
  | 'show_categories'
  | 'show_product_detail'
  | 'open_subscription'
  | 'resume_onboarding'
  | 'show_event_detail'
  | 'show_volunteer_form'
  | 'escalate'
  | 'ask_clarification'
  | 'redirect_scope'
  | 'end_session';

type IntentType =
  | 'discovery'
  | 'product_enquiry'
  | 'purchase_intent'
  | 'onboarding'
  | 'event_enquiry'
  | 'volunteer_enquiry'
  | 'support'
  | 'unclear'
  | 'out_of_scope';
```

---

## 7. Environment Variables

All secrets and config in `.env`. Never hardcode. Use `.env.example` to
document required variables without values.

Required variables:
```
# App
NODE_ENV=
PORT=
APP_URL=

# Database
DATABASE_URL=

# Redis
REDIS_URL=

# JWT
JWT_SECRET=
JWT_REFRESH_SECRET=

# Paystack
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
PAYSTACK_WEBHOOK_SECRET=

# WhatsApp Business API
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# AI / LLM
AI_API_KEY=
AI_MODEL=

# Admin contact (Princess Ngozi escalation)
ADMIN_WHATSAPP_NUMBER=
```

---

## 8. Phase Gate Rules

Agents MUST respect phase boundaries. Do not build Phase 2 features
while Phase 1 is incomplete. Do not build Phase 3 at all until after
the June 1 launch.

| Phase | Scope | Deadline |
|---|---|---|
| Phase 1 | All P0 features + Event management + Volunteer system + WhatsApp | Before June 1, 2026 |
| Phase 2 | Analytics, personalisation, search, mentorship booking, admin KB | Within 60 days of launch |
| Phase 3 | Email automation, TikTok, ad rotation, website | Post-launch roadmap |

---

## 9. What Not to Build

Never propose or implement any of the following — they are explicitly out of scope:

- Payment processing infrastructure (Paystack/Flutterwave handle this entirely)
- Backend financial or accounting systems
- External marketplace integrations (Jumia, Konga, etc.)
- Full CRM system
- Physical logistics or delivery management
- The website (Phase 3 only — not before launch)
