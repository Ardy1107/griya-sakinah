-- =============================================
-- ANGSURAN SAKINAH - SUPABASE SETUP
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create USERS table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'developer', 'superadmin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create UNITS table (blok rumah)
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_number VARCHAR(20) UNIQUE NOT NULL,
  resident_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  due_day INTEGER DEFAULT 10,
  has_addon BOOLEAN DEFAULT false,
  total_addon_cost DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create PAYMENTS table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('pokok', 'tambahan')),
  amount DECIMAL(15,2) NOT NULL,
  installment_no INTEGER,
  payment_date DATE,
  payment_month_key VARCHAR(10),
  payment_month_display VARCHAR(50),
  status VARCHAR(20) DEFAULT 'lunas',
  evidence_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create EXPENSES table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  expense_date DATE DEFAULT CURRENT_DATE,
  evidence_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create AUDIT_LOGS table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INSERT DEFAULT USERS
-- =============================================
INSERT INTO users (username, password_hash, name, role) VALUES
('admin', 'admin123', 'Administrator', 'admin'),
('devi', 'devi123', 'Developer Griya Sakinah', 'developer')
ON CONFLICT (username) DO NOTHING;

-- =============================================
-- ENABLE ROW LEVEL SECURITY (Optional)
-- =============================================
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE units ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SAMPLE DATA (Optional - uncomment to use)
-- =============================================
-- INSERT INTO units (block_number, resident_name, phone, due_day) VALUES
-- ('A-01', 'Budi Santoso', '081234567890', 10),
-- ('A-02', 'Siti Rahayu', '081234567891', 15),
-- ('B-01', 'Ahmad Hidayat', '081234567892', 5);
