-- Oprava sharing policy (smazat existující a vytvořit nové)

-- Smazat všechny existující policies
DROP POLICY IF EXISTS "users_create_shares" ON public.wishlist_shares;
DROP POLICY IF EXISTS "users_update_their_shares" ON public.wishlist_shares;

-- Nová policy která povoluje vytváření share záznamů i pro ostatní uživatele
CREATE POLICY "users_create_shares" ON public.wishlist_shares
  FOR INSERT WITH CHECK (
    -- Vlastník může sdílet s kýmkoli
    (auth.uid() = shared_by AND EXISTS (SELECT 1 FROM public.wishlists WHERE id = wishlist_id AND user_id = auth.uid()))
    OR
    -- Nebo kdokoli může vytvořit záznam pro sebe (když navštíví veřejný seznam)
    (auth.uid() = shared_with AND EXISTS (SELECT 1 FROM public.wishlists WHERE id = wishlist_id AND is_public = true))
  );

-- Přidat také UPDATE oprávnění pro aktualizaci viewed_at
CREATE POLICY "users_update_their_shares" ON public.wishlist_shares
  FOR UPDATE USING (
    auth.uid() = shared_with OR auth.uid() = shared_by
  );

SELECT 'Sharing policies fixed!' as result;