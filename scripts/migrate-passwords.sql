-- Migration: Hash existing plaintext passwords in portal_users table
-- Run this ONCE after deploying the new auth code
-- This converts existing plaintext passwords to SHA-256 hashes

-- IMPORTANT: This uses Supabase's pgcrypto extension
-- Make sure to enable it first: CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 1: Add new password_hash column if it doesn't exist
ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Step 2: Hash existing passwords
-- SHA-256 hash using encode(digest(...))
UPDATE portal_users
SET password_hash = encode(digest(password, 'sha256'), 'hex')
WHERE password IS NOT NULL
  AND password_hash IS NULL;

-- Step 3: After verifying logins work, drop the old password column
-- DO NOT run this until you've confirmed the new auth works!
-- ALTER TABLE portal_users DROP COLUMN password;

-- Note: New users created through AdminAuthContext will automatically
-- use password_hash via the hashPassword() function in the frontend.
