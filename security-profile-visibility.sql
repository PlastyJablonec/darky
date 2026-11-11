-- Expose profiles only to their owner and users with an actual wishlist relationship.
CREATE OR REPLACE FUNCTION public.current_user_can_view_profile(p_profile_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT auth.uid() IS NOT NULL AND (
    auth.uid() = p_profile_id
    OR EXISTS (
      SELECT 1 FROM public.wishlist_shares s JOIN public.wishlists w ON w.id = s.wishlist_id AND w.user_id = s.shared_by
      WHERE (s.shared_by = auth.uid() AND s.shared_with = p_profile_id)
         OR (s.shared_with = auth.uid() AND s.shared_by = p_profile_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.gift_contributions mine
      JOIN public.gift_contributions theirs ON theirs.gift_id = mine.gift_id
      JOIN public.gifts g ON g.id = mine.gift_id JOIN public.wishlists w ON w.id = g.wishlist_id
      WHERE mine.contributor_id = auth.uid() AND theirs.contributor_id = p_profile_id AND w.user_id <> auth.uid()
    )
  );
$$;
REVOKE ALL ON FUNCTION public.current_user_can_view_profile(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_can_view_profile(uuid) TO authenticated;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles visible to related users" ON public.profiles;
CREATE POLICY "Profiles visible to related users" ON public.profiles FOR SELECT TO authenticated USING (public.current_user_can_view_profile(id));
