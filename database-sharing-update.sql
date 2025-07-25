-- DárekList Sharing System Update
-- Spusťte pouze tento SQL kód v Supabase SQL Editor

-- Wishlist shares tabulka - kdo komu sdílel seznam
CREATE TABLE IF NOT EXISTS public.wishlist_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_id UUID REFERENCES public.wishlists(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  first_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist views tabulka - sledování zobrazení sdílených seznamů (i anonymní)
CREATE TABLE IF NOT EXISTS public.wishlist_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_id UUID REFERENCES public.wishlists(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id), -- NULL pro anonymní uživatele
  viewer_info JSONB, -- IP, user agent pro anonymní
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS pro nové tabulky
ALTER TABLE public.wishlist_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_views ENABLE ROW LEVEL SECURITY;

-- Smazat existující policies pokud existují
DROP POLICY IF EXISTS "users_see_their_shares" ON public.wishlist_shares;
DROP POLICY IF EXISTS "users_create_shares" ON public.wishlist_shares;
DROP POLICY IF EXISTS "owners_see_their_views" ON public.wishlist_views;
DROP POLICY IF EXISTS "anyone_can_add_view" ON public.wishlist_views;

-- Policies pro wishlist_shares
CREATE POLICY "users_see_their_shares" ON public.wishlist_shares
  FOR SELECT USING (
    auth.uid() = shared_by OR auth.uid() = shared_with
  );

CREATE POLICY "users_create_shares" ON public.wishlist_shares
  FOR INSERT WITH CHECK (
    auth.uid() = shared_by AND
    EXISTS (SELECT 1 FROM public.wishlists WHERE id = wishlist_id AND user_id = auth.uid())
  );

-- Policies pro wishlist_views
CREATE POLICY "owners_see_their_views" ON public.wishlist_views
  FOR SELECT USING (
    wishlist_id IN (
      SELECT id FROM public.wishlists WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "anyone_can_add_view" ON public.wishlist_views
  FOR INSERT WITH CHECK (true);

-- Indexy pro lepší výkon
CREATE INDEX IF NOT EXISTS idx_wishlist_shares_shared_by ON public.wishlist_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_wishlist_shares_shared_with ON public.wishlist_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_wishlist_shares_wishlist ON public.wishlist_shares(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_views_wishlist ON public.wishlist_views(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_views_viewer ON public.wishlist_views(viewer_id);

-- Ověření úspěchu
SELECT 'Sharing system successfully installed!' as result;