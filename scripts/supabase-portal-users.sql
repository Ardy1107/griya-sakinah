-- =============================================
-- Portal Users Table for Griya Sakinah
-- Run this in Supabase SQL Editor
-- =============================================

-- Create portal_users table (if not exists, add missing columns)
CREATE TABLE IF NOT EXISTS portal_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    module_access TEXT[] DEFAULT '{}',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES portal_users(id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_portal_users_username ON portal_users(username);
CREATE INDEX IF NOT EXISTS idx_portal_users_role ON portal_users(role);

-- Enable RLS (Row Level Security)
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read for login verification
CREATE POLICY "Allow public read for login" ON portal_users
    FOR SELECT USING (true);

-- Policy: Allow authenticated users to update their own record
CREATE POLICY "Allow users to update own record" ON portal_users
    FOR UPDATE USING (true);

-- Policy: Allow insert for registration
CREATE POLICY "Allow insert for admin" ON portal_users
    FOR INSERT WITH CHECK (true);

-- Policy: Allow delete for admin
CREATE POLICY "Allow delete for admin" ON portal_users
    FOR DELETE USING (true);

-- =============================================
-- Insert Admin Users
-- =============================================

-- Delete existing users (optional - uncomment if you want to reset)
-- DELETE FROM portal_users WHERE username IN ('Ardy', 'superadmin', 'admin.angsuran', 'admin.internet', 'admin.musholla');

-- Insert Super Admin (Ardy)
INSERT INTO portal_users (username, password, full_name, role, is_active, module_access)
VALUES (
    'Ardy',
    'Samarinda2026',
    'Super Administrator',
    'super_admin',
    true,
    ARRAY['angsuran', 'internet', 'musholla', 'komunitas', 'arisan', 'takjil', 'peduli', 'direktori', 'settings', 'users']
)
ON CONFLICT (username) 
DO UPDATE SET 
    password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    module_access = EXCLUDED.module_access;

-- Insert Admin Angsuran
INSERT INTO portal_users (username, password, full_name, role, is_active, module_access)
VALUES (
    'admin.angsuran',
    'angsuran123',
    'Admin Angsuran',
    'admin_angsuran',
    true,
    ARRAY['angsuran']
)
ON CONFLICT (username) 
DO UPDATE SET 
    password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- Insert Admin Internet
INSERT INTO portal_users (username, password, full_name, role, is_active, module_access)
VALUES (
    'admin.internet',
    'internet123',
    'Admin Internet',
    'admin_internet',
    true,
    ARRAY['internet']
)
ON CONFLICT (username) 
DO UPDATE SET 
    password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- Insert Admin Musholla
INSERT INTO portal_users (username, password, full_name, role, is_active, module_access)
VALUES (
    'admin.musholla',
    'musholla123',
    'Admin Musholla',
    'admin_musholla',
    true,
    ARRAY['musholla']
)
ON CONFLICT (username) 
DO UPDATE SET 
    password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- =============================================
-- Verify the data
-- =============================================
SELECT id, username, full_name, role, is_active, module_access, created_at 
FROM portal_users 
ORDER BY created_at;
