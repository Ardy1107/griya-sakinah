-- =============================================
-- ADD STARTING INSTALLMENT COLUMN TO UNITS TABLE
-- Run this in Supabase SQL Editor
-- =============================================

-- Add starting_installment column (angsuran dimulai dari ke berapa)
ALTER TABLE units ADD COLUMN IF NOT EXISTS starting_installment INTEGER DEFAULT 0;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'units' 
AND column_name = 'starting_installment';
