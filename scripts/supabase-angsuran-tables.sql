-- =============================================
-- Units Table for Angsuran Module - Griya Sakinah
-- Run this in Supabase SQL Editor
-- =============================================

-- Create units table
CREATE TABLE IF NOT EXISTS units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    block_number VARCHAR(50) NOT NULL,
    resident_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    due_day INTEGER DEFAULT 10,
    has_addon BOOLEAN DEFAULT false,
    total_addon_cost BIGINT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'aktif',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_units_block_number ON units(block_number);
CREATE INDEX IF NOT EXISTS idx_units_status ON units(status);

-- Enable RLS
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read units" ON units
    FOR SELECT USING (true);

-- Allow insert
CREATE POLICY "Allow insert units" ON units
    FOR INSERT WITH CHECK (true);

-- Allow update
CREATE POLICY "Allow update units" ON units
    FOR UPDATE USING (true);

-- Allow delete
CREATE POLICY "Allow delete units" ON units
    FOR DELETE USING (true);

-- =============================================
-- Payments Table for Angsuran Module
-- =============================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    installment_no INTEGER,
    payment_date DATE,
    payment_month_key VARCHAR(20),
    payment_month_display VARCHAR(100),
    status VARCHAR(50) DEFAULT 'lunas',
    evidence_url TEXT,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_unit_id ON payments(unit_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read payments" ON payments
    FOR SELECT USING (true);

CREATE POLICY "Allow insert payments" ON payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update payments" ON payments
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete payments" ON payments
    FOR DELETE USING (true);

-- =============================================
-- Audit Logs Table
-- =============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read audit_logs" ON audit_logs
    FOR SELECT USING (true);

CREATE POLICY "Allow insert audit_logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- =============================================
-- Verify tables
-- =============================================
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
