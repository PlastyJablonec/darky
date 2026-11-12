# Deployment Guide

This document describes the current production deployment of DarekList.

## Production Topology

- Frontend hosting: Vercel
- Frontend URL: `https://darky-seznam.vercel.app`
- Backend API: self-hosted Supabase on Raspberry Pi
- Public API URL: `https://api.brana-plasty.work`
- Public ingress: Cloudflare Tunnel

## Frontend Deployment on Vercel

### Required environment variables

Set these in the Vercel project settings:

```env
VITE_SUPABASE_URL=https://api.brana-plasty.work
VITE_SUPABASE_ANON_KEY=your-rpi-supabase-anon-key
```

Optional:

```env
VITE_GEMINI_API_KEY=your-gemini-key
```

### Important rule

Whenever one of these variables changes, trigger a new deployment. Vercel will not retroactively inject updated values into an already built frontend bundle.

### Recommended deployment flow

1. Commit code changes.
2. Push to the tracked branch.
3. Verify Vercel environment variables.
4. Redeploy the project.
5. Test login, wishlist loading and shared pages.

## Supabase Deployment on Raspberry Pi

The self-hosted Supabase stack lives under:

```text
/opt/supabase/dareklist
```

Key services:

- `supabase-db`
- `supabase-auth`
- `supabase-rest`
- `supabase-storage`
- `realtime`
- `supabase-kong`

### Public API routing

The Cloudflare Tunnel route currently targets `localhost:8090`.

Because Supabase Kong is intentionally exposed on port `8000`, a local TCP forwarder bridges:

```text
localhost:8090 -> 127.0.0.1:8000
```

Systemd service:

```text
supabase-tcp-forwarder.service
```

## Auth Configuration

### Public auth URLs

- `API_EXTERNAL_URL=https://api.brana-plasty.work`
- `SITE_URL=https://darky-seznam.vercel.app`
- `ADDITIONAL_REDIRECT_URLS=https://darky-seznam.vercel.app/auth/callback,http://localhost:5173/auth/callback,http://localhost:3000/auth/callback`

### Google OAuth

Google OAuth is configured through the self-hosted Supabase Auth container.

Required Google Console values:

- Authorized JavaScript origin:
  - `https://darky-seznam.vercel.app`
- Authorized redirect URI:
  - `https://api.brana-plasty.work/auth/v1/callback`

## Validation Checklist After Deploy

### Frontend

- Home page opens
- Login page opens
- Registration works
- Wishlist list loads after sign-in
- Shared page opens from public link

### Backend

- `https://api.brana-plasty.work/auth/v1/health` responds
- `https://api.brana-plasty.work/rest/v1/` responds with API key
- Existing data is visible

### OAuth

- Google sign-in opens Google chooser
- Callback returns to `/auth/callback`
- User lands back in the app signed in

## Failure Patterns

### Vercel still points to old Supabase

Cause:
- Old frontend bundle still deployed

Fix:
- Update Vercel env vars
- Trigger a new deploy

### Cloudflare returns `502`

Cause:
- Tunnel route points to an origin that is not listening

Fix:
- Check Cloudflare route target
- Check `supabase-tcp-forwarder.service`
- Check Supabase Kong on port `8000`

### Google sign-in redirects but login does not finish

Cause:
- Wrong Google redirect URI
- Missing Vercel redeploy
- Wrong `SITE_URL` or `API_EXTERNAL_URL`

Fix:
- Re-check Google Console values
- Re-check Supabase `.env`
- Redeploy frontend
