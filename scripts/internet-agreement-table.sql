-- =====================================================
-- Internet Agreement - Digital Signature Table
-- Run this in Supabase SQL Editor
-- =====================================================

-- Table for storing user agreements
CREATE TABLE IF NOT EXISTS internet_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID,  -- Reference to resident (no FK constraint for flexibility)
    blok_rumah TEXT NOT NULL,
    nama_warga TEXT NOT NULL,
    signature_data TEXT NOT NULL,  -- Base64 encoded signature image
    agreed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    block_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_internet_agreements_resident ON internet_agreements(resident_id);
CREATE INDEX IF NOT EXISTS idx_internet_agreements_blok ON internet_agreements(blok_rumah);

-- Enable RLS
ALTER TABLE internet_agreements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read on internet_agreements" ON internet_agreements;
DROP POLICY IF EXISTS "Allow public insert on internet_agreements" ON internet_agreements;

-- Allow read for all (to check if already signed)
CREATE POLICY "Allow public read on internet_agreements" 
ON internet_agreements FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow insert for all (public can sign)
CREATE POLICY "Allow public insert on internet_agreements" 
ON internet_agreements FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

