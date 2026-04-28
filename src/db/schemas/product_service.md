# Product / Service Schema

Source: AGENTS.md Section 6

| Field | Type | Rules |
|---|---|---|
| `id` | UUID | PK |
| `name` | String | Required |
| `category` | Enum | women_store \| event_service \| mentorship \| course \| consulting |
| `description` | String | Subscriber-gated |
| `price` | Decimal | In Nigerian Naira (₦) |
| `currency` | String | Default: NGN — never display foreign currency |
| `availability` | Enum | in_stock \| out_of_stock \| coming_soon |
| `access_level` | Enum | public \| subscriber_only |
| `media_urls` | String[] | Images and video links |
| `tags` | String[] | For search and filtering |
| `created_at` | DateTime | Auto-set |
| `updated_at` | DateTime | Auto-updated on edit |
