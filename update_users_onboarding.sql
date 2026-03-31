-- SQL Script untuk menambahkan kolom baru pada tabel 'users' untuk mendukung Onboarding
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS profession text,
ADD COLUMN IF NOT EXISTS wake_up_time text,
ADD COLUMN IF NOT EXISTS workout_time text,
ADD COLUMN IF NOT EXISTS focus_work_time text,
ADD COLUMN IF NOT EXISTS sleep_time text;

COMMENT ON COLUMN public.users.age IS 'Usia pengguna';
COMMENT ON COLUMN public.users.profession IS 'Pekerjaan atau profesi pengguna';
COMMENT ON COLUMN public.users.wake_up_time IS 'Waktu bangun pagi yang direncanakan';
COMMENT ON COLUMN public.users.workout_time IS 'Waktu olahraga yang direncanakan';
COMMENT ON COLUMN public.users.focus_work_time IS 'Waktu kerja fokus yang direncanakan';
COMMENT ON COLUMN public.users.sleep_time IS 'Waktu tidur yang direncanakan';
