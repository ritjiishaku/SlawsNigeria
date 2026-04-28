# AGENTS.md — SlawsNigeria AI Assistant

> This file is the single behavioural rulebook for all agents working in this
> repository. Every agent — regardless of model — reads this file before taking
> any action. Do not skip or summarise it.

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Product** | SlawsNigeria AI Assistant (Slaws) |
| **Document ref** | SNG-PRD-AI-001 v3.0 |
| **Owner** | Princess Ngozi Chinedu — CEO, SlawsNigeria |
| **Contact** | igbokweprincess57@gmail.com · WhatsApp (+23481058478551) |
| **Hard launch deadline** | Before June 1, 2026 |
| **PRD location** | `/docs/SlawsNigeria_PRD_v1.0.md` |

SlawsNigeria is a Nigerian multi-dimensional women's services platform operating
across three pillars: **Event Management**, **Women's Store**, and
**Entrepreneur Hub**. The AI assistant (Slaws) replaces entirely manual
operations with structured, intelligent automation. The platform is built
**Nigeria-first**: all prices in ₦, phone numbers in +234 format, Nigerian
states for address fields, and Paystack/Flutterwave for payments.

---

## 2. Critical Rules — Read These First

These are non-negotiable. No agent may override them.

1. **Automation is a hard launch blocker.** If the automation system
   (WhatsApp, email, social media) is not operational, the product does not
   ship. Treat every task related to automation as P0.

2. **Never display foreign currencies.** All monetary values must be in
   Nigerian Naira (₦ / NGN). No USD, GBP, EUR — unless the user explicitly
   requests a conversion.

3. **Never store card details.** Payment data is handled exclusively by
   Paystack or Flutterwave. The platform never touches raw card numbers, CVVs,
   or expiry dates.

4. **NDPA 2023 consent is mandatory.** No user data may be written to any
   database until `consent_given = true` on the User record. This is a legal
   requirement under Nigeria's Data Protection Act 2023.

5. **Do not invent data.** If a schema field, API response, or knowledge base
   entry does not exist, surface the gap — do not fabricate values.

6. **Subscriber access gates are enforced everywhere.** Non-subscribers must
   never see pricing, full service descriptions, event booking links, or
   mentorship content. The subscribe prompt must appear at every gated
   touchpoint.

7. **Ask before destructive actions.** Never run `rm -rf`, drop tables, or
   delete production data without explicit confirmation. When in doubt, create
   an artifact plan and wait for approval.

---

## 3. Architecture Overview

```
Client Layer
  ├── Mobile App (Android & iOS) — PRIMARY platform, Phase 1
  ├── WhatsApp Interface — community, broadcasts, Slaws access, Phase 1
  └── Website — discoverability only, Phase 3

API Layer
  └── Request Handler & Router — routes to AI engine or database

AI Engine
  ├── Intent Classifier — detects intent from free-text input
  ├── Response Generator — produces structured responses
  └── Context Manager — maintains session state

Database Layer
  ├── Users
  ├── Subscriptions
  ├── Products / Services
  ├── Events
  ├── Volunteers
  └── Interaction Logs

External Services
  ├── Paystack / Flutterwave — ₦ payment processing
  └── WhatsApp Business API — automated messaging & broadcasts
```

**Standard flow:**
`User → Client → API → AI Engine → Database → Response → User`

**Payment flow:**
`User → Client → API → Paystack/Flutterwave → Confirmation → API → Database → User`

**Escalation flow:**
`User → Client → AI Engine → Unresolved → WhatsApp Fallback → Princess Ngozi`

---

## 4. Project Structure

```
/
├── AGENTS.md                  # ← you are here
├── GEMINI.md                  # Antigravity-specific overrides (optional)
├── docs/
│   ├── PRD_v3.0.md            # Full product requirements document
│   └── system-prompt-final.md # Slaws AI assistant system prompt
├── src/
│   ├── ai/                    # Intent classifier, response generator, context manager
│   ├── api/                   # Request handlers and routers
│   ├── db/                    # Database schemas and migrations
│   │   └── schemas/           # One file per schema (see Section 6)
│   ├── services/
│   │   ├── payment/           # Paystack / Flutterwave integration
│   │   ├── whatsapp/          # WhatsApp Business API integration
│   │   └── automation/        # Broadcast, email, social media automation
│   ├── admin/                 # CEO-facing admin panel
│   └── app/                   # Mobile app entry point (Android & iOS)
├── tests/                     # All tests — unit, integration, e2e
└── artifacts/                 # Agent plans, logs, screenshots (do not commit)
    ├── plans/
    └── logs/
```

---

## 5. Feature Priority Reference

Agents must respect this priority order when making implementation decisions.

### P0 — Launch blockers (ship nothing without these)

- Conversational AI engine (Slaws) — intent detection, structured responses, session context
- Automation system — WhatsApp, email, social media (**critical — see Rule 1**)
- Service discovery & catalogue — subscriber-gated pricing
- Subscription funnel & billing in ₦ — Paystack / Flutterwave
- User registration & NDPA 2023 consent flow (**see Rule 4**)
- Access control — subscriber vs non-subscriber gating (**see Rule 6**)
- Onboarding flow with user state tracking
- Fallback routing to WhatsApp (human escalation)
- Mobile app — Android & iOS

### P1 — Required within 60 days of launch

- Event management — listing, booking, admin (VIP / standard / professional)
- Volunteer registration & management system
- Contract & digital agreement system
- WhatsApp channel & group integration
- Personalisation engine
- Analytics & reporting dashboard (CEO-facing)
- Search functionality
- Mentorship & consulting booking

### P2 — Post-launch roadmap

- Email marketing automation
- TikTok integration
- Ad rotation & reposting automation
- Voice assistant integration
- AI-powered course recommendations
- Website (supporting the app)

---

## 6. Data Schemas

All schemas live in `src/db/schemas/`. Nigerian standards apply throughout.
Reference these when creating, querying, or migrating data.

### User
```
id              UUID        PK — auto-generated
full_name       String      required
phone           String      +234XXXXXXXXXX format — required
email           String|null optional
state           String      Nigerian state (e.g. Lagos, Abuja FCT, Rivers)
gender          Enum        female | male | prefer_not_to_say
age_group       Enum        teen | 20-30 | 31-45 | 46-60 | 61-70 | 70+
role            Enum        customer | entrepreneur | parent | teen | volunteer
subscription_id UUID|null   FK → Subscription
onboarding_stage Enum       not_started | in_progress | complete
joined_at       DateTime    auto-set on registration
last_active     DateTime    updated each session
consent_given   Boolean     NDPA 2023 — must be true before any data is stored
```

### Subscription
```
id              UUID        PK
user_id         UUID        FK → User
plan            Enum        free | basic | premium
status          Enum        active | expired | cancelled | pending
amount_paid     Decimal     in Nigerian Naira (₦)
billing_cycle   Enum        monthly | quarterly | annually
start_date      Date
end_date        Date
auto_renew      Boolean     default: true
payment_ref     String      Paystack or Flutterwave transaction reference
created_at      DateTime    auto-set
```

### Product / Service
```
id              UUID        PK
name            String      required
category        Enum        women_store | event_service | mentorship | course | consulting
description     String      subscriber-gated
price           Decimal     in Nigerian Naira (₦)
currency        String      default: NGN — never display foreign currency
availability    Enum        in_stock | out_of_stock | coming_soon
access_level    Enum        public | subscriber_only
media_urls      String[]    images and video links
tags            String[]    for search and filtering
created_at      DateTime
updated_at      DateTime    auto-updated on edit
```

### Event
```
id              UUID        PK
title           String      required
type            Enum        standard | VIP | professional | private
description     String      subscriber-gated
date            Date
time            Time
location        String      Nigerian city and venue name
state           String      Nigerian state
capacity        Integer|null null = unlimited
price           Decimal     in ₦; 0 if free
access_level    Enum        public | subscriber_only
status          Enum        upcoming | ongoing | completed | cancelled
booking_link    String|null
created_at      DateTime
```

### Volunteer
```
id               UUID         PK
user_id          UUID         FK → User
role             Enum         customer_service | inventory | executive | social_media | other
skills           String[]     self-reported
availability     Enum         full_time | part_time | weekends_only
status           Enum         applied | under_review | active | inactive | rejected
agreement_signed Boolean      must be true before status → active
onboarded_at     DateTime|null set when status becomes active
created_at       DateTime
```

### Interaction Log
```
id              UUID        PK
user_id         UUID        FK → User (null if unauthenticated)
session_id      UUID        groups messages within one conversation
intent          String      detected intent (e.g. discovery, purchase_intent)
message         String      raw user message
response        String      Slaws response delivered
resolved        Boolean     true = AI resolved; false = escalated
escalated_to    String|null WhatsApp number if escalated
response_ms     Integer     response time in milliseconds
created_at      DateTime
```

---

## 7. Intent → Action Mapping

The AI engine must map free-text input to one of these intents and execute
the corresponding action. No other intents should be invented.

| Intent | Action | Key rule |
|---|---|---|
| `discovery` | Present three service pillars | Names only for non-subscribers |
| `product_enquiry` | Retrieve product/service details | Full details for subscribers; name + subscribe prompt for non-subscribers |
| `purchase_intent` | Trigger subscription funnel | Show ₦ plans (monthly / quarterly / annual) |
| `onboarding` | Start or resume onboarding | Check `onboarding_stage`; resume from last completed step |
| `event_enquiry` | Show event listing | Name visible to all; full details + booking for subscribers only |
| `volunteer_enquiry` | Explain roles + registration link | Never speculate on compensation |
| `support` | Resolve or escalate | Escalate after one unanswered follow-up |
| `unclear` | Ask one clarifying question | Never guess intent |
| `out_of_scope` | Redirect to platform scope | Politely decline; offer products/events/mentorship |

---

## 8. Response Contract

Every response object generated by the AI engine must include these fields.
Agents writing the AI layer must enforce this contract.

```json
{
  "message": "string — required",
  "options": ["array of quick replies — optional, null if not applicable"],
  "next_action": "string — required (show_catalogue | open_subscription | escalate | end_session | ...)",
  "intent_detected": "string — required, logged to Interaction Log",
  "escalate": false,
  "language": "en-NG | pcm-NG"
}
```

**Language rule:** match the language the user writes in. Default to
`en-NG` (Standard Nigerian English). Support `pcm-NG` (Nigerian Pidgin).
Never switch language mid-session without the user initiating it.

---

## 9. Access Control Rules

| User state | What they can see |
|---|---|
| Non-subscriber | Business overview, three pillar names, product/service names, event titles |
| Non-subscriber | Cannot see: pricing, full descriptions, booking links, mentorship content |
| Subscriber | Full access to all content, pricing, booking, personalised recommendations |

**Non-subscriber gated prompt (use this exact copy):**
> "This content is available to SlawsNigeria subscribers. It takes less than a
> minute to subscribe and unlock full access. Would you like me to show you how?"

---

## 10. Payment Flow

Agents implementing the payment module must follow this exact flow.
No card data touches the platform.

```
1. User selects a subscription plan
   → Slaws presents plans with ₦ pricing and billing cycle options

2. Payment initiated
   → App opens Paystack or Flutterwave checkout
   → Transaction reference generated

3A. Payment successful
   → Subscription record created: status = active
   → payment_ref stored
   → User notified via app and WhatsApp
   → Post-payment onboarding flow triggered immediately

3B. Payment failed
   → User prompted to retry
   → Failure logged
   → Subscription remains inactive

4. Renewal — auto_renew = true
   → System charges on renewal date
   → User notified 3 days prior
   → payment_ref updated on success

5. Renewal failed or auto_renew = false
   → Subscription status → expired
   → User notified and prompted to renew manually
```

---

## 11. Edge Cases

Handle all of the following gracefully. Never leave a user in a broken state.

| Case | Trigger | Behaviour |
|---|---|---|
| Payment failure | Gateway returns failure | Prompt retry; offer WhatsApp support |
| Incomplete onboarding | User exits mid-flow | Save `onboarding_stage`; resume next session |
| Session timeout | No activity for 10+ minutes | Send re-engagement prompt; end session gracefully |
| Missing knowledge base data | Valid query, no data found | Do not guess — acknowledge gap; route to Princess Ngozi |
| Duplicate subscription | Active subscriber tries to subscribe again | Notify of active plan; offer upgrade or renewal |
| Expired subscription | Expired user requests premium content | Notify expiry; present renewal options |
| Abusive message | Offensive or off-topic input | Politely redirect; do not engage further |
| API/technical error | Engine or database error | Standard error message; log error; direct to WhatsApp |
| NDPA consent not given | User proceeds without consent | Block data storage; re-prompt consent |

---

## 12. Admin System Requirements

The admin panel is a P0 requirement. Without it, content cannot be managed.
Agents implementing admin features must cover:

**P0 — Phase 1 (required for launch)**
- Add, edit, remove products and services (with publish scheduling)
- Create and manage events (all Event schema fields)
- Update pricing in ₦ (changes must reflect immediately in Slaws responses)
- Upload and manage content (images, videos, descriptions)
- View and manage volunteer applications (approve / reject / track agreements)
- Manage subscription plans and pricing

**P1 — Phase 2 (required within 60 days)**
- Analytics and reporting dashboard (daily users, revenue in ₦, conversion rate, CSAT)
- Manage escalated queries (view all Slaws escalations; mark resolved)
- Update the AI knowledge base (FAQs, service descriptions, policy updates)

---

## 13. Non-Functional Requirements

Agents must not propose solutions that violate these constraints.

| Category | Requirement |
|---|---|
| Performance | AI response time < 2 seconds; all screen load times < 2 seconds |
| Scalability | Architecture must handle hundreds to thousands of concurrent users without manual scaling |
| Reliability | 99% uptime — no planned downtime |
| Security | Role-based access control; encrypted data storage and transmission |
| Compliance | NDPA 2023 — consent capture, data minimisation, user rights, NDPC registration if >1,000 data subjects |
| Localisation | All prices in ₦; phone numbers in +234 format; Nigerian states for address fields |
| Accessibility | Usable by women aged 20–70; clear fonts; no jargon; tested with non-technical users |

---

## 14. NDPA 2023 Compliance Checklist

Every agent working on data-handling features must verify all of the following:

- [ ] Consent is captured before any user data is written (`consent_given = true`)
- [ ] Only data necessary for the service is collected (data minimisation)
- [ ] No user's personal data is ever surfaced to another user
- [ ] Payment details and ID numbers are never stored in conversation logs
- [ ] A data request handler exists (view / correct / delete user data)
- [ ] Designated data contact is documented: Princess Ngozi Chinedu via WhatsApp (+23481058478551)
- [ ] If >1,000 data subjects are processed annually → register with NDPC as a data controller

---

## 15. Agent Workflow Rules

Follow this workflow for all non-trivial tasks.

1. **Think → Plan → Act → Reflect.**
   For any task touching more than one file or system, write a plan artifact
   to `artifacts/plans/plan_[task_id].md` before executing.

2. **Artifacts first, then code.**
   Generate an implementation plan as an artifact. Wait for approval on
   architecture decisions before writing code.

3. **Test before marking complete.**
   All P0 features require passing tests in `tests/` before the task is
   closed. Store test logs in `artifacts/logs/`.

4. **UI changes require a screenshot artifact.**
   If any mobile screen or admin panel UI is modified, include a screenshot
   in the artifact before marking the task done.

5. **Ask, don't assume.**
   If requirements are ambiguous — especially around access control, payment
   flows, or NDPA compliance — pause and ask for clarification rather than
   guessing.

6. **Never auto-run destructive terminal commands.**
   Commands that delete data, drop tables, or reset production state require
   explicit written approval before execution.

7. **Commit discipline.**
   Commit messages follow Conventional Commits:
   `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`
   Never commit directly to `main`. Use feature branches.

---

## 16. Key Success Metrics

Agents should be aware of these targets when making implementation trade-offs.

| KPI | Target |
|---|---|
| Conversion rate (visitor → subscriber) | ≥ 15% within 60 days |
| Automation rate (AI-resolved queries) | ≥ 70% within 30 days |
| AI response time | < 2 seconds |
| WhatsApp channel subscribers | 600+ within 90 days |
| Monthly active users | 500+ by end of Month 2 |
| Customer satisfaction (CSAT) | ≥ 4.0 / 5.0 |
| Activation rate (completed onboarding) | ≥ 80% of registered users |
| Volunteer registrations | 20+ active within 60 days |

---

## 17. Out of Scope

Do not build or propose any of the following:

- Payment processing infrastructure (Paystack/Flutterwave handle this)
- Backend financial systems or accounting integrations
- External marketplace integrations (Jumia, Konga, etc.)
- Full CRM system (interaction logging is in scope; CRM is not)
- Physical logistics or delivery management

---

## 18. Glossary

| Term | Definition |
|---|---|
| **Slaws** | The SlawsNigeria AI assistant |
| **NDPA 2023** | Nigeria Data Protection Act 2023 — primary data law |
| **NDPC** | Nigeria Data Protection Commission — regulatory body |
| **NGN / ₦** | Nigerian Naira — all prices displayed in this currency |
| **Paystack** | Nigerian payment gateway (preferred) |
| **Flutterwave** | Nigerian payment gateway (alternative) |
| **Subscriber** | Registered user with an active paid subscription |
| **Non-subscriber** | User without an active subscription |
| **P0** | Must-have — launch blocker |
| **P1** | Should-have — required within 60 days of launch |
| **P2** | Future — post-launch roadmap |
| **CSAT** | Customer Satisfaction Score |
| **MAU** | Monthly Active Users |
| **WhatsApp Business API** | Programmatic interface for automated WhatsApp messaging |

---

*Last updated: April 2026 · Document ref: SNG-PRD-AI-001 v3.0*
*Owner: Princess Ngozi Chinedu — igbokweprincess57@gmail.com*
