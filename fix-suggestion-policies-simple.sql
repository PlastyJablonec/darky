-- Fix RLS policies for group_gift_suggestions table - Simple version

-- Add delete policy for users to delete their own suggestions
CREATE POLICY "Delete own group gift suggestions" ON public.group_gift_suggestions
  FOR DELETE USING (
    suggested_by = auth.uid()
  );

-- Update view policy - simple version without complex JOIN
DROP POLICY IF EXISTS "View group gift suggestions" ON public.group_gift_suggestions;

CREATE POLICY "View group gift suggestions" ON public.group_gift_suggestions
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON public.group_gift_suggestions TO authenticated;