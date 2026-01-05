-- =============================================
-- PORTAL WARGA - SIMPLE ROLE SETUP
-- Add role columns to residents table
-- Run in Internet Sakinah Supabase
-- =============================================

-- Add role columns to residents table
ALTER TABLE residents 
ADD COLUMN IF NOT EXISTS has_internet BOOLEAN DEFAULT true;

ALTER TABLE residents 
ADD COLUMN IF NOT EXISTS has_angsuran BOOLEAN DEFAULT false;

ALTER TABLE residents 
ADD COLUMN IF NOT EXISTS has_musholla BOOLEAN DEFAULT false;

-- Update existing residents - set has_internet = true for all
UPDATE residents SET has_internet = true WHERE has_internet IS NULL;

-- =============================================
-- EXAMPLE: Set roles for specific resident
-- =============================================
-- UPDATE residents 
-- SET has_internet = true, has_angsuran = true, has_musholla = false 
-- WHERE blok_rumah = 'A1';
