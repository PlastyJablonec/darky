# Raspberry Pi Supabase Migration

This project now includes a repeatable CSV-based migration path for moving data from the hosted Supabase project into the self-hosted Supabase stack on the Raspberry Pi.

## Why this exists

- The original hosted database was only reachable over IPv6.
- The Raspberry Pi environment is currently IPv4-only.
- The exported CSV files are enough to migrate application data and user accounts without paying for the hosted IPv4 add-on.
- Supabase Storage is empty, so object migration is not needed.

## Files

- `scripts/rpi-import/import_from_csv.sql`
- `scripts/rpi-import/verify_import.sql`
- `scripts/rpi-import/import_to_rpi.ps1`

## What gets imported

- `auth.users`
- `auth.identities`
- `public.profiles`
- `public.wishlists`
- `public.gifts`
- `public.wishlist_shares`
- `public.wishlist_views`
- `public.gift_contribution_messages`
- `public.group_gift_suggestions`

`public.gift_contributions` is not part of the current CSV export, so the table remains empty after import.

## Safety measures

- The PowerShell wrapper validates that all required CSV files exist before doing anything.
- A fresh binary backup is created on the Raspberry Pi before the import starts.
- The import is executed directly inside the Postgres container, which avoids client encoding mismatches and local network DB exposure.
- The `on_auth_user_created` trigger is disabled during the `auth.users` import to prevent duplicate profile creation.

## Run

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\rpi-import\import_to_rpi.ps1 -PiPassword '<raspberry-password>'
```

## Important auth note

Email/password users can be migrated with their existing password hashes.

Google login still depends on a working Google OAuth provider configuration in the self-hosted Supabase Auth service. The exported rows preserve user identities, but they do not recreate the Google client credentials.
