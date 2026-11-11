-- Email addresses are account data and are never needed for viewing another profile.
REVOKE SELECT ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, display_name) ON public.profiles TO authenticated;
