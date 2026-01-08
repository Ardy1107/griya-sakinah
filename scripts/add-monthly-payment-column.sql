-- =============================================
-- ADD MONTHLY PAYMENT COLUMN TO UNITS TABLE
-- Run this in Supabase SQL Editor
-- =============================================

-- Add monthly_payment column (nominal angsuran bulanan per unit)
ALTER TABLE units ADD COLUMN IF NOT EXISTS monthly_payment BIGINT DEFAULT 0;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'units' 
AND column_name = 'monthly_payment';
