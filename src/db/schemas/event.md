# Event Schema

Source: AGENTS.md Section 6

| Field | Type | Rules |
|---|---|---|
| `id` | UUID | PK |
| `title` | String | Required |
| `type` | Enum | standard \| VIP \| professional \| private |
| `description` | String | Subscriber-gated |
| `date` | Date | |
| `time` | Time | |
| `location` | String | Nigerian city and venue name |
| `state` | String | Nigerian state |
| `capacity` | Integer\|null | null = unlimited |
| `price` | Decimal | In ₦; 0 if free |
| `access_level` | Enum | public \| subscriber_only |
| `status` | Enum | upcoming \| ongoing \| completed \| cancelled |
| `booking_link` | String\|null | |
| `created_at` | DateTime | |
