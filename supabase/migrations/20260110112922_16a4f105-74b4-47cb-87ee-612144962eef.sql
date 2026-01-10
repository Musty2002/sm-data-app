-- Enable REPLICA IDENTITY FULL for proper real-time syncing
ALTER TABLE public.wallets REPLICA IDENTITY FULL;