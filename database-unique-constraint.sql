-- Přidat unique constraint pro zabránění duplikátů
-- Nejdřív smazat duplikáty pokud existují

-- Smazat duplikáty - ponechat jen nejnovější záznam pro každou kombinaci
DELETE FROM public.wishlist_shares 
WHERE id NOT IN (
  SELECT DISTINCT ON (wishlist_id, shared_with) id
  FROM public.wishlist_shares 
  ORDER BY wishlist_id, shared_with, created_at DESC
);

-- Přidat unique constraint
ALTER TABLE public.wishlist_shares 
ADD CONSTRAINT unique_wishlist_share UNIQUE (wishlist_id, shared_with);

SELECT 'Duplikáty smazány a unique constraint přidán!' as result;