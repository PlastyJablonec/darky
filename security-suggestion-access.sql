DROP POLICY IF EXISTS "View group gift suggestions" ON public.group_gift_suggestions;
CREATE POLICY "View group gift suggestions" ON public.group_gift_suggestions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.gifts g WHERE g.id = group_gift_suggestions.gift_id)
);
DROP POLICY IF EXISTS "Create group gift suggestions" ON public.group_gift_suggestions;
CREATE POLICY "Create group gift suggestions" ON public.group_gift_suggestions FOR INSERT TO authenticated WITH CHECK (
  suggested_by = auth.uid() AND EXISTS (
    SELECT 1 FROM public.gifts g JOIN public.wishlists w ON w.id = g.wishlist_id
    WHERE g.id = group_gift_suggestions.gift_id AND w.is_public AND w.user_id <> auth.uid() AND NOT g.is_group_gift
  )
);
