# SKILL: Vercel Deployment & Infrastructure

> Skill ID: vercel-deployment
> Priority: P0 — Production Foundation
> Source: SNG-PRD-AI-001 v3.0

---

## Purpose

This skill defines the standards for deploying the SlawsNigeria API and supporting services to Vercel. It ensures high availability, security, and performance for the AI engine and automation webhooks.

---

## 1. Project Configuration

### vercel.json
Every project must include a `vercel.json` at the root to route requests to the API.

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/api/index.ts"
    }
  ]
}
```

---

## 2. Prisma & Database

To use Prisma on Vercel, the `schema.prisma` must include the correct binary target.

```prisma
// src/db/schema.prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x"]
}
```

### Connection Management
- Use a database connection pooler (e.g., Prisma Accelerate or Supabase Connection Pooler) to avoid hitting database connection limits during serverless bursts.
- Ensure `DATABASE_URL` in Vercel settings points to the pooler URL.

---

## 3. Environment Variables

All secrets from `AGENTS.md` and `SKILL.md` files must be added to the Vercel Dashboard:

| Variable | Scope |
|---|---|
| `DATABASE_URL` | Production, Preview |
| `PAYSTACK_SECRET_KEY` | Production |
| `WHATSAPP_ACCESS_TOKEN` | Production |
| `JWT_SECRET` | Production |
| `WHATSAPP_VERIFY_TOKEN`| Production, Preview |

---

## 4. Webhook Security

Vercel functions are public. To protect the Paystack and WhatsApp webhooks:
1.  **Always** verify signatures as defined in the `paystack-integration` and `whatsapp-integration` skills.
2.  Set the function timeout to at least **15 seconds** to allow for AI processing and database writes.

---

## 5. Deployment Workflow

1.  **Branching**: All deployments to `main` are automatically promoted to Production.
2.  **Preview**: Use feature branches for Preview deployments to test webhook handshakes before merging.
3.  **Logs**: Monitor Vercel Runtime Logs for 500 errors or execution timeouts.

---

## 6. Performance Optimization

- **Region**: Set the Vercel Function Region to the one closest to the managed database (e.g., `fra1` or `iad1`) to minimize latency between the API and the DB.
- **Caching**: Use Vercel's Edge Caching for public discovery data (e.g., event listings that don't change frequently).
