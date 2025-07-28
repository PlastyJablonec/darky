-- Fix RLS policies for gift_contributions to prevent infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Contributors can view contributions for their group gifts" ON public.gift_contributions;
DROP POLICY IF EXISTS "Contributors can create contributions" ON public.gift_contributions;
DROP POLICY IF EXISTS "Contributors can update own contributions" ON public.gift_contributions;
DROP POLICY IF EXISTS "Contributors can delete own contributions" ON public.gift_contributions;

-- Create simpler, non-recursive policies

-- Policy 1: Contributors can view contributions for gifts they have access to
CREATE POLICY "View contributions for accessible gifts" ON public.gift_contributions
  FOR SELECT USING (
    -- User has contributed to this gift
    contributor_id = auth.uid()
    OR
    -- Gift is from a public wishlist (accessible to all authenticated users)
    gift_id IN (
      SELECT g.id FROM public.gifts g
      JOIN public.wishlists w ON g.wishlist_id = w.id
      WHERE w.is_public = true
    )
  );

-- Policy 2: Users can create contributions (but not for their own gifts)
CREATE POLICY "Create contributions" ON public.gift_contributions
  FOR INSERT WITH CHECK (
    contributor_id = auth.uid()
    AND
    -- Only for group gifts
    gift_id IN (SELECT id FROM public.gifts WHERE is_group_gift = true)
    AND
    -- Cannot contribute to own gifts (check wishlist owner)
    gift_id NOT IN (
      SELECT g.id FROM public.gifts g
      JOIN public.wishlists w ON g.wishlist_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

-- Policy 3: Users can update their own contributions
CREATE POLICY "Update own contributions" ON public.gift_contributions
  FOR UPDATE USING (contributor_id = auth.uid())
  WITH CHECK (contributor_id = auth.uid());

-- Policy 4: Users can delete their own contributions
CREATE POLICY "Delete own contributions" ON public.gift_contributions
  FOR DELETE USING (contributor_id = auth.uid());

-- Also fix the messages policies to be simpler
DROP POLICY IF EXISTS "Contributors can view messages for their group gifts" ON public.gift_contribution_messages;
DROP POLICY IF EXISTS "Contributors can create messages" ON public.gift_contribution_messages;

-- Policy 1: View messages if user has contributed to the gift
CREATE POLICY "View messages for contributed gifts" ON public.gift_contribution_messages
  FOR SELECT USING (
    -- User has contributed to this gift
    gift_id IN (
      SELECT gift_id FROM public.gift_contributions 
      WHERE contributor_id = auth.uid()
    )
  );

-- Policy 2: Create messages if user has contributed to the gift
CREATE POLICY "Create messages for contributed gifts" ON public.gift_contribution_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND
    -- User has contributed to this gift
    gift_id IN (
      SELECT gift_id FROM public.gift_contributions 
      WHERE contributor_id = auth.uid()
    )
  );