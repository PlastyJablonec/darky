\set ON_ERROR_STOP on
BEGIN;
\i /tmp/security-sharing-privacy.sql
\i /tmp/security-profile-visibility.sql
SELECT id AS owner_id FROM auth.users ORDER BY id LIMIT 1 \gset
SELECT id AS victim_id FROM auth.users WHERE id <> :'owner_id' ORDER BY id LIMIT 1 \gset
SELECT id AS viewer_id FROM auth.users WHERE id NOT IN (:'owner_id', :'victim_id') ORDER BY id LIMIT 1 \gset
INSERT INTO public.wishlists (id,user_id,title,type,is_public) VALUES ('a63ddfde-35a0-486c-9094-8d37a2f330b4', :'owner_id','Security test','personal',true);
SELECT set_config('request.test.owner', :'owner_id', true) AS ignored \gset
SELECT set_config('request.test.victim', :'victim_id', true) AS ignored \gset
SELECT set_config('request.test.viewer', :'viewer_id', true) AS ignored \gset
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', :'viewer_id', true) AS ignored \gset
DO $$ BEGIN
  BEGIN INSERT INTO public.wishlist_shares (wishlist_id,shared_by,shared_with) VALUES ('a63ddfde-35a0-486c-9094-8d37a2f330b4',current_setting('request.test.victim')::uuid,auth.uid()); RAISE EXCEPTION 'forged owner accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  IF (SELECT count(*) FROM public.profiles WHERE id=current_setting('request.test.owner')::uuid) <> 0 THEN RAISE EXCEPTION 'unrelated profile exposed'; END IF;
END $$;
INSERT INTO public.wishlist_shares (wishlist_id,shared_by,shared_with) VALUES ('a63ddfde-35a0-486c-9094-8d37a2f330b4',:'owner_id',:'viewer_id');
DO $$ BEGIN
  IF (SELECT count(*) FROM public.profiles WHERE id=current_setting('request.test.owner')::uuid) <> 1 THEN RAISE EXCEPTION 'shared owner hidden'; END IF;
  BEGIN UPDATE public.wishlist_shares SET shared_by=auth.uid() WHERE wishlist_id='a63ddfde-35a0-486c-9094-8d37a2f330b4'; RAISE EXCEPTION 'share reassignment allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
UPDATE public.wishlist_shares SET viewed_at=now() WHERE wishlist_id='a63ddfde-35a0-486c-9094-8d37a2f330b4';
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true) AS ignored \gset
DO $$ BEGIN BEGIN IF (SELECT count(*) FROM public.profiles) <> 0 THEN RAISE EXCEPTION 'anonymous profiles exposed'; END IF; EXCEPTION WHEN insufficient_privilege THEN NULL; END; END $$;
RESET ROLE;
DO $$ BEGIN IF has_table_privilege('anon','public.gifts','TRUNCATE') OR has_table_privilege('authenticated','public.gifts','TRUNCATE') THEN RAISE EXCEPTION 'truncate privilege exposed'; END IF; END $$;
ROLLBACK;
\echo 'Share and profile security checks passed'
