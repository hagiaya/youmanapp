-- Script to add shipping_cost to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(12,2) DEFAULT 0;
