# Group Gifts

This document explains how group-gift functionality works in the current application.

## What the feature does

Group gifts allow multiple users to coordinate around a more expensive gift without exposing the contributor details to the owner of a personal wishlist.

## Current Capabilities

### For contributors

- View that a gift is marked as a group gift
- See contribution progress
- Send coordination messages
- Participate without revealing private coordination details to the wishlist owner

### For wishlist owners

- Mark gifts as group gifts
- Keep the surprise intact on personal lists
- Avoid seeing contributor coordination in protected scenarios

## Main Data Model

The feature relies on these tables:

- `public.profiles`
- `public.gift_contributions`
- `public.gift_contribution_messages`
- `public.group_gift_suggestions`

Supporting tables:

- `public.wishlists`
- `public.gifts`

## Security Model

- Access is controlled through Supabase Auth
- Row Level Security protects contribution data
- The owner of a personal wishlist should not gain visibility into contributor-only coordination

## Implementation Areas

### Frontend

- Contribution and suggestion flows are handled in the React app
- Shared UI and gift state are exposed through components and services under `src/`

### Backend

- Data storage and policy enforcement live in Supabase
- Group gift support depends on the database schema already applied in the self-hosted instance

## Operational Notes

- During CSV migration, `gift_contributions` was not present in the export set, so that table may remain empty unless new contributions are created after migration
- `gift_contribution_messages` and `group_gift_suggestions` were imported successfully

## Testing Suggestions

Use at least two accounts:

1. Account A owns a wishlist.
2. Account B opens the shared wishlist and interacts with the group gift flow.

Verify:

- Shared page loads correctly
- Group gift UI appears
- Suggestion flow works
- Messages remain hidden from the protected owner view
