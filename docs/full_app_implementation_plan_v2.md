# Implementation Plan — SlawsNigeria Full App (v2.0)

This plan integrates the **Slaws AI Persona Prompt** with the existing **.agents** rules and **Design System tokens** to build a production-ready, Nigeria-first women's services platform.

---

## 1. AI Engine Architecture (The "Slaws" Core)
The AI assistant is the heart of the platform. It must strictly follow the persona, tone, and guardrails defined in the prompt.

### A. Intent Classification & Routing
- **Location**: `src/ai/intent-classifier.ts`
- **Logic**: Map user input to the 9 core intents (Discovery, Mentorship, Volunteer, etc.).
- **Guardrails**: Redirect out-of-scope queries to WhatsApp immediately as per [AGENTS.md Section 7](file:///c:/Users/ritji/Desktop/SlawsNigeria/AGENTS.md#L89).

### B. Response Generation (Persona-Driven)
- **Location**: `src/ai/response-generator.ts`
- **System Prompt**: Inject the 12-section persona prompt provided by the user.
- **Language Support**: Default to `en-NG` (Standard Nigerian English) and support `pcm-NG` (Pidgin) when detected.
- **Formatting**: Enforce the "Lead with useful info first" and "Bullet point" rules from [Prompt Section 4].

### C. Response Contract (Required for All AI Responses)
- **Location**: `src/ai/response-contract.ts`
- **Fields** (per AGENTS.md Section 8):
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
- **Language Rule**: Match the language the user writes in. Default to `en-NG`. Never switch language mid-session without user initiating it.

### D. Knowledge Base Integration
- Connect Slaws to the database (`src/db/schemas/`) to retrieve real-time pricing, availability, and event dates.
- **Rule**: If data is missing, Slaws will state it clearly and redirect to WhatsApp (no guessing).

### E. Edge Case Handling
- **Location**: `src/ai/edge-case-handler.ts`
- **Cases** (per AGENTS.md Section 11):
  - **Payment failure**: Prompt retry; offer WhatsApp support
  - **Incomplete onboarding**: Save `onboarding_stage`; resume next session
  - **Session timeout**: Send re-engagement prompt after 10+ minutes of inactivity; end session gracefully
  - **Missing knowledge base data**: Acknowledge gap; route to Princess Ngozi
  - **Duplicate subscription**: Notify of active plan; offer upgrade or renewal
  - **Expired subscription**: Notify expiry; present renewal options
  - **Abusive message**: Politely redirect; do not engage further
  - **API/technical error**: Standard error message; log error; direct to WhatsApp
  - **NDPA consent not given**: Block data storage; re-prompt consent

---

## 2. Access Control & Subscription Funnel
Implement the "Gating" logic defined in both [AGENTS.md Section 9](file:///c:/Users/ritji/Desktop/SlawsNigeria/AGENTS.md#L103) and the Slaws prompt.

- **Middleware**: `src/api/middleware/subscription-gate.ts`
- **Logic**:
  - **Non-Subscribers**: See names/descriptions only (Section 9 table)
  - **Subscribers**: See ₦ pricing, booking links, and mentorship content
- **Paywall Response**: Use the exact copy from AGENTS.md Section 9:
  > "This content is available to SlawsNigeria subscribers. It takes less than a minute to subscribe and unlock full access. Would you like me to show you how?"

---

## 3. UI/UX & Design System Integration
All UI components will be built using the tokens in `src/app/theme/`.

- **Foundation**: Use `tokens.css` for all colors and typography.
- **Components**:
  - **Slaws Chat Interface**: Built using the chat bubble rules in `design-system.md` (Royal Purple for user, Warm Cream for Slaws).
  - **Subscription Badge**: Linear gradient from `#6B21A8` to `#D97706`.
  - **Typography**: Strictly use **Roboto** for UI and **Poppins** for brand moments.

---

## 4. Database Schemas (Aligned to AGENTS.md Section 6)
All schemas located in `src/db/schemas/`:

| Schema File | Status |
|---|---|
| `user.md` | ✅ Complete |
| `subscription.md` | ✅ Complete |
| `product_service.md` | ✅ Complete (newly created) |
| `event.md` | ✅ Complete (newly created) |
| `volunteer.md` | ✅ Complete (newly created) |
| `interaction_log.md` | ✅ Complete |

**Key Rules Applied**:
- All prices in ₦ (NGN) — no foreign currency
- Phone numbers in +234 format
- Nigerian states for address fields
- NDPA 2023 consent required before data storage (`consent_given = true`)
- Payment refs from Paystack/Flutterwave only — no card data stored

---

## 5. Feature Implementation (P0 Launch Blockers)

### A. User Registration & Onboarding
- **NDPA 2023 Consent**: Mandatory checkbox and timestamped logging in the User model (AGENTS.md Section 14).
- **Profile Setup**: Capture name, phone (+234), state, and role.
- **Onboarding Resume**: Track `onboarding_stage` (not_started | in_progress | complete); resume from last completed step.

### B. Payment Integration (Paystack/Flutterwave)
- **Secure Initialisation**: Following the [paystack-integration skill](file:///c:/Users/ritji/Desktop/SlawsNigeria/.agents/skills/paystack-integration/SKILL.md).
- **Payment Flow** (AGENTS.md Section 10):
  1. User selects plan → Slaws presents ₦ pricing with billing cycles
  2. Payment initiated → App opens Paystack/Flutterwave checkout
  3. Success → Subscription status = active; payment_ref stored; notify via app + WhatsApp; trigger post-payment onboarding
  4. Failure → Prompt retry; log failure; keep subscription inactive
  5. Renewal (auto_renew = true) → Charge on renewal date; notify 3 days prior
  6. Expired/renewal failed → Status = expired; prompt manual renewal
- **Notification**: Slaws sends a WhatsApp confirmation immediately after successful payment.

### C. WhatsApp Automation (Critical P0 — AGENTS.md Rule 1)
- **Webhook Handler**: Following the [whatsapp-integration skill](file:///c:/Users/ritji/Desktop/SlawsNigeria/.agents/skills/whatsapp-integration/SKILL.md).
- **Escalation**: Automated routing to human support (+234...) when Slaws marks a query as `resolved = false`.
- **Broadcasts**: WhatsApp channel integration for community updates.

### D. Mobile App (Android & iOS — Primary Platform, P0)
- **Location**: `src/app/` (React Native or Flutter)
- **P0 Requirements**:
  - Slaws chat interface with response contract compliance
  - Subscription funnel with Paystack/Flutterwave checkout
  - Service discovery with subscriber gating
  - Onboarding flow with NDPA consent
  - Event listing and booking (subscribers only)
  - WhatsApp escalation button

### E. Admin Panel (P0 — Required for Launch, AGENTS.md Section 12)
- **Location**: `src/admin/`
- **P0 Features**:
  - Add, edit, remove products and services (with publish scheduling)
  - Create and manage events (all Event schema fields)
  - Update pricing in ₦ (changes reflect immediately in Slaws responses)
  - Upload and manage content (images, videos, descriptions)
  - View and manage volunteer applications (approve / reject / track agreements)
  - Manage subscription plans and pricing

---

## 6. Development Milestones

### Milestone 1: Core Foundation (P0)
- [ ] Initialize Node.js/Express server and database (Prisma or ORM matching AGENTS.md schemas)
- [ ] Implement all 6 database schemas (User, Subscription, Product/Service, Event, Volunteer, Interaction Log)
- [ ] Set up the AI Engine with Slaws Persona, Response Contract, and Edge Case Handler
- [ ] Implement NDPA 2023 consent flow (block data storage until `consent_given = true`)

### Milestone 2: Subscription & Gating (P0)
- [ ] Implement Paystack/Flutterwave payment flow (full Section 10 flow)
- [ ] Apply subscriber/non-subscriber gating across all API routes
- [ ] Build the initial Chat UI with `tokens.css` and Response Contract compliance
- [ ] Implement all 9 intent mappings with proper next_action values

### Milestone 3: Mobile App (P0 — Primary Platform)
- [ ] Set up React Native/Flutter project structure
- [ ] Build Slaws chat interface with persona-driven responses
- [ ] Implement subscription funnel with ₦ pricing display
- [ ] Add service discovery with subscriber gating
- [ ] Integrate onboarding flow with NDPA consent capture
- [ ] Connect to WhatsApp escalation flow

### Milestone 4: Admin Panel (P0 — Launch Requirement)
- [ ] Build admin dashboard for content management
- [ ] Implement product/service CRUD with ₦ pricing
- [ ] Create event management interface
- [ ] Add volunteer application review system
- [ ] Build subscription plan management

### Milestone 5: Automation & Launch (P0)
- [ ] Connect WhatsApp Business API (messaging + broadcasts)
- [ ] Implement email automation (P1 — post-launch)
- [ ] Add social media automation (P1 — post-launch)
- [ ] Final end-to-end testing of the "Slaws" persona
- [ ] Verify all AGENTS.md Section 11 edge cases are handled
- [ ] NDPA compliance audit (Section 14 checklist)

---

## 7. Verification Plan

### Persona & AI Engine
1. **Persona Test**: Ask Slaws "What is your role?" and verify it responds with the identity from the prompt.
2. **Response Contract Test**: Verify all AI responses include `message`, `next_action`, `intent_detected`, `escalate`, and `language` fields.
3. **Language Test**: Switch to Pidgin mid-session; verify Slaws switches to `pcm-NG` only after user initiates.

### Access Control & Gating
4. **Gating Test**: Request "VIP event pricing" as an unauthenticated user; verify the exact paywall prompt appears.
5. **Subscriber Test**: Access full descriptions, pricing, and booking links as a subscriber.

### Edge Cases
6. **Payment Failure Test**: Simulate gateway failure; verify retry prompt and WhatsApp support offer.
7. **Incomplete Onboarding Test**: Exit mid-flow; verify `onboarding_stage` saves and resumes next session.
8. **Session Timeout Test**: Wait 10+ minutes; verify re-engagement prompt and graceful session end.
9. **Missing Data Test**: Query non-existent product; verify Slaws acknowledges gap and routes to Princess Ngozi.
10. **Duplicate Subscription Test**: Subscribe again with active plan; verify upgrade/renewal notification.
11. **Expired Subscription Test**: Access premium content with expired plan; verify expiry notification and renewal options.
12. **NDPA Consent Test**: Attempt data storage without consent; verify block and re-prompt.

### Compliance & Aesthetics
13. **NDPA Compliance Test**: Verify `consent_given = true` required before any database write (AGENTS.md Section 14 checklist).
14. **Aesthetics Test**: Visual audit of mobile screens against the **Royal Purple/Warm Gold** design system.
15. **Currency Test**: Verify all prices display in ₦ (NGN) — no USD, GBP, EUR.
16. **Phone Format Test**: Verify all phone numbers in +234XXXXXXXXXX format.

---

## 8. Non-Functional Requirements (AGENTS.md Section 13)
- **Performance**: AI response time < 2 seconds; all screen load times < 2 seconds
- **Scalability**: Handle hundreds to thousands of concurrent users without manual scaling
- **Reliability**: 99% uptime — no planned downtime
- **Security**: Role-based access control; encrypted data storage and transmission
- **Compliance**: NDPA 2023 — consent capture, data minimisation, user rights, NDPC registration if >1,000 data subjects
- **Localisation**: All prices in ₦; phone numbers in +234 format; Nigerian states for address fields
- **Accessibility**: Usable by women aged 20–70; clear fonts; no jargon; tested with non-technical users

---

*Last updated: April 2026 · Based on AGENTS.md v3.0 (SNG-PRD-AI-001)*
*Owner: Princess Ngozi Chinedu — igbokweprincess57@gmail.com*
