-- =============================================
-- Warga Portal - Database Setup
-- Portal Griya Sakinah
-- =============================================

-- Table: warga_users
-- Stores resident information and access controls
CREATE TABLE IF NOT EXISTS warga_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blok VARCHAR(10) UNIQUE NOT NULL,          -- Block number: A1, B10, etc.
    nama VARCHAR(255) NOT NULL,                 -- Full name
    phone VARCHAR(20),                          -- Phone number
    email VARCHAR(255),                         -- Email (optional)
    
    -- Access Controls (managed by Superadmin)
    can_view_internet BOOLEAN DEFAULT true,     -- Can view Internet status
    can_view_angsuran BOOLEAN DEFAULT true,     -- Can view Angsuran status
    can_view_musholla BOOLEAN DEFAULT true,     -- Can view Musholla donations
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by blok
CREATE INDEX IF NOT EXISTS idx_warga_users_blok ON warga_users(blok);

-- Index for active users
CREATE INDEX IF NOT EXISTS idx_warga_users_active ON warga_users(is_active);

-- Enable RLS
ALTER TABLE warga_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Public can read active warga" ON warga_users;
DROP POLICY IF EXISTS "Admins have full access" ON warga_users;
DROP POLICY IF EXISTS "Allow public read" ON warga_users;

-- Policy: Allow anyone (including anon) to read active warga
CREATE POLICY "Allow public read" ON warga_users
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Policy: Authenticated users can insert/update/delete
CREATE POLICY "Admins have full access" ON warga_users
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =============================================
-- Sample Data (for testing)
-- =============================================

INSERT INTO warga_users (blok, nama, phone, can_view_internet, can_view_angsuran, can_view_musholla) VALUES
    ('A1', 'Bapak Ahmad', '081234567890', true, true, true),
    ('A2', 'Ibu Siti', '081234567891', true, true, false),
    ('A3', 'Bapak Budi', '081234567892', true, false, true),
    ('B1', 'Ibu Rani', '081234567893', false, true, true),
    ('B2', 'Bapak Dedi', '081234567894', true, true, true),
    ('B3', 'Ibu Lina', '081234567895', true, true, true),
    ('C1', 'Bapak Hasan', '081234567896', true, true, true),
    ('C2', 'Ibu Mega', '081234567897', true, true, true),
    ('C3', 'Bapak Yusuf', '081234567898', true, true, true),
    ('D1', 'Ibu Nur', '081234567899', true, true, true)
ON CONFLICT (blok) DO NOTHING;

-- =============================================
-- Function: Update timestamp on edit
-- =============================================

CREATE OR REPLACE FUNCTION update_warga_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamp
DROP TRIGGER IF EXISTS trigger_warga_timestamp ON warga_users;
CREATE TRIGGER trigger_warga_timestamp
    BEFORE UPDATE ON warga_users
    FOR EACH ROW
    EXECUTE FUNCTION update_warga_timestamp();
