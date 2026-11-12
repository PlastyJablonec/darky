\set ON_ERROR_STOP on

\echo === Starting CSV import into self-hosted Supabase ===

BEGIN;

SET LOCAL session_replication_role = replica;
TRUNCATE TABLE auth.users CASCADE;

CREATE TEMP TABLE staging_auth_users (
  instance_id uuid,
  id uuid,
  aud character varying,
  role character varying,
  email character varying,
  encrypted_password character varying,
  email_confirmed_at timestamp with time zone,
  invited_at timestamp with time zone,
  confirmation_token character varying,
  confirmation_sent_at timestamp with time zone,
  recovery_token character varying,
  recovery_sent_at timestamp with time zone,
  email_change_token_new character varying,
  email_change character varying,
  email_change_sent_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  phone text,
  phone_confirmed_at timestamp with time zone,
  phone_change text,
  phone_change_token character varying,
  phone_change_sent_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  email_change_token_current character varying,
  email_change_confirm_status smallint,
  banned_until timestamp with time zone,
  reauthentication_token character varying,
  reauthentication_sent_at timestamp with time zone,
  is_sso_user boolean,
  deleted_at timestamp with time zone,
  is_anonymous boolean
);

\copy staging_auth_users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, confirmed_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM '/tmp/dareklist-import/auth.users.csv' WITH (FORMAT csv, HEADER true, NULL 'null');

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous
)
SELECT
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at,
  is_anonymous
FROM staging_auth_users;

CREATE TEMP TABLE staging_auth_identities (
  provider_id text,
  user_id uuid,
  identity_data jsonb,
  provider text,
  last_sign_in_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  email text,
  id uuid
);

\copy staging_auth_identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, email, id) FROM '/tmp/dareklist-import/auth.identities.csv' WITH (FORMAT csv, HEADER true, NULL 'null');

INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  id
)
SELECT
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at,
  id
FROM staging_auth_identities;

\copy public.profiles (id, email, display_name, created_at, updated_at) FROM '/tmp/dareklist-import/public.profiles.csv' WITH (FORMAT csv, HEADER true, NULL 'null');

\copy public.wishlists (id, user_id, title, description, image_url, occasion, is_public, share_id, created_at, updated_at, type) FROM '/tmp/dareklist-import/public.wishlists.csv' WITH (FORMAT csv, HEADER true, NULL 'null');

\copy public.gifts (id, wishlist_id, title, description, price, currency, product_url, image_url, priority, is_reserved, reserved_by, reserved_at, is_group_gift, created_at, updated_at, is_received) FROM '/tmp/dareklist-import/public.gifts.csv' WITH (FORMAT csv, HEADER true, NULL 'null');

\copy public.wishlist_shares (id, wishlist_id, shared_by, shared_with, viewed_at, first_viewed_at, created_at) FROM '/tmp/dareklist-import/public.wishlist_shares.csv' WITH (FORMAT csv, HEADER true, NULL 'null');

\copy public.wishlist_views (id, wishlist_id, viewer_id, viewer_info, viewed_at) FROM '/tmp/dareklist-import/public.wishlist_views.csv' WITH (FORMAT csv, HEADER true, NULL 'null');

\copy public.gift_contribution_messages (id, gift_id, sender_id, message, created_at) FROM '/tmp/dareklist-import/public.gift_contribution_messages.csv' WITH (FORMAT csv, HEADER true, NULL 'null');

\copy public.group_gift_suggestions (id, gift_id, suggested_by, created_at) FROM '/tmp/dareklist-import/public.group_gift_suggestions.csv' WITH (FORMAT csv, HEADER true, NULL 'null');

COMMIT;

ANALYZE auth.users;
ANALYZE auth.identities;
ANALYZE public.profiles;
ANALYZE public.wishlists;
ANALYZE public.gifts;
ANALYZE public.wishlist_shares;
ANALYZE public.wishlist_views;
ANALYZE public.gift_contribution_messages;
ANALYZE public.group_gift_suggestions;

\echo === Import finished ===
