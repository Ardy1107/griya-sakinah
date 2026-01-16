-- =====================================================
-- SEFT ANALYTICS DATABASE SETUP
-- Additional tables for SEFT Analytics Dashboard
-- =====================================================

-- 1. User Settings for SEFT targets and preferences
CREATE TABLE IF NOT EXISTS spiritual_seft_user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    device_id VARCHAR(100),
    target_daily_sessions INTEGER DEFAULT 2,
    program_days INTEGER DEFAULT 14, -- 7/14/30
    notification_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(device_id)
);

-- 2. Add kategori column to seft_sessions if not exists
ALTER TABLE spiritual_seft_sessions 
ADD COLUMN IF NOT EXISTS kategori VARCHAR(50);

-- 3. Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_seft_sessions_device_date ON spiritual_seft_sessions(device_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_seft_sessions_emosi ON spiritual_seft_sessions(emosi_nama, tanggal);
CREATE INDEX IF NOT EXISTS idx_seft_user_settings_device ON spiritual_seft_user_settings(device_id);

-- 4. Enable RLS
ALTER TABLE spiritual_seft_user_settings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy
CREATE POLICY "Users can manage own seft_user_settings" 
ON spiritual_seft_user_settings FOR ALL USING (true);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- Run this script in Supabase SQL Editor to create analytics tables
