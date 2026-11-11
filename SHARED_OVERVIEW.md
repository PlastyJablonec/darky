# Shared wishlist overview

The public wishlist page displays an anniversary overview for authenticated viewers only, using profile dates for personal lists and managed-person dates for managed lists. Date access follows the existing database policies; anonymous visitors are offered sign-in with a return link. Dates display day and month, never birth year. The reservation overview counts non-received gifts independent of filters and refreshes when the gifts subscription emits changes or the page regains focus. Personal wishlist owners do not see the reservation summary or reservation status through the shared page. The managed-list message states that its owner can see reservations.

Run `node test-shared-overview.mjs` to verify counts, archived gifts, empty states and the absence of birth years in rendered dates.
