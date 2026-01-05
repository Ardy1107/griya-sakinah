-- ========================================
-- Insert Units for Griya Sakinah
-- A1-A18 & B1-B20 (38 total units)
-- Run this in Supabase SQL Editor (Angsuran instance)
-- ========================================

-- Using correct column names: block_number, resident_name

-- Insert Blok A (A1 - A18)
INSERT INTO units (block_number, resident_name, phone, due_day, has_addon, total_addon_cost) VALUES
('A1', 'Pemilik A1', NULL, 10, false, 0),
('A2', 'Pemilik A2', NULL, 10, false, 0),
('A3', 'Pemilik A3', NULL, 10, false, 0),
('A4', 'Pemilik A4', NULL, 10, false, 0),
('A5', 'Pemilik A5', NULL, 10, false, 0),
('A6', 'Pemilik A6', NULL, 10, false, 0),
('A7', 'Pemilik A7', NULL, 10, false, 0),
('A8', 'Pemilik A8', NULL, 10, false, 0),
('A9', 'Pemilik A9', NULL, 10, false, 0),
('A10', 'Pemilik A10', NULL, 10, false, 0),
('A11', 'Pemilik A11', NULL, 10, false, 0),
('A12', 'Pemilik A12', NULL, 10, false, 0),
('A13', 'Pemilik A13', NULL, 10, false, 0),
('A14', 'Pemilik A14', NULL, 10, false, 0),
('A15', 'Pemilik A15', NULL, 10, false, 0),
('A16', 'Pemilik A16', NULL, 10, false, 0),
('A17', 'Pemilik A17', NULL, 10, false, 0),
('A18', 'Pemilik A18', NULL, 10, false, 0)
ON CONFLICT (block_number) DO NOTHING;

-- Insert Blok B (B1 - B20)
INSERT INTO units (block_number, resident_name, phone, due_day, has_addon, total_addon_cost) VALUES
('B1', 'Pemilik B1', NULL, 10, false, 0),
('B2', 'Pemilik B2', NULL, 10, false, 0),
('B3', 'Pemilik B3', NULL, 10, false, 0),
('B4', 'Pemilik B4', NULL, 10, false, 0),
('B5', 'Pemilik B5', NULL, 10, false, 0),
('B6', 'Pemilik B6', NULL, 10, false, 0),
('B7', 'Pemilik B7', NULL, 10, false, 0),
('B8', 'Pemilik B8', NULL, 10, false, 0),
('B9', 'Pemilik B9', NULL, 10, false, 0),
('B10', 'Pemilik B10', NULL, 10, false, 0),
('B11', 'Pemilik B11', NULL, 10, false, 0),
('B12', 'Pemilik B12', NULL, 10, false, 0),
('B13', 'Pemilik B13', NULL, 10, false, 0),
('B14', 'Pemilik B14', NULL, 10, false, 0),
('B15', 'Pemilik B15', NULL, 10, false, 0),
('B16', 'Pemilik B16', NULL, 10, false, 0),
('B17', 'Pemilik B17', NULL, 10, false, 0),
('B18', 'Pemilik B18', NULL, 10, false, 0),
('B19', 'Pemilik B19', NULL, 10, false, 0),
('B20', 'Pemilik B20', NULL, 10, false, 0)
ON CONFLICT (block_number) DO NOTHING;

-- Verify inserted data
SELECT block_number, resident_name, phone FROM units ORDER BY block_number;
