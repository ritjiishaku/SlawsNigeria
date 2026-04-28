# SlawsNigeria MVP Launch Checklist

**Target Launch Date:** June 1, 2026
**Goal:** 300-600 WhatsApp subscribers

## Pre-Launch Setup

### 1. Supabase (Database)
- [ ] Create Supabase project at https://supabase.com
- [ ] Run `supabase-schema.sql` in SQL Editor
- [ ] Run `supabase-schema-update.sql` in SQL Editor
- [ ] Copy Project URL → paste in `.env` as `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy Anon Key → paste in `.env` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Wati (WhatsApp API)
- [ ] Create Wati account at https://wati.io
- [ ] Connect WhatsApp Business number (+23481058478551)
- [ ] Copy API Key → paste in `.env` as `WATI_API_KEY`
- [ ] Copy phone number → paste in `.env` as `WATI_PHONE_NUMBER`
- [ ] Set webhook URL to: `https://your-vercel-url/api/whatsapp/webhook`

### 3. n8n (Automation)
- [ ] Set up n8n (cloud or self-hosted)
- [ ] Import `n8n-workflow.json` for welcome messages
- [ ] Import `n8n-scheduled-broadcast.json` for scheduled broadcasts
- [ ] Set environment variables in n8n:
  - `NEXT_PUBLIC_SITE_URL`
  - `ADMIN_PASSWORD`
  - `WATI_API_KEY`
  - `WATI_PHONE_NUMBER`

### 4. Vercel (Hosting)
- [ ] Push code to GitHub
- [ ] Connect repo to Vercel
- [ ] Add environment variables in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `WATI_API_KEY`
  - `WATI_PHONE_NUMBER`
  - `ADMIN_PASSWORD` (default: `slaws2026`)
- [ ] Deploy

## Testing Checklist

### Functional Tests
- [ ] Visit live site → Hero loads with "Subscribe on WhatsApp" button
- [ ] Click pillar CTA → Opens WhatsApp with pre-filled message
- [ ] Submit subscription modal → User added to Supabase `subscribers` table
- [ ] Send message to Wati number → Auto-response received
- [ ] Check `/api/health` → Returns `{"status": "healthy"}`

### Admin Dashboard Tests
- [ ] Visit `/admin` → Login with password `slaws2026`
- [ ] Add a test service → Appears on homepage
- [ ] Delete test service → Removed from homepage
- [ ] Send broadcast → All subscribers receive WhatsApp message
- [ ] Schedule broadcast → Appears in scheduled list

### Performance Tests
- [ ] Page load time < 2 seconds (use Vercel Analytics)
- [ ] WhatsApp message delivery < 1 minute
- [ ] Mobile responsive (test on phone)

## Growth Plan (Hit 300-600 Subscribers)

### Week Before Launch (May 25-31)
- [ ] Add 5-10 services to Offer Hub (mix of events, products, mentorship)
- [ ] Founder shares Offer Hub link on personal WhatsApp status (daily)
- [ ] Post in 10+ Nigerian women-focused Facebook groups
- [ ] Share in relevant Telegram channels

### Launch Day (June 1)
- [ ] Send broadcast to all subscribers: "We're live! 🎉"
- [ ] Post launch announcement on all social media
- [ ] Founder personally invites 50+ contacts via WhatsApp

### Post-Launch (June 2-7)
- [ ] Daily automated tip/offer sent via n8n
- [ ] Track subscriber count in `/admin` dashboard
- [ ] Aim for 20+ new subscribers per day

## Success Metrics (by June 30)
- [ ] 300-600 WhatsApp subscribers
- [ ] Daily automated communication active
- [ ] Zero manual messaging required from founder

---

**Admin Access:**
- URL: `https://your-site.vercel.app/admin`
- Password: `slaws2026` (change in Vercel env vars)

**Health Check:**
- URL: `https://your-site.vercel.app/api/health`
