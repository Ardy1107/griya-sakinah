-- Block PIN Settings for Internet Module
-- Run this in Supabase SQL Editor (project: wxfbulscyogddqsnmqhc)

-- Create settings table if not exists
CREATE TABLE IF NOT EXISTS internet_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default PINs (admin can change later)
INSERT INTO internet_settings (key, value) VALUES
    ('pin_blok_a', '1234'),
    ('pin_blok_b', '5678')
ON CONFLICT (key) DO NOTHING;

-- Allow read access for PIN verification (anon role)
ALTER TABLE internet_settings ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read settings (needed for PIN check)
CREATE POLICY "Allow read settings" ON internet_settings
    FOR SELECT USING (true);

-- Policy: only authenticated users can update settings
CREATE POLICY "Allow update settings for auth" ON internet_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: only authenticated users can insert settings
CREATE POLICY "Allow insert settings for auth" ON internet_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
