# Changelog

## [1.4.0] - 2026-01-04
### Added
- **AI Gift Tips v4.0**: Significantly improved logic for gift recommendations.
  - Added support for latest Gemini models (including Gemini 2.0 Flash).
  - Enhanced Smart Fallback system with more diverse categories (Wellness, Home, Tech, Tools, Kitchen, Travel, Reading).
  - Increased variability of tips when AI is unavailable or under heavy load.
  - Better keyword detection for personalized suggestions based on existing wishlist items.

## [1.3.0] - 2025-12-10
### Added
- **About Page**: New page explaining how the app works (`/about`).
- **Shared Wishlist Assurance**: Friendly message for guests on Personal wishlists ("Pssst!").
- **Managed Wishlist Indicator**: Clear info box for owners of Managed wishlists.

### Changed
- **README**: Completely rewritten documentation with better "How to" and feature descriptions.
- **Footer**: Added link to "O aplikaci".

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
