-- === YOUMAN APP SUPABASE SCHEMA ===
-- Silakan COPY (Salin) seluruh kode di bawah ini lalu PASTE masuk ke dalam 
-- menu "SQL Editor" di Dashboard Supabase aplikasi Anda, lalu tekan tombol RUN / jalankan.

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  phone_verified BOOLEAN DEFAULT false,
  role VARCHAR(50) DEFAULT 'User' CHECK (role IN ('User', 'Admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  sales INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Out of Stock')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id VARCHAR(50) PRIMARY KEY, -- Misal TRX-XXXX
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, 
  user_name VARCHAR(255), -- Denormalisasi untuk kemudahan pencarian
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Success', 'Failed')),
  method VARCHAR(100), -- Contoh: Midtrans (GoPay)
  delivery_status VARCHAR(100) DEFAULT 'Processing' CHECK (delivery_status IN ('Processing', 'Shipped', 'Delivered')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER PROTOCOLS / RITUALS (Real-time Configured)
CREATE TABLE IF NOT EXISTS public.user_rituals (
    id VARCHAR(50) PRIMARY KEY, -- Kita gunakan string ID dari frontend (timestamp)
    user_id VARCHAR(255) NOT NULL, -- Auth ID / Device ID
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT false,
    date VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER STREAKS (Real-time Configured)
CREATE TABLE IF NOT EXISTS public.user_streaks (
    user_id VARCHAR(255) PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    last_update VARCHAR(50)
);

-- 6. USER HISTORY (Laporan Mingguan - Real-time Configured)
CREATE TABLE IF NOT EXISTS public.user_history (
    id VARCHAR(255) PRIMARY KEY, -- Format: {user_id}_{date}
    user_id VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    percentage INTEGER DEFAULT 0
);

-- MENGAKTIFKAN FITUR REALTIME PADA TABEL-TABEL USER APP
BEGIN;
  -- Remove existing realtime configurations if any to avoid duplicates
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.user_rituals, public.user_streaks, public.user_history;
COMMIT;

-- (OPSIONAL) DUMMY DATA AGAR TABEL TIDAK KOSONG SAAT UJI COBA PERTAMA
INSERT INTO public.users (name, email, phone, phone_verified, role) 
VALUES ('Reza Latandrang', 'reza@youman.com', '08122334455', true, 'Admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.products (name, price, stock, sales) 
VALUES ('YOUMAN Premium Kit', 299000, 45, 128);

INSERT INTO public.products (name, price, stock, sales) 
VALUES ('Basic Fitness Band', 89000, 12, 340);
