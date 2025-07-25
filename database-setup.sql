-- DárekList Database Schema Setup
-- Spusťte tento SQL kód v Supabase SQL Editor

-- POZNÁMKA: auth.users tabulku nelze měnit, používáme user_metadata místo toho

-- Wishlists tabulka
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  occasion TEXT,
  is_public BOOLEAN DEFAULT false,
  share_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gifts tabulka
CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_id UUID REFERENCES public.wishlists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'CZK',
  product_url TEXT,
  image_url TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_reserved BOOLEAN DEFAULT false,
  reserved_by UUID REFERENCES auth.users(id),
  reserved_at TIMESTAMP WITH TIME ZONE,
  is_group_gift BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Smazat existující policies pokud existují
DROP POLICY IF EXISTS "users_own_wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "public_wishlists_readable" ON public.wishlists;
DROP POLICY IF EXISTS "users_own_gifts" ON public.gifts;
DROP POLICY IF EXISTS "public_gifts_readable" ON public.gifts;
DROP POLICY IF EXISTS "authenticated_users_can_reserve" ON public.gifts;

-- Policies pro wishlists
CREATE POLICY "users_own_wishlists" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "public_wishlists_readable" ON public.wishlists
  FOR SELECT USING (is_public = true);

-- Policies pro gifts
CREATE POLICY "users_own_gifts" ON public.gifts
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.wishlists WHERE id = gifts.wishlist_id
    )
  );

CREATE POLICY "public_gifts_readable" ON public.gifts
  FOR SELECT USING (
    wishlist_id IN (
      SELECT id FROM public.wishlists WHERE is_public = true
    )
  );

CREATE POLICY "authenticated_users_can_reserve" ON public.gifts
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    wishlist_id IN (
      SELECT id FROM public.wishlists WHERE is_public = true
    )
  );

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
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_share_id ON public.wishlists(share_id);
CREATE INDEX IF NOT EXISTS idx_gifts_wishlist_id ON public.gifts(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_gifts_reserved_by ON public.gifts(reserved_by);
CREATE INDEX IF NOT EXISTS idx_wishlist_shares_shared_by ON public.wishlist_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_wishlist_shares_shared_with ON public.wishlist_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_wishlist_shares_wishlist ON public.wishlist_shares(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_views_wishlist ON public.wishlist_views(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_views_viewer ON public.wishlist_views(viewer_id);