-- A view may be anonymous or belong to the caller, and only target a list the caller can see.
DROP POLICY IF EXISTS anyone_can_add_view ON public.wishlist_views;
CREATE POLICY anyone_can_add_view ON public.wishlist_views FOR INSERT TO anon, authenticated WITH CHECK (
  (viewer_id IS NULL OR viewer_id = auth.uid())
  AND EXISTS (SELECT 1 FROM public.wishlists w WHERE w.id = wishlist_views.wishlist_id)
);
