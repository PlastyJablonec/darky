CREATE TABLE IF NOT EXISTS public.managed_wishlist_people (
  wishlist_id uuid PRIMARY KEY REFERENCES public.wishlists(id) ON DELETE CASCADE,
  person_name text CHECK (person_name IS NULL OR (char_length(trim(person_name)) BETWEEN 1 AND 100)),
  birth_date date CHECK (birth_date >= DATE '1900-01-01' AND birth_date <= CURRENT_DATE),
  name_day date CHECK (name_day >= DATE '2000-01-01' AND name_day <= DATE '2000-12-31')
);
ALTER TABLE public.managed_wishlist_people ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Managed people visible to owner and recipients" ON public.managed_wishlist_people;
CREATE POLICY "Managed people visible to owner and recipients" ON public.managed_wishlist_people FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.wishlists w WHERE w.id = managed_wishlist_people.wishlist_id AND w.user_id = auth.uid() AND w.type = 'managed') OR
  EXISTS (SELECT 1 FROM public.wishlist_shares s JOIN public.wishlists w ON w.id = s.wishlist_id WHERE s.wishlist_id = managed_wishlist_people.wishlist_id AND s.shared_with = auth.uid() AND w.type = 'managed')
);
DROP POLICY IF EXISTS "Owners insert managed people" ON public.managed_wishlist_people;
CREATE POLICY "Owners insert managed people" ON public.managed_wishlist_people FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.wishlists w WHERE w.id = wishlist_id AND w.user_id = auth.uid() AND w.type = 'managed')
);
DROP POLICY IF EXISTS "Owners update managed people" ON public.managed_wishlist_people;
CREATE POLICY "Owners update managed people" ON public.managed_wishlist_people FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.wishlists w WHERE w.id = wishlist_id AND w.user_id = auth.uid())
) WITH CHECK (EXISTS (SELECT 1 FROM public.wishlists w WHERE w.id = wishlist_id AND w.user_id = auth.uid() AND w.type = 'managed'));
GRANT SELECT, INSERT, UPDATE ON public.managed_wishlist_people TO authenticated;
