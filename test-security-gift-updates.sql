\set ON_ERROR_STOP on
BEGIN;
\i /tmp/security-gift-updates.sql
SELECT id AS owner_id FROM auth.users ORDER BY id LIMIT 1 \gset
SELECT id AS first_id FROM auth.users WHERE id <> :'owner_id' ORDER BY id LIMIT 1 \gset
SELECT id AS other_id FROM auth.users WHERE id NOT IN (:'owner_id', :'first_id') ORDER BY id LIMIT 1 \gset
INSERT INTO public.wishlists (id,user_id,title,type,is_public) VALUES ('103ddfde-35a0-486c-9094-8d37a2f330b4', :'owner_id','Security test','personal',true);
INSERT INTO public.gifts (id,wishlist_id,title,price,is_group_gift) VALUES ('203ddfde-35a0-486c-9094-8d37a2f330b4','103ddfde-35a0-486c-9094-8d37a2f330b4','Security test',1000,false), ('303ddfde-35a0-486c-9094-8d37a2f330b4','103ddfde-35a0-486c-9094-8d37a2f330b4','Group test',100,true);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', :'first_id', true) AS ignored \gset
SELECT set_config('request.jwt.claim.role', 'authenticated', true) AS ignored \gset
DO $$ BEGIN
  BEGIN UPDATE public.gifts SET title='Unauthorized' WHERE id='203ddfde-35a0-486c-9094-8d37a2f330b4'; RAISE EXCEPTION 'Unauthorized title update succeeded'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN UPDATE public.gifts SET is_reserved=true,reserved_by='00000000-0000-0000-0000-000000000000' WHERE id='203ddfde-35a0-486c-9094-8d37a2f330b4'; RAISE EXCEPTION 'Fake reservation succeeded'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
UPDATE public.gifts SET is_reserved=true,reserved_by=:'first_id',reserved_at=now() WHERE id='203ddfde-35a0-486c-9094-8d37a2f330b4';
SELECT set_config('request.jwt.claim.sub', :'other_id', true) AS ignored \gset
DO $$ BEGIN BEGIN UPDATE public.gifts SET is_reserved=false,reserved_by=null WHERE id='203ddfde-35a0-486c-9094-8d37a2f330b4'; RAISE EXCEPTION 'Other user cancelled reservation'; EXCEPTION WHEN insufficient_privilege THEN NULL; END; END $$;
SELECT set_config('request.jwt.claim.sub', :'first_id', true) AS ignored \gset
UPDATE public.gifts SET is_reserved=false,reserved_by=null,reserved_at=null WHERE id='203ddfde-35a0-486c-9094-8d37a2f330b4';
INSERT INTO public.gift_contributions (gift_id,contributor_id,amount) VALUES ('303ddfde-35a0-486c-9094-8d37a2f330b4',:'first_id',100);
DO $$ BEGIN IF NOT (SELECT is_reserved FROM public.gifts WHERE id='303ddfde-35a0-486c-9094-8d37a2f330b4') THEN RAISE EXCEPTION 'Fully funded group gift not reserved'; END IF; END $$;
SELECT set_config('request.jwt.claim.sub', :'owner_id', true) AS ignored \gset
UPDATE public.gifts SET title='Owner edit' WHERE id='203ddfde-35a0-486c-9094-8d37a2f330b4';
ROLLBACK;
\echo 'Gift permission checks passed'
