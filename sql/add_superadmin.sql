-- Add Superadmin to portal_users table in Supabase Angsuran
-- Run this in Supabase SQL Editor

-- First check if table exists, if not create it
CREATE TABLE IF NOT EXISTS portal_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    module_access TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert or Update superadmin
INSERT INTO portal_users (username, password, full_name, role, module_access, is_active)
VALUES (
    'superadmin',
    'super123',
    'Super Administrator',
    'superadmin',
    ARRAY['angsuran', 'internet', 'musholla', 'komunitas'],
    true
)
ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    module_access = EXCLUDED.module_access,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verify
SELECT username, full_name, role, module_access, is_active FROM portal_users WHERE username = 'superadmin';
