-- =============================================
-- RECREATE ANGSURAN TABLES WITH CORRECT SCHEMA
-- WARNING: This will DELETE existing data!
-- Run in Supabase SQL Editor
-- =============================================

-- Drop existing tables (in order of dependencies)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS units CASCADE;

-- =============================================
-- 1. UNITS TABLE
-- =============================================
CREATE TABLE units (
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

CREATE INDEX idx_units_block_number ON units(block_number);
CREATE INDEX idx_units_status ON units(status);

-- =============================================
-- 2. PAYMENTS TABLE 
-- =============================================
CREATE TABLE payments (
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

CREATE INDEX idx_payments_unit_id ON payments(unit_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- =============================================
-- 3. EXPENSES TABLE
-- =============================================
CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_name VARCHAR(255) NOT NULL,
    description TEXT,
    amount BIGINT NOT NULL,
    notes TEXT,
    evidence_link TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_created_at ON expenses(created_at);

-- =============================================
-- 4. AUDIT LOGS TABLE (with all required columns)
-- =============================================
CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- =============================================
-- DISABLE RLS FOR ALL TABLES (for development)
-- =============================================
ALTER TABLE units DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- =============================================
-- Verify tables were created
-- =============================================
SELECT table_name, 
       (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('units', 'payments', 'expenses', 'audit_logs')
ORDER BY table_name;
