-- Migration: Add is_received column to gifts table
-- Run this in Supabase SQL Editor

-- Add is_received column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'gifts' 
        AND column_name = 'is_received'
    ) THEN
        ALTER TABLE public.gifts ADD COLUMN is_received BOOLEAN DEFAULT false;
        RAISE NOTICE 'Column is_received added successfully';
    ELSE
        RAISE NOTICE 'Column is_received already exists';
    END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'gifts' 
AND column_name = 'is_received';
