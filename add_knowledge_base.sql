-- SQL Script untuk membuat tabel 'knowledge_base'
-- Silakan jalankan script ini di SQL Editor Supabase Anda

CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    target_level TEXT DEFAULT 'Semua Level',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Memberikan akses baca untuk semua orang:
-- Jika Anda menggunakan RLS (Row Level Security), jalankan ini:
-- ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable read access for all users" ON public.knowledge_base FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users only" ON public.knowledge_base FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update for authenticated users only" ON public.knowledge_base FOR UPDATE USING (true) WITH CHECK (true);
-- CREATE POLICY "Enable delete for authenticated users only" ON public.knowledge_base FOR DELETE USING (true);
