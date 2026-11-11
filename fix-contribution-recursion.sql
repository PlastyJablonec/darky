-- Check membership without evaluating the same RLS policy recursively.
CREATE OR REPLACE FUNCTION public.current_user_contributed_to_gift(p_gift_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gift_contributions c
    WHERE c.gift_id = p_gift_id AND c.contributor_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.current_user_contributed_to_gift(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_contributed_to_gift(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.current_user_contributed_to_gift(uuid) TO authenticated;

DROP POLICY IF EXISTS "Contributors can view contributions for their group gifts" ON public.gift_contributions;
CREATE POLICY "Contributors can view contributions for their group gifts" ON public.gift_contributions
  FOR SELECT TO authenticated USING (
    contributor_id = auth.uid()
    OR (
      public.current_user_contributed_to_gift(gift_id)
      AND NOT EXISTS (
        SELECT 1 FROM public.gifts g JOIN public.wishlists w ON w.id = g.wishlist_id
        WHERE g.id = gift_contributions.gift_id AND w.user_id = auth.uid()
      )
    )
  );
