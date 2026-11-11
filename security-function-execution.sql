-- Internal helpers bypass row policies and are not called directly by the application.
REVOKE EXECUTE ON FUNCTION public.get_gift_contribution_total(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_gift_suggestion_count(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_user_suggested_gift(uuid, uuid) FROM PUBLIC, anon, authenticated;
-- Authenticated contribution triggers still use this helper; anonymous access is unnecessary.
REVOKE EXECUTE ON FUNCTION public.is_gift_fully_funded(uuid) FROM PUBLIC, anon;
