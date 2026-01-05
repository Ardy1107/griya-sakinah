-- ========================================
-- Update Devi - Developer Angsuran
-- Run this in Supabase SQL Editor (Angsuran instance)
-- ========================================

-- Update Devi with new password and developer role
UPDATE users 
SET password_hash = 'sakinah2026',
    name = 'Devi Indah S',
    role = 'developer'
WHERE username = 'devi';

-- Verify
SELECT username, name, role FROM users WHERE username = 'devi';
    `   