-- =====================================================
-- SEFT PROXY / SURROGATE SESSIONS TABLE
-- Untuk mencatat history SEFT yang didoakan untuk orang lain
-- =====================================================

-- Create table for SEFT Proxy sessions
CREATE TABLE IF NOT EXISTS spiritual_seft_proxy (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Target info
    target_name TEXT NOT NULL,
    relationship TEXT NOT NULL, -- Ibu, Bapak, Anak, Suami/Istri, Saudara, Teman, dll
    
    -- Problem info
    problem TEXT NOT NULL,
    category TEXT, -- Kesehatan, Keluarga, Trauma, Mental
    
    -- Session info
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    waktu TIME DEFAULT CURRENT_TIME,
    completed BOOLEAN DEFAULT true,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE spiritual_seft_proxy ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (device-based tracking)
CREATE POLICY "Allow all operations on spiritual_seft_proxy" ON spiritual_seft_proxy
    FOR ALL USING (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_seft_proxy_device_id ON spiritual_seft_proxy(device_id);
CREATE INDEX IF NOT EXISTS idx_seft_proxy_tanggal ON spiritual_seft_proxy(tanggal);
CREATE INDEX IF NOT EXISTS idx_seft_proxy_target ON spiritual_seft_proxy(target_name);

-- Grant permissions
GRANT ALL ON spiritual_seft_proxy TO anon;
GRANT ALL ON spiritual_seft_proxy TO authenticated;

-- Comment
COMMENT ON TABLE spiritual_seft_proxy IS 'SEFT Proxy/Surrogate sessions - mendoakan/SEFT untuk orang lain';
