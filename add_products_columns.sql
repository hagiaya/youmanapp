-- SQL Script untuk menambahkan kolom baru pada tabel 'products'
-- Silakan jalankan script ini di SQL Editor Supabase Anda

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS is_promo boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS discount_price numeric;

-- Optional: Jika Anda ingin memberikan komentar pada kolom agar mudah dimengerti
COMMENT ON COLUMN public.products.image_url IS 'URL thumbnail / gambar utama produk';
COMMENT ON COLUMN public.products.banner_url IS 'URL gambar panjang (banner) khusus untuk produk ini saat promo';
COMMENT ON COLUMN public.products.is_promo IS 'Menandakan status apakah produk ini sedang dalam masa promo diskon atau tidak';
COMMENT ON COLUMN public.products.discount_price IS 'Harga setelah potongan diskon (harga yang dibayarkan user saat is_promo bernilai true)';
