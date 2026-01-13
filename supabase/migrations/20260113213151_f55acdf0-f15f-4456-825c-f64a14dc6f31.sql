-- Create data_bundles table to store all data bundles with API and app prices
CREATE TABLE public.data_bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  network_code TEXT NOT NULL,
  data_type TEXT NOT NULL, -- SME, Corporate, Gifting, etc.
  plan_code TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  validity TEXT,
  api_price NUMERIC NOT NULL DEFAULT 0,
  app_price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(network_code, data_type, plan_code)
);

-- Enable RLS
ALTER TABLE public.data_bundles ENABLE ROW LEVEL SECURITY;

-- Admin only policies
CREATE POLICY "Admins can view data bundles"
ON public.data_bundles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert data bundles"
ON public.data_bundles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update data bundles"
ON public.data_bundles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete data bundles"
ON public.data_bundles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view active bundles (for purchasing)
CREATE POLICY "Users can view active data bundles"
ON public.data_bundles
FOR SELECT
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_data_bundles_updated_at
BEFORE UPDATE ON public.data_bundles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();