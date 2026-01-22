-- Add provider column to track which API provider the bundle comes from
ALTER TABLE public.data_bundles 
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'rgc';

-- Add comment for clarity
COMMENT ON COLUMN public.data_bundles.provider IS 'API provider: rgc or isquare';