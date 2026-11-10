-- Profile dates are separate from publicly readable profiles.
CREATE TABLE IF NOT EXISTS public.profile_dates (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  birth_date date CHECK (birth_date >= DATE '1900-01-01' AND birth_date <= CURRENT_DATE),
  name_day date CHECK (name_day >= DATE '2000-01-01' AND name_day <= DATE '2000-12-31')
);
ALTER TABLE public.profile_dates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profile dates visible to owner and recipients" ON public.profile_dates;
CREATE POLICY "Profile dates visible to owner and recipients" ON public.profile_dates
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.wishlist_shares s
      WHERE s.shared_by = profile_dates.user_id AND s.shared_with = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Users insert own profile dates" ON public.profile_dates;
CREATE POLICY "Users insert own profile dates" ON public.profile_dates
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Users update own profile dates" ON public.profile_dates;
CREATE POLICY "Users update own profile dates" ON public.profile_dates
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
GRANT SELECT, INSERT, UPDATE ON public.profile_dates TO authenticated;
