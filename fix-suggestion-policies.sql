-- Fix RLS policies for group_gift_suggestions table

-- Add delete policy for users to delete their own suggestions
CREATE POLICY "Delete own group gift suggestions" ON public.group_gift_suggestions
  FOR DELETE USING (
    suggested_by = auth.uid()
  );

-- Update view policy to allow all authenticated users to see suggestions for public wishlists
DROP POLICY IF EXISTS "View group gift suggestions" ON public.group_gift_suggestions;

CREATE POLICY "View group gift suggestions" ON public.group_gift_suggestions
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND
    -- Gift is from a public wishlist
    gift_id IN (
      SELECT g.id 
      FROM public.gifts g
      JOIN public.wishlists w ON g.wishlist_id = w.id
      WHERE w.is_public = true
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON public.group_gift_suggestions TO authenticated;