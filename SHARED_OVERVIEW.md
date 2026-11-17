# Shared wishlist overview

The public wishlist page displays an anniversary overview for authenticated viewers only, using profile dates for personal lists and managed-person dates for managed lists. The Christmas countdown is visible to everyone and rolls over after December 24. Personal date access follows the existing database policies; anonymous visitors are offered sign-in with a return link. Dates display day and month, never birth year. The reservation overview counts non-received gifts independent of filters and refreshes when the gifts subscription emits changes or the page regains focus. Personal wishlist owners do not see the reservation summary or reservation status through the shared page. The managed-list message states that its owner can see reservations.

Run `node test-shared-overview.mjs` to verify counts, archived gifts, empty states and the absence of birth years in rendered dates.

## Nové dárky ve sdílených seznamech

Přihlášenému příjemci se v přehledu sdílených seznamů zobrazuje počet aktivních dárků přidaných po jeho posledním otevření daného seznamu. Po otevření jsou tyto dárky označené a tlačítko umožňuje zobrazit je bez ostatních filtrů. Při prvním otevření se vytvoří výchozí bod; starší dárky se za nové nepovažují. Další otevření označí dárky načtené při předchozí návštěvě jako viděné. Údaj je uložen pro každého příjemce v existujícím `wishlist_shares.viewed_at`, bez nové migrace; anonymní návštěvy se takto nesledují.
