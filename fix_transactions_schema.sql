-- SQL Script untuk memperbaiki tabel 'transactions' agar sinkron dengan kode frontend
-- Silakan jalankan script ini di SQL Editor Supabase Anda

-- 1. Tambah kolom baru
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS proof_url TEXT,
ADD COLUMN IF NOT EXISTS shipping_receipt VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_courier VARCHAR(50) DEFAULT 'jne';

-- 2. Update Constraint Status
-- Kita perlu menghapus constraint lama dan membuat yang baru agar mendukung 'Menunggu Konfirmasi'
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_status_check;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('Pending', 'Success', 'Failed', 'Menunggu Konfirmasi'));

-- 3. Update Constraint Delivery Status (jika perlu tambahan status baru)
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_delivery_status_check;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_delivery_status_check 
CHECK (delivery_status IN ('Processing', 'Shipped', 'Delivered', 'Cancelled'));

COMMENT ON COLUMN public.transactions.items IS 'Daftar produk yang dibeli dalam format JSON';
COMMENT ON COLUMN public.transactions.proof_url IS 'URL gambar bukti transfer manual yang diunggah user';
COMMENT ON COLUMN public.transactions.shipping_receipt IS 'Nomor resi pengiriman kurir';
COMMENT ON COLUMN public.transactions.shipping_courier IS 'Kode kurir pengiriman (jne, pos, tiki, dsb)';
