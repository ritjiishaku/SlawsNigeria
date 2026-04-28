-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "state" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age_group" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "subscription_id" TEXT,
    "onboarding_stage" TEXT NOT NULL DEFAULT 'not_started',
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active" DATETIME NOT NULL,
    "consent_given" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount_paid" REAL NOT NULL,
    "billing_cycle" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "payment_ref" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "availability" TEXT NOT NULL,
    "access_level" TEXT NOT NULL,
    "media_urls" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "time" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "capacity" INTEGER,
    "price" REAL NOT NULL,
    "access_level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "booking_link" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "volunteers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'applied',
    "agreement_signed" BOOLEAN NOT NULL DEFAULT false,
    "onboarded_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "volunteers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "interaction_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "session_id" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL,
    "escalated_to" TEXT,
    "response_ms" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "interaction_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_subscription_id_key" ON "users"("subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "volunteers_user_id_key" ON "volunteers"("user_id");
