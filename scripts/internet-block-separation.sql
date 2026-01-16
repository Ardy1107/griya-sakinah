-- =====================================================
-- Internet Sakinah - Block Separation Migration Script
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create block_config table
CREATE TABLE IF NOT EXISTS block_config (
    id TEXT PRIMARY KEY,  -- 'A' or 'B'
    name TEXT NOT NULL,   -- 'Blok A', 'Blok B'
    initial_balance NUMERIC DEFAULT 0,
    monthly_fee NUMERIC DEFAULT 150000,
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default block configurations
INSERT INTO block_config (id, name, initial_balance, monthly_fee) VALUES
    ('A', 'Blok A', 0, 150000),
    ('B', 'Blok B', 0, 150000)
ON CONFLICT (id) DO NOTHING;

-- 2. Add block_id column to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS block_id TEXT REFERENCES block_config(id);

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_expenses_block_id ON expenses(block_id);

-- 3. Enable RLS policies for block isolation
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "Allow public read on expenses" ON expenses;
DROP POLICY IF EXISTS "Allow authenticated insert on expenses" ON expenses;
DROP POLICY IF EXISTS "Allow authenticated update on expenses" ON expenses;
DROP POLICY IF EXISTS "Allow authenticated delete on expenses" ON expenses;
DROP POLICY IF EXISTS "Allow public read on block_config" ON block_config;

-- Policy: Allow read access to all (for public dashboard)
CREATE POLICY "Allow public read on expenses" 
ON expenses FOR SELECT 
TO anon, authenticated 
USING (true);

-- Policy: Allow insert/update for authenticated users
CREATE POLICY "Allow authenticated insert on expenses" 
ON expenses FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on expenses" 
ON expenses FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated delete on expenses" 
ON expenses FOR DELETE 
TO authenticated 
USING (true);

-- Block config readable by all
CREATE POLICY "Allow public read on block_config" 
ON block_config FOR SELECT 
TO anon, authenticated 
USING (true);

-- =====================================================
-- OPTIONAL: Migrate existing expenses to a block
-- Uncomment and modify as needed
-- =====================================================

-- Option A: Assign ALL existing expenses to Blok A
-- UPDATE expenses SET block_id = 'A' WHERE block_id IS NULL;

-- Option B: Assign based on date (example: before 2026 = A, after = B)
-- UPDATE expenses SET block_id = 'A' WHERE block_id IS NULL AND tanggal < '2026-01-01';
-- UPDATE expenses SET block_id = 'B' WHERE block_id IS NULL AND tanggal >= '2026-01-01';

-- Option C: Leave as NULL (superadmin sees all, blocks start fresh)
-- (default - no action needed)

-- =====================================================
-- Verify migration
-- =====================================================
SELECT 
    'block_config' as table_name, 
    COUNT(*) as row_count 
FROM block_config
UNION ALL
SELECT 
    'expenses with block_id', 
    COUNT(*) 
FROM expenses 
WHERE block_id IS NOT NULL;
