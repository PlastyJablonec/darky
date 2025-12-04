-- Add type column to wishlists table
ALTER TABLE wishlists 
ADD COLUMN type text NOT NULL DEFAULT 'personal' 
CHECK (type IN ('personal', 'managed'));

-- Comment on column
COMMENT ON COLUMN wishlists.type IS 'Type of the wishlist: personal (owner cannot see reservations) or managed (owner sees reservations)';
