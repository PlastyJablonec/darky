# Security review and remediation — 2026-11-11

Scope: DarekList frontend, public Supabase API and self-hosted Raspberry Pi configuration. Checks were non-destructive; SQL authorization tests used transactions rolled back afterward. This is not a guarantee against compromise or proof of no prior access.

## Applied database changes

Apply the following migrations, in order, after taking a verified PostgreSQL backup:

1. `security-gift-updates.sql` restricts non-owner gift updates to legitimate reservations. It preserves owner edits and automatic group-gift funding. `test-security-gift-updates.sql` tests these cases inside a transaction; the migration must first be copied into the database container as `/tmp/security-gift-updates.sql`.
2. `security-sharing-privacy.sql` validates that the share owner owns the referenced wishlist, restricts share updates to view timestamps, validates profile date access through the actual owner, and revokes table administration privileges from API roles. Its initial profile policy is self-only.
3. `security-profile-visibility.sql` grants profile visibility to the user and users with a documented sharing, reservation, viewing or group-contribution relationship. Its fixed-search-path helper uses the authenticated user identity, and is executable only by authenticated users.
4. `security-suggestion-access.sql` restricts suggestion reads to accessible gifts and prevents suggestions on another user's inaccessible or already-group gift.
5. `security-function-execution.sql` removes direct API execution of internal security-definer helpers and anonymous access to the funding-status helper.

The production Raspberry Pi was backed up before each change. Role-switched rollback tests covered unauthorized editing, reservation ownership, group funding, forged shares, profile visibility and private suggestions. Anonymous REST requests returned no profile, date or contribution rows.

## Application and host

The link-preview endpoint validates all resolved addresses, pins requests to a checked public IP, validates each redirect, caps response size, and blocks credentials and nonstandard ports. Login return paths must stay on the same origin. Product links only accept HTTP(S). Browser CSP and referrer headers restrict script execution and leakage. Production diagnostic requests and Gemini's browser-side API key were removed; gift recommendations temporarily use the local fallback instead of Gemini.

The Kong port was rebound from all interfaces to `127.0.0.1:8000`. The Cloudflare path was checked afterward; direct LAN access to port 8000 failed and the authenticated health endpoint returned HTTP 200. Original Raspberry Pi `.env` was preserved as `.env.pre-loopback-security`. Other services on ports 22, 1880, 8010 and 5900 were not changed.

## Outstanding actions and limitations

The previously exposed Gemini key belongs to the coJim project and is also present in its deployed frontend. Removing it from a new DarekList deployment does not revoke copies from previous releases. Do not place a replacement in Vite client variables; move both apps to an authenticated, rate-limited server-side design and then revoke the shared key after coJim is migrated. It is not safe to delete it blindly while coJim still depends on it.

The Raspberry Pi has pending OS package upgrades; UFW was not installed and SSH password login remained enabled. Other services expose LAN ports; their intended use, router port forwarding, Cloudflare Zero Trust configuration, firewall policy and update/reboot plan require a separate coordinated review. This check did not prove whether a third party previously accessed the system. TLS and authentication defenses should be checked again after changes to hosting or tunnel configuration.

Production dependency audit after compatible upgrades reports two moderate React Router 6 advisories; their registry fix requires a major upgrade to version 7. Return paths have an application-level same-origin validation, but a major-version upgrade and full route regression tests remain recommended. CSP allows `style-src 'unsafe-inline'` for React inline styles; it is not a substitute for a full security review.
