# Changelog

## [1.2.0] - 2025-12-04
### Added
- **Wishlist Types**: Support for "Personal" and "Managed" wishlists.
  - Personal wishlists (default): Owner cannot see reservation status (surprises).
  - Managed wishlists: Owner can see all reservations (useful for managing lists for children/others).
- **Conversion Flow**: Ability to irreversibly convert a Personal wishlist to a Managed wishlist.
- **New Wishlist Modal**: Added type selection when creating a new wishlist.
- **Favicon**: Added application icon.

### Changed
- Updated `WishlistDetail` to respect wishlist type for reservation visibility.
- Updated `useWishlists` hook to support `type` field.
- Database schema updated to include `type` column in `wishlists` table.

## [1.1.0] - Previous Version
- Initial release features (assumed).
