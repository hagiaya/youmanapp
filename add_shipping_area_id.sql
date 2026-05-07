-- Script to add shipping_area_id to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS shipping_area_id VARCHAR(100);
