\pset tuples_only on
\pset format unaligned
\pset fieldsep ' | '

SELECT 'auth.users', count(*) FROM auth.users;
SELECT 'auth.identities', count(*) FROM auth.identities;
SELECT 'public.profiles', count(*) FROM public.profiles;
SELECT 'public.wishlists', count(*) FROM public.wishlists;
SELECT 'public.gifts', count(*) FROM public.gifts;
SELECT 'public.wishlist_shares', count(*) FROM public.wishlist_shares;
SELECT 'public.wishlist_views', count(*) FROM public.wishlist_views;
SELECT 'public.gift_contributions', count(*) FROM public.gift_contributions;
SELECT 'public.gift_contribution_messages', count(*) FROM public.gift_contribution_messages;
SELECT 'public.group_gift_suggestions', count(*) FROM public.group_gift_suggestions;
