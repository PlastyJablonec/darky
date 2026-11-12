# Documentation Index

This folder contains operational documentation for the current production setup.

## Image cropping

In the gift or wishlist editor, select **Oříznout** below the image, adjust the selection and choose **Použít výřez**. The crop is processed locally and is saved when the form is submitted. Images hosted on another site can only be cropped if that site permits cross-origin access; otherwise download and upload the image first.

## Documents

- [operations.md](./operations.md)
  - Runtime operations for Raspberry Pi, Cloudflare Tunnel and backups.

- [rpi-supabase-migration.md](./rpi-supabase-migration.md)
  - CSV-based migration flow from the previous hosted Supabase project.

- [oauth-and-public-access-checklist.md](./oauth-and-public-access-checklist.md)
  - Checklist for public API exposure and Google OAuth wiring.

## Recommended reading order

1. Read the project [README](../README.md)
2. Read the [deployment guide](../DEPLOYMENT.md)
3. Read [operations.md](./operations.md)
4. Use the migration or OAuth guides only when working on those specific areas
