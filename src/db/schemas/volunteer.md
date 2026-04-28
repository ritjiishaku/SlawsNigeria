# Volunteer Schema

Source: AGENTS.md Section 6

| Field | Type | Rules |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → User |
| `role` | Enum | customer_service \| inventory \| executive \| social_media \| other |
| `skills` | String[] | Self-reported |
| `availability` | Enum | full_time \| part_time \| weekends_only |
| `status` | Enum | applied \| under_review \| active \| inactive \| rejected |
| `agreement_signed` | Boolean | Must be true before status → active |
| `onboarded_at` | DateTime\|null | Set when status becomes active |
| `created_at` | DateTime | |
