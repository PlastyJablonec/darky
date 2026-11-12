# Operations Guide

This document covers the practical runtime setup of DarekList in production.

## Current Runtime Layout

### Frontend

- Platform: Vercel
- URL: `https://darky-seznam.vercel.app`

### Backend

- Platform: self-hosted Supabase
- Host: Raspberry Pi
- Local API port: `8000`
- Public API URL: `https://api.brana-plasty.work`

### Public access

- Cloudflare Tunnel exposes the Supabase API
- Current route target inside the Raspberry Pi environment: `localhost:8090`
- Local TCP forwarder bridges `8090 -> 8000`

## Important Paths on Raspberry Pi

```text
/opt/supabase/dareklist
/opt/supabase/backups
/opt/supabase/tcp-forward-8090.py
```

## Important Services

### Docker services

- `supabase-db`
- `supabase-auth`
- `supabase-rest`
- `supabase-storage`
- `realtime`
- `supabase-kong`
- `supabase-studio`

### Systemd services

- `cloudflared.service`
- `supabase-tcp-forwarder.service`

## Backups

Daily backups are scheduled on the Raspberry Pi.

Backup helper:

```text
/opt/supabase/backup-dareklist.sh
```

Backup destination:

```text
/opt/supabase/backups
```

Additional point-in-time backup created before CSV import:

```text
/opt/supabase/backups/pre-import-20260707-161300.dump
```

## Auth Configuration

The production auth setup uses:

- `SITE_URL=https://darky-seznam.vercel.app`
- `API_EXTERNAL_URL=https://api.brana-plasty.work`
- Google OAuth through Supabase Auth

## Typical Maintenance Tasks

### Restart self-hosted Supabase services

```bash
cd /opt/supabase/dareklist
docker compose up -d auth kong rest realtime storage meta
```

### Check API health

```text
https://api.brana-plasty.work/auth/v1/health
```

### Check Cloudflare bridge helper

```bash
sudo systemctl status supabase-tcp-forwarder.service
```

### Check Cloudflare Tunnel

```bash
sudo systemctl status cloudflared.service
sudo journalctl -u cloudflared -n 100 --no-pager
```

## Known Operational Risks

- The frontend must be redeployed after changing Vercel environment variables.
- If the Cloudflare route changes away from `localhost:8090`, the TCP forwarder may need to be updated or removed.
- If Google OAuth stops working, check both Google Console redirect URIs and Supabase Auth public URLs.

## Data Migration Notes

- User data and public tables were migrated from CSV exports.
- Supabase Storage was empty and therefore not migrated.
- `gift_contributions` was not available in the CSV export set and may be empty after migration.
