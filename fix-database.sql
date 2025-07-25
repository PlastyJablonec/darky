-- Oprava databázového schématu pro DárekList
-- Spusťte v Supabase SQL Editor

-- Nejdřív smazat existující tabulky pokud existují
DROP TABLE IF EXISTS public.gifts CASCADE;
DROP TABLE IF EXISTS public.wishlists CASCADE;

-- Wishlists tabulka s opravou foreign key
CREATE TABLE public.wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  occasion TEXT,
  is_public BOOLEAN DEFAULT false,
  share_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_wishlists_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Gifts tabulka
CREATE TABLE public.gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'CZK',
  product_url TEXT,
  image_url TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_reserved BOOLEAN DEFAULT false,
  reserved_by UUID,
  reserved_at TIMESTAMP WITH TIME ZONE,
  is_group_gift BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_gifts_wishlist_id FOREIGN KEY (wishlist_id) REFERENCES public.wishlists(id) ON DELETE CASCADE,
  CONSTRAINT fk_gifts_reserved_by FOREIGN KEY (reserved_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Row Level Security
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Smazat staré policies
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

-- Indexy
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_share_id ON public.wishlists(share_id);
CREATE INDEX IF NOT EXISTS idx_gifts_wishlist_id ON public.gifts(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_gifts_reserved_by ON public.gifts(reserved_by);

-- Grant oprávnění
GRANT ALL ON public.wishlists TO authenticated;
GRANT ALL ON public.gifts TO authenticated;
GRANT SELECT ON public.wishlists TO anon;
GRANT SELECT ON public.gifts TO anon;