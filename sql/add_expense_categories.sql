-- Migration: Add new expense categories (Support, Listrik)
-- Run this in Supabase SQL Editor
-- Date: 2026-09-29

-- 1. Drop the existing category constraint (if exists)
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_kategori_check;

-- 2. Add updated constraint with new categories
ALTER TABLE expenses ADD CONSTRAINT expenses_kategori_check
    CHECK (kategori IN ('Bandwidth', 'Maintenance', 'Support', 'Listrik', 'Lainnya'));

-- 3. Update comment for documentation
COMMENT ON TABLE expenses IS 'Internet Sakinah operational expenses. Categories: Bandwidth (ISP), Support (support & maintenance), Listrik (electricity for Starlink & network devices), Maintenance (general), Lainnya (other)';
