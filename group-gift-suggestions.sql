-- Table for tracking group gift suggestions
CREATE TABLE public.group_gift_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_id UUID NOT NULL REFERENCES public.gifts(id) ON DELETE CASCADE,
  suggested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate suggestions from same user for same gift
  UNIQUE(gift_id, suggested_by)
);

-- Index for performance
CREATE INDEX idx_group_gift_suggestions_gift_id ON public.group_gift_suggestions(gift_id);
CREATE INDEX idx_group_gift_suggestions_created_at ON public.group_gift_suggestions(created_at);

-- RLS Policies
ALTER TABLE public.group_gift_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can view suggestions for gifts from public wishlists they have access to
CREATE POLICY "View group gift suggestions" ON public.group_gift_suggestions
  FOR SELECT USING (
    -- Gift is from a public wishlist
    gift_id IN (
      SELECT g.id FROM public.gifts g
      JOIN public.wishlists w ON g.wishlist_id = w.id
      WHERE w.is_public = true
    )
  );

-- Users can create suggestions for gifts (but not their own)
CREATE POLICY "Create group gift suggestions" ON public.group_gift_suggestions
  FOR INSERT WITH CHECK (
    suggested_by = auth.uid()
    AND
    -- Cannot suggest for own gifts
    gift_id NOT IN (
      SELECT g.id FROM public.gifts g
      JOIN public.wishlists w ON g.wishlist_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

-- Function to get suggestion count for a gift
CREATE OR REPLACE FUNCTION get_gift_suggestion_count(gift_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT COUNT(*) FROM public.group_gift_suggestions WHERE gift_id = gift_uuid),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has suggested a gift
CREATE OR REPLACE FUNCTION has_user_suggested_gift(gift_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_gift_suggestions 
    WHERE gift_id = gift_uuid AND suggested_by = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE public.group_gift_suggestions IS 'Tracks suggestions to convert regular gifts to group gifts';
COMMENT ON FUNCTION get_gift_suggestion_count(UUID) IS 'Returns the number of suggestions for a gift';
COMMENT ON FUNCTION has_user_suggested_gift(UUID, UUID) IS 'Checks if a user has already suggested a gift for group funding';