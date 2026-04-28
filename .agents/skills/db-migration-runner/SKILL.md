# SKILL: DB Migration Runner

> Skill ID: db-migration-runner
> Phase: P0
> Source: SNG-PRD-AI-001 v3.0 — Section 14 (Data Models) + architecture.md

---

## Purpose

This skill defines how to create, manage, and run database schema changes
for the SlawsNigeria platform using **Prisma ORM** with **PostgreSQL**.

All schemas are derived strictly from the PRD data models. No new fields
or tables may be added without PRD approval.

---

## Tech Stack

- ORM: **Prisma 5+**
- Database: **PostgreSQL 15+**
- Language: **TypeScript**
- Schema file: `src/db/schema.prisma`
- Migrations: `src/db/migrations/`
- Seed: `src/db/seed.ts`

---

## Environment Variable Required

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/slawsnigeria
```

---

## Full Prisma Schema

This is the canonical schema derived from the PRD. Every model maps exactly
to the data models in Section 14 of SNG-PRD-AI-001 v3.0.

```prisma
// src/db/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ────────────────────────────────────────────────────────────────────

enum Gender {
  female
  male
  prefer_not_to_say
}

enum AgeGroup {
  teen
  age_20_30   @map("20-30")
  age_31_45   @map("31-45")
  age_46_60   @map("46-60")
  age_61_70   @map("61-70")
  age_70_plus @map("70+")
}

enum UserRole {
  customer
  entrepreneur
  parent
  teen
  volunteer
}

enum OnboardingStage {
  not_started
  in_progress
  complete
}

enum SubscriptionPlan {
  free
  basic
  premium
}

enum SubscriptionStatus {
  active
  expired
  cancelled
  pending
}

enum BillingCycle {
  monthly
  quarterly
  annually
}

enum ProductCategory {
  women_store
  event_service
  mentorship
  course
  consulting
}

enum Availability {
  in_stock
  out_of_stock
  coming_soon
}

enum AccessLevel {
  public
  subscriber_only
}

enum EventType {
  standard
  VIP
  professional
  private
}

enum EventStatus {
  upcoming
  ongoing
  completed
  cancelled
}

enum VolunteerRole {
  customer_service
  inventory
  executive
  social_media
  other
}

enum VolunteerAvailability {
  full_time
  part_time
  weekends_only
}

enum VolunteerStatus {
  applied
  under_review
  active
  inactive
  rejected
}

enum NigerianState {
  Abia
  Adamawa
  AkwaIbom   @map("Akwa Ibom")
  Anambra
  Bauchi
  Bayelsa
  Benue
  Borno
  CrossRiver @map("Cross River")
  Delta
  Ebonyi
  Edo
  Ekiti
  Enugu
  FCT        @map("Abuja FCT")
  Gombe
  Imo
  Jigawa
  Kaduna
  Kano
  Katsina
  Kebbi
  Kogi
  Kwara
  Lagos
  Nasarawa
  Niger
  Ogun
  Ondo
  Osun
  Oyo
  Plateau
  Rivers
  Sokoto
  Taraba
  Yobe
  Zamfara
}

// ─── Models ───────────────────────────────────────────────────────────────────

model User {
  id               String          @id @default(uuid())
  full_name        String
  phone            String          @unique  // +234XXXXXXXXXX format
  email            String?         @unique
  state            NigerianState?
  gender           Gender?
  age_group        AgeGroup?
  role             UserRole        @default(customer)
  onboarding_stage OnboardingStage @default(not_started)
  consent_given    Boolean         @default(false)  // NDPA 2023
  consent_given_at DateTime?

  subscription_id String?       @unique
  subscription    Subscription? @relation(fields: [subscription_id], references: [id])

  joined_at   DateTime @default(now())
  last_active DateTime @default(now())

  volunteer        Volunteer?
  interaction_logs InteractionLog[]
  orders           Order[]

  @@map("users")
}

model Subscription {
  id            String             @id @default(uuid())
  user_id       String             @unique
  plan          SubscriptionPlan   @default(free)
  status        SubscriptionStatus @default(pending)
  amount_paid   Decimal            @db.Decimal(12, 2)  // NGN
  billing_cycle BillingCycle
  start_date    DateTime
  end_date      DateTime
  auto_renew    Boolean            @default(true)
  payment_ref   String?            // Paystack / Flutterwave reference

  created_at DateTime @default(now())

  user User?

  @@map("subscriptions")
}

model Product {
  id           String          @id @default(uuid())
  name         String
  category     ProductCategory
  description  String
  price        Decimal         @db.Decimal(12, 2)  // NGN
  currency     String          @default("NGN")
  availability Availability    @default(in_stock)
  access_level AccessLevel     @default(subscriber_only)
  media_urls   String[]
  tags         String[]

  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt

  order_items OrderItem[]

  @@map("products")
}

model Event {
  id           String      @id @default(uuid())
  title        String
  type         EventType
  description  String
  date         DateTime
  location     String      // Nigerian city and venue name
  state        NigerianState
  capacity     Int?        // null = unlimited
  price        Decimal     @db.Decimal(12, 2)  // NGN; 0 if free
  access_level AccessLevel @default(subscriber_only)
  status       EventStatus @default(upcoming)
  booking_link String?

  created_at DateTime @default(now())

  @@map("events")
}

model Volunteer {
  id               String                @id @default(uuid())
  user_id          String                @unique
  role             VolunteerRole
  skills           String[]
  availability     VolunteerAvailability
  status           VolunteerStatus       @default(applied)
  agreement_signed Boolean               @default(false)
  onboarded_at     DateTime?

  created_at DateTime @default(now())

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("volunteers")
}

model InteractionLog {
  id            String  @id @default(uuid())
  user_id       String?
  session_id    String
  intent        String
  message       String  @db.Text
  response      String  @db.Text
  resolved      Boolean @default(false)
  escalated_to  String? // WhatsApp number if escalated
  response_ms   Int?    // Response time in milliseconds

  created_at DateTime @default(now())

  user User? @relation(fields: [user_id], references: [id], onDelete: SetNull)

  @@index([session_id])
  @@index([user_id])
  @@index([created_at])
  @@map("interaction_logs")
}

model Order {
  id             String      @id @default(uuid())
  user_id        String
  total_amount   Decimal     @db.Decimal(12, 2)  // NGN
  currency       String      @default("NGN")
  status         OrderStatus @default(pending)
  payment_status PaymentStatus @default(unpaid)
  payment_ref    String?
  delivery_type  DeliveryType
  address        String?
  state          NigerianState?

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  user        User        @relation(fields: [user_id], references: [id])
  order_items OrderItem[]

  @@map("orders")
}

model OrderItem {
  id         String  @id @default(uuid())
  order_id   String
  product_id String
  name       String
  quantity   Int
  unit_price Decimal @db.Decimal(12, 2)  // NGN
  subtotal   Decimal @db.Decimal(12, 2)  // NGN

  order   Order   @relation(fields: [order_id], references: [id], onDelete: Cascade)
  product Product @relation(fields: [product_id], references: [id])

  @@map("order_items")
}

// Additional enums for Order model
enum OrderStatus {
  pending
  confirmed
  delivered
  cancelled
  refunded
}

enum PaymentStatus {
  unpaid
  paid
  failed
  refunded
}

enum DeliveryType {
  digital
  physical
  in_person
}
```

---

## Migration Commands

### Create a new migration
```bash
npx prisma migrate dev --name <description>
# Example:
npx prisma migrate dev --name add_user_schema
```

### Apply migrations to production
```bash
npx prisma migrate deploy
```

### Reset the database (development only — DESTROYS ALL DATA)
```bash
npx prisma migrate reset
```

### Generate Prisma client after schema changes
```bash
npx prisma generate
```

### View database in browser
```bash
npx prisma studio
```

---

## Seed Data

```typescript
// src/db/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed sample products for development
  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Women Empowerment Package',
        category: 'women_store',
        description: 'A curated package of resources and tools for Nigerian women.',
        price: 15000,
        availability: 'in_stock',
        access_level: 'subscriber_only',
        media_urls: [],
        tags: ['women', 'empowerment', 'bundle'],
      },
      {
        name: 'VIP Event Planning Consultation',
        category: 'event_service',
        description: 'One-hour consultation with our event planning team.',
        price: 50000,
        availability: 'in_stock',
        access_level: 'subscriber_only',
        media_urls: [],
        tags: ['event', 'VIP', 'consultation'],
      },
      {
        name: '90-Day Entrepreneur Mentorship',
        category: 'mentorship',
        description: 'Structured mentorship programme for young Nigerian entrepreneurs.',
        price: 75000,
        availability: 'in_stock',
        access_level: 'subscriber_only',
        media_urls: [],
        tags: ['mentorship', 'entrepreneur', 'business'],
      },
    ],
  });

  console.log('Seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run seed:
```bash
npx ts-node src/db/seed.ts
```

---

## Migration Rules

1. **Never edit an existing migration file.** Create a new migration for every change.
2. **Test migrations on a local copy of production data** before deploying.
3. **Never use `prisma migrate reset` in production.** Use `migrate deploy` only.
4. **All monetary fields use `Decimal @db.Decimal(12, 2)`** — never `Float` (floating point precision loss).
5. **All timestamps use `DateTime`** — Prisma maps this to PostgreSQL `TIMESTAMP WITH TIME ZONE`.
6. **Phone fields are `String`** — never attempt to store as Int (leading zeros, +234 prefix).
7. **New fields must have a default** or be nullable — never add a required non-nullable
   field without a default to an existing table (it will fail on non-empty tables).
8. **Nigerian state fields use the `NigerianState` enum** — never free-text strings.

---

## Migration Checklist

Before running a migration:

- [ ] Schema change reviewed against PRD — no unauthorised fields added
- [ ] New monetary fields use `Decimal @db.Decimal(12, 2)`
- [ ] New phone fields are `String`
- [ ] New address/location fields use `NigerianState` enum where applicable
- [ ] New required fields have a `@default` value or are nullable
- [ ] `npx prisma generate` run after schema change
- [ ] Migration tested on local database before deploying
- [ ] Migration name is descriptive: `add_volunteer_agreement_flag`, not `update1`
