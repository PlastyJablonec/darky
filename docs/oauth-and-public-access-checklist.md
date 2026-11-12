# OAuth And Public Access Checklist

This is the minimum information needed to finish Google OAuth and public access for the self-hosted Supabase instance on the Raspberry Pi.

## 1. Public URLs we need

Two public HTTPS URLs are required:

- `APP_PUBLIC_URL`
  - The URL where users open the frontend application.
  - Example: `https://darky.example.cz`

- `SUPABASE_PUBLIC_URL`
  - The public URL that points to the Raspberry Pi Supabase API through Cloudflare Tunnel.
  - Example: `https://supabase.darky.example.cz`

## 2. Cloudflare Tunnel target

The Raspberry Pi already has a running Cloudflare Tunnel service, but the hostname mapping is managed outside the machine.

We still need one Cloudflare hostname routed to:

- `http://192.168.88.200:8000`

Recommended DNS/ingress target:

- `supabase.<your-domain>`

The browser must be able to reach these endpoints through that hostname:

- `https://SUPABASE_PUBLIC_URL/auth/v1/health`
- `https://SUPABASE_PUBLIC_URL/rest/v1/`

## 3. Google Cloud OAuth client

Create or reuse a Google OAuth Web application client in Google Cloud Console.

Required values:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_SECRET`

Required Authorized JavaScript origins:

- `APP_PUBLIC_URL`

Required Authorized redirect URIs:

- `SUPABASE_PUBLIC_URL/auth/v1/callback`

## 4. Self-hosted Supabase values to update on Raspberry Pi

Once the public URLs and Google client exist, these values should be set in `/opt/supabase/dareklist/.env`:

```env
API_EXTERNAL_URL=https://SUPABASE_PUBLIC_URL
SITE_URL=https://APP_PUBLIC_URL
ADDITIONAL_REDIRECT_URLS=https://APP_PUBLIC_URL/auth/callback
GOOGLE_ENABLED=true
GOOGLE_CLIENT_ID=...
GOOGLE_SECRET=...
```

And these lines need to be uncommented in `/opt/supabase/dareklist/docker-compose.yml` for the `auth` service:

```yaml
GOTRUE_EXTERNAL_GOOGLE_ENABLED: ${GOOGLE_ENABLED}
GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
GOTRUE_EXTERNAL_GOOGLE_SECRET: ${GOOGLE_SECRET}
GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI: ${API_EXTERNAL_URL}/auth/v1/callback
```

After that, restart the relevant services:

```bash
cd /opt/supabase/dareklist
docker compose up -d auth kong rest realtime storage meta
```

## 5. Frontend values

The frontend must use the public Supabase API URL, not the LAN IP:

```env
VITE_SUPABASE_URL=https://SUPABASE_PUBLIC_URL
VITE_SUPABASE_ANON_KEY=...
```

## 6. Current blocker

The Raspberry Pi does not contain:

- the Cloudflare hostname assigned to the existing managed tunnel
- the Google OAuth client ID/secret

So the remaining work is mostly configuration wiring once those values are available.
