-- =====================================================
-- APP VERSIONS TABLE - For Self-Hosted OTA Updates
-- Run this in Supabase SQL Editor (Angsuran database)
-- =====================================================

-- Create app_versions table
CREATE TABLE IF NOT EXISTS app_versions (
    id SERIAL PRIMARY KEY,
    version TEXT NOT NULL UNIQUE,
    bundle_url TEXT NOT NULL,
    bundle_checksum TEXT,
    release_notes TEXT,
    is_mandatory BOOLEAN DEFAULT false,
    min_app_version TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for version lookup
CREATE INDEX IF NOT EXISTS idx_app_versions_version ON app_versions(version);

-- Enable RLS
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;

-- Allow public read (app needs to check versions)
CREATE POLICY "Public can read app versions" ON app_versions
    FOR SELECT USING (true);

-- Only authenticated can insert (for CI/CD via service key)
CREATE POLICY "Service can insert app versions" ON app_versions
    FOR INSERT WITH CHECK (true);

-- Insert initial version
INSERT INTO app_versions (version, bundle_url, release_notes, is_mandatory)
VALUES ('1.0.0', '', 'Initial release', false)
ON CONFLICT (version) DO NOTHING;

-- =====================================================
-- STORAGE BUCKET - For storing bundles
-- =====================================================
-- NOTE: Create bucket 'app-bundles' manually in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Click "New Bucket"
-- 3. Name: "app-bundles"
-- 4. Check "Public bucket" (for easy download)
-- 5. Click Create
