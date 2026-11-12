# DarekList

Web application for creating, sharing and reserving wishlists with support for personal lists, managed lists, shared access and group gifts.

## Project Status

The project currently runs in this production setup:

- Frontend: Vercel
- Public frontend URL: `https://darky-seznam.vercel.app`
- Backend API: self-hosted Supabase on Raspberry Pi
- Public Supabase API URL: `https://api.brana-plasty.work`
- Public access bridge: Cloudflare Tunnel
- Database: PostgreSQL inside the self-hosted Supabase stack
- Auth: Supabase Auth with email/password and Google OAuth

## Main Features

- User registration and sign-in
- Google OAuth sign-in
- Personal wishlists
- Managed wishlists
- Public sharing by share link
- Shared access between registered users
- Gift reservation flow
- Group gift suggestions and contribution messaging
- AI gift suggestions powered by Gemini with a local fallback strategy
- Responsive UI for desktop and mobile

## Architecture Overview

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS

### Backend and infrastructure

- Supabase self-hosted stack
- PostgreSQL
- Supabase Auth
- Supabase REST
- Supabase Realtime
- Cloudflare Tunnel for public API exposure
- Raspberry Pi as the self-hosted runtime

### Why this architecture exists

The original hosted Supabase free tier could pause the project after inactivity. The project was therefore migrated to a self-hosted Supabase stack on Raspberry Pi, while the frontend remained on Vercel for simple deployment and CDN delivery.

## Repository Structure

```text
src/
  components/    Reusable UI components
  config/        Client configuration such as Supabase
  context/       React context providers
  hooks/         Reusable hooks
  pages/         Route-level pages
  services/      Data and business logic services
  types/         Shared TypeScript database and app types
  utils/         Diagnostics and helper utilities

docs/            Operations, migration and deployment documentation
scripts/         Build helpers and Raspberry Pi import tools
public/          Static assets
```

## Environment Variables

### Required for frontend

```env
VITE_SUPABASE_URL=https://api.example.com
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

### Optional for AI suggestions

```env
VITE_GEMINI_API_KEY=your-gemini-key
```

If `VITE_GEMINI_API_KEY` is missing, the app falls back to deterministic local suggestion logic instead of failing hard.

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env` from `.env.example` and fill in the variables.

### 3. Start development server

```bash
npm run dev
```

### 4. Production build check

```bash
npm run build
```

## Deployment Summary

### Frontend deployment

- Deployed on Vercel
- Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Requires redeploy after environment variable changes

### Backend deployment

- Self-hosted Supabase stack on Raspberry Pi
- Public API exposed through Cloudflare Tunnel
- Auth callback configured for the Vercel frontend domain

## Operations Notes

- Supabase data was migrated from CSV exports
- Storage is currently unused
- Daily backups are configured on the Raspberry Pi
- Public API traffic currently reaches Supabase through a local TCP forwarder used by the Cloudflare Tunnel route

## Security Notes

- No secrets should be committed to the repository
- Frontend only uses the public anon key
- Service-role and infrastructure secrets remain only on the Raspberry Pi
- Database security relies on Supabase Auth and RLS policies

## Documentation Map

- [Deployment guide](./DEPLOYMENT.md)
- [Group gifts overview](./GROUP_GIFTS_SETUP.md)
- [Documentation index](./docs/README.md)
- [Raspberry Pi migration guide](./docs/rpi-supabase-migration.md)
- [OAuth and public access checklist](./docs/oauth-and-public-access-checklist.md)
- [Operations guide](./docs/operations.md)

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Maintainer

Ivan Vondracek

