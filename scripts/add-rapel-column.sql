-- =============================================
-- ADD RAPEL BATCH ID TO PAYMENTS TABLE
-- Run this in Supabase SQL Editor
-- =============================================

-- Add rapel_batch_id column to link payments made in a single rapel transaction
ALTER TABLE payments ADD COLUMN IF NOT EXISTS rapel_batch_id UUID;

-- Add index for faster queries on rapel batches
CREATE INDEX IF NOT EXISTS idx_payments_rapel_batch_id ON payments(rapel_batch_id);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' 
AND column_name = 'rapel_batch_id';
