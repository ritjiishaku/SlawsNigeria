# Subscription Schema

Source: AGENTS.md Section 6

| Field | Type | Rules |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → User |
| `plan` | Enum | free \| basic \| premium |
| `status` | Enum | active \| expired \| cancelled \| pending |
| `amount_paid` | Decimal | In Nigerian Naira (₦) |
| `billing_cycle` | Enum | monthly \| quarterly \| annually |
| `start_date` | Date | |
| `end_date` | Date | |
| `auto_renew` | Boolean | Default: true |
| `payment_ref` | String | Paystack or Flutterwave transaction reference |
| `created_at` | DateTime | Auto-set |
