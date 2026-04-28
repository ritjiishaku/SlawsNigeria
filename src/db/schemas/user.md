# User Schema

Source: AGENTS.md Section 6

| Field | Type | Rules |
|---|---|---|
| `id` | UUID | PK — auto-generated |
| `full_name` | String | Required |
| `phone` | String | +234XXXXXXXXXX format — Required |
| `email` | String\|null | Optional |
| `state` | String | Nigerian state (e.g. Lagos, Abuja FCT, Rivers) |
| `gender` | Enum | female \| male \| prefer_not_to_say |
| `age_group` | Enum | teen \| 20-30 \| 31-45 \| 46-60 \| 61-70 \| 70+ |
| `role` | Enum | customer \| entrepreneur \| parent \| teen \| volunteer |
| `subscription_id` | UUID\|null | FK → Subscription |
| `onboarding_stage` | Enum | not_started \| in_progress \| complete |
| `joined_at` | DateTime | Auto-set on registration |
| `last_active` | DateTime | Updated each session |
| `consent_given` | Boolean | **NDPA 2023** — must be true before any data is stored |
