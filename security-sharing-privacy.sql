-- Only genuine wishlist ownership may grant profile access to a recipient.
DROP POLICY IF EXISTS users_create_shares ON public.wishlist_shares;
CREATE POLICY users_create_shares ON public.wishlist_shares FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.wishlists w
    WHERE w.id = wishlist_shares.wishlist_id AND w.user_id = wishlist_shares.shared_by
      AND (auth.uid() = wishlist_shares.shared_by OR (auth.uid() = wishlist_shares.shared_with AND w.is_public)))
);
REVOKE UPDATE ON public.wishlist_shares FROM anon, authenticated;
GRANT UPDATE (viewed_at, first_viewed_at) ON public.wishlist_shares TO authenticated;

DROP POLICY IF EXISTS "Profile dates visible to owner and recipients" ON public.profile_dates;
CREATE POLICY "Profile dates visible to owner and recipients" ON public.profile_dates FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.wishlist_shares s JOIN public.wishlists w ON w.id = s.wishlist_id
    WHERE s.shared_by = profile_dates.user_id AND w.user_id = profile_dates.user_id AND s.shared_with = auth.uid()
  )
);

-- Anonymous visitors do not need to enumerate account emails.
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());

-- RLS does not govern TRUNCATE; API roles do not need table administration privileges.
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
