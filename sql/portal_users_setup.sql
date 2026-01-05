-- ========================================
-- Portal Griya Sakinah - Unified Auth Schema
-- Run this in Supabase SQL Editor (Angsuran instance)
-- ========================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if exists (for clean migration)
DROP TABLE IF EXISTS portal_users CASCADE;

-- Users table for all portal users
CREATE TABLE portal_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'warga')),
    module_access TEXT[] DEFAULT '{}',
    blok TEXT,
    nomor TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_portal_users_username ON portal_users(username);
CREATE INDEX idx_portal_users_role ON portal_users(role);
CREATE INDEX idx_portal_users_blok ON portal_users(blok);

-- Insert default superadmin
INSERT INTO portal_users (username, password, full_name, role, module_access)
VALUES ('superadmin', 'super123', 'Super Administrator', 'superadmin', ARRAY['angsuran', 'internet', 'musholla', 'komunitas']);

-- Insert default admins for Angsuran module
INSERT INTO portal_users (username, password, full_name, role, module_access)
VALUES 
    ('admin', 'admin123', 'Admin Angsuran', 'admin', ARRAY['angsuran']),
    ('devi', 'devi123', 'Devi Indah S', 'admin', ARRAY['angsuran']),
    ('developer', 'dev123', 'Developer', 'admin', ARRAY['angsuran', 'internet', 'musholla', 'komunitas']);

-- Insert warga users (28 Kepala Keluarga)
INSERT INTO portal_users (username, password, full_name, role, blok, nomor, module_access) VALUES
    ('A1', 'warga123', 'Warga Blok A1', 'warga', 'A', '1', ARRAY['warga']),
    ('A2', 'warga123', 'Warga Blok A2', 'warga', 'A', '2', ARRAY['warga']),
    ('A3', 'warga123', 'Warga Blok A3', 'warga', 'A', '3', ARRAY['warga']),
    ('A5', 'warga123', 'Warga Blok A5', 'warga', 'A', '5', ARRAY['warga']),
    ('A6', 'warga123', 'Warga Blok A6', 'warga', 'A', '6', ARRAY['warga']),
    ('A7', 'warga123', 'Warga Blok A7', 'warga', 'A', '7', ARRAY['warga']),
    ('A8', 'warga123', 'Warga Blok A8', 'warga', 'A', '8', ARRAY['warga']),
    ('A9', 'warga123', 'Warga Blok A9', 'warga', 'A', '9', ARRAY['warga']),
    ('A10', 'warga123', 'Warga Blok A10', 'warga', 'A', '10', ARRAY['warga']),
    ('A11', 'warga123', 'Warga Blok A11', 'warga', 'A', '11', ARRAY['warga']),
    ('A12', 'warga123', 'Warga Blok A12', 'warga', 'A', '12', ARRAY['warga']),
    ('B1', 'warga123', 'Warga Blok B1', 'warga', 'B', '1', ARRAY['warga']),
    ('B2', 'warga123', 'Warga Blok B2', 'warga', 'B', '2', ARRAY['warga']),
    ('B3', 'warga123', 'Warga Blok B3', 'warga', 'B', '3', ARRAY['warga']),
    ('B5', 'warga123', 'Warga Blok B5', 'warga', 'B', '5', ARRAY['warga']),
    ('B6', 'warga123', 'Warga Blok B6', 'warga', 'B', '6', ARRAY['warga']),
    ('B7', 'warga123', 'Warga Blok B7', 'warga', 'B', '7', ARRAY['warga']),
    ('B8', 'warga123', 'Warga Blok B8', 'warga', 'B', '8', ARRAY['warga']),
    ('B9', 'warga123', 'Warga Blok B9', 'warga', 'B', '9', ARRAY['warga']),
    ('B10', 'warga123', 'Warga Blok B10', 'warga', 'B', '10', ARRAY['warga']),
    ('B11', 'warga123', 'Warga Blok B11', 'warga', 'B', '11', ARRAY['warga']),
    ('B12', 'warga123', 'Warga Blok B12', 'warga', 'B', '12', ARRAY['warga']),
    ('C1', 'warga123', 'Warga Blok C1', 'warga', 'C', '1', ARRAY['warga']),
    ('C2', 'warga123', 'Warga Blok C2', 'warga', 'C', '2', ARRAY['warga']),
    ('C3', 'warga123', 'Warga Blok C3', 'warga', 'C', '3', ARRAY['warga']),
    ('C5', 'warga123', 'Warga Blok C5', 'warga', 'C', '5', ARRAY['warga']),
    ('C6', 'warga123', 'Warga Blok C6', 'warga', 'C', '6', ARRAY['warga']),
    ('C7', 'warga123', 'Warga Blok C7', 'warga', 'C', '7', ARRAY['warga']);

-- Enable RLS (Row Level Security)
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read for login verification
CREATE POLICY "Allow public read for login" ON portal_users
    FOR SELECT USING (true);

-- Policy: Allow authenticated users to update their own last_login
CREATE POLICY "Allow update own last_login" ON portal_users
    FOR UPDATE USING (true);

-- Verify
SELECT * FROM portal_users ORDER BY role, username;
