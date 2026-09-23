-- =============================================
-- Add PIN column to angsuran users table
-- Run this in Supabase SQL Editor
-- =============================================
-- Table: users (columns: id, nama, email, role, created_at)

-- Step 1: Add pin_hash column
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255);

-- Step 2: Set PIN 2026 for admin user (SHA-256 hash of "2026")
UPDATE users 
SET pin_hash = '158a323a7ba44870f23d96f1516dd70aa48e9a72db4ebb026b0a89e212a208ab' 
WHERE role = 'admin';

-- Step 3: Verify
SELECT id, nama, email, role, 
       CASE WHEN pin_hash IS NOT NULL THEN 'Has PIN' ELSE 'No PIN' END as pin_status
FROM users;
