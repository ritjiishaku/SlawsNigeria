# Broadcast API Timeout Notice

## Problem
Vercel free tier has a 10-second function timeout. Sending to 600 subscribers sequentially (100ms delay each) takes ~60 seconds, causing the function to timeout.

## Solution
Use **n8n workflows** (import `n8n-scheduled-broadcast.json`) for bulk broadcasts instead of calling `/api/broadcast` directly.

### How it works:
1. Admin creates broadcast via `/admin` → calls `/api/scheduled-broadcasts`
2. n8n polls `/api/scheduled-broadcasts?password=...` every 1 minute
3. n8n sends messages via Wati API (handles rate limiting)
4. No Vercel function timeout risk

### For small tests (<50 subscribers):
The `/api/broadcast` endpoint still works for quick tests.

## Recommendation
- ✅ Use n8n for production broadcasts (600+ subscribers)
- ✅ Use `/api/broadcast` only for testing with small groups
