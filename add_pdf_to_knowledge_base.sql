-- SQL Script untuk menambahkan kolom 'pdf_url' di tabel 'knowledge_base'
-- Silakan jalankan script ini di SQL Editor Supabase Anda

ALTER TABLE public.knowledge_base 
ADD COLUMN IF NOT EXISTS pdf_url TEXT;
