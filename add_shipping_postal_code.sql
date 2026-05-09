-- Script to add shipping_postal_code to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(20);
