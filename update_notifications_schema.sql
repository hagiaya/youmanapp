-- SQL Script untuk menambahkan kolom baru untuk mendukung Pengingat WhatsApp & OneSignal
-- Salin dan jalankan script ini di SQL Editor Supabase Anda

-- 1. Tambah kolom preferensi notifikasi pada tabel users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS whatsapp_reminder_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS push_reminder_enabled BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.users.whatsapp_reminder_enabled IS 'Apakah pengingat WhatsApp aktif untuk user ini';
COMMENT ON COLUMN public.users.push_reminder_enabled IS 'Apakah pengingat push push (OneSignal) aktif untuk user ini';

-- 2. Tambah kolom time dan subtitle pada tabel user_rituals agar jadwal tersinkronisasi ke database
ALTER TABLE public.user_rituals 
ADD COLUMN IF NOT EXISTS time VARCHAR(10) DEFAULT '12:00',
ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255);

COMMENT ON COLUMN public.user_rituals.time IS 'Waktu pelaksanaan ritual (HH:MM)';
COMMENT ON COLUMN public.user_rituals.subtitle IS 'Deskripsi atau subtitle ritual';
