-- Script to add shipping_address and user_phone to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS user_phone VARCHAR(50);
