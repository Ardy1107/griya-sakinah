-- =====================================================
-- SEFT SESSIONS TABLE UPDATE
-- Add new columns for enhanced SEFT tracking
-- =====================================================

-- Add new columns if they don't exist
ALTER TABLE spiritual_seft_sessions 
ADD COLUMN IF NOT EXISTS kategori VARCHAR(100),
ADD COLUMN IF NOT EXISTS level_hawkins INTEGER,
ADD COLUMN IF NOT EXISTS mode_seft VARCHAR(30) DEFAULT 'mandiri', -- mandiri, surrogate, anak_preventif, anak_kuratif
ADD COLUMN IF NOT EXISTS target_name VARCHAR(200), -- for surrogate mode
ADD COLUMN IF NOT EXISTS target_relation VARCHAR(100), -- for surrogate mode
ADD COLUMN IF NOT EXISTS device_id VARCHAR(100); -- for anonymous users

-- Create index for device_id
CREATE INDEX IF NOT EXISTS idx_seft_sessions_device ON spiritual_seft_sessions(device_id);

-- Add daily count tracking table
CREATE TABLE IF NOT EXISTS spiritual_seft_daily_count (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    device_id VARCHAR(100),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tanggal),
    UNIQUE(device_id, tanggal)
);

-- Enable RLS
ALTER TABLE spiritual_seft_daily_count ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage own seft_daily_count" ON spiritual_seft_daily_count FOR ALL USING (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_seft_daily_count_user_date ON spiritual_seft_daily_count(user_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_seft_daily_count_device_date ON spiritual_seft_daily_count(device_id, tanggal);

-- Success message
-- Run this in Supabase SQL Editor to update SEFT tables
