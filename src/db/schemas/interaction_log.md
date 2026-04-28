# Interaction Log Schema

Source: AGENTS.md Section 6

| Field | Type | Rules |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → User (null if unauthenticated) |
| `session_id` | UUID | Groups messages within one conversation |
| `intent` | String | Detected intent (e.g. discovery, purchase_intent) |
| `message` | String | Raw user message |
| `response` | String | Slaws response delivered |
| `resolved` | Boolean | true = AI resolved; false = escalated |
| `escalated_to` | String\|null | WhatsApp number if escalated |
| `response_ms` | Integer | Response time in milliseconds |
| `created_at` | DateTime | Auto-set |
