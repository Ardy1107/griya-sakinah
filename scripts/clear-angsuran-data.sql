-- =====================================================
-- CLEAR ALL ANGSURAN DATA
-- Run this in Supabase SQL Editor to delete all data
-- =====================================================

-- Disable triggers temporarily to avoid constraint issues
-- Step 1: Delete audit_logs first (has foreign key to units)
DELETE FROM audit_logs;

-- Step 2: Delete payments (has foreign key to units)
DELETE FROM payments;

-- Step 3: Delete units (main table)
DELETE FROM units;

-- Verify all tables are empty
SELECT 'units' as table_name, COUNT(*) as count FROM units
UNION ALL
SELECT 'payments' as table_name, COUNT(*) as count FROM payments
UNION ALL
SELECT 'audit_logs' as table_name, COUNT(*) as count FROM audit_logs;

-- If you want to reset auto-increment IDs (optional)
-- ALTER SEQUENCE units_id_seq RESTART WITH 1;
-- ALTER SEQUENCE payments_id_seq RESTART WITH 1;
-- ALTER SEQUENCE audit_logs_id_seq RESTART WITH 1;
