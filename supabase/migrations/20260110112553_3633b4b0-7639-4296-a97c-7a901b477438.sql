-- Add column to store PaymentPoint account name
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS virtual_account_name TEXT;