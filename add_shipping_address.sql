-- Script to add shipping_address to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS shipping_address TEXT;
