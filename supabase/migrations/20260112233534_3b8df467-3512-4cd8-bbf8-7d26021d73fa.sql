-- Create app_settings table for configurable settings
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage app settings
CREATE POLICY "Admins can view app settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert app settings"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update app settings"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete app settings"
ON public.app_settings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create pricing_config table for service pricing/margins
CREATE TABLE public.pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT NOT NULL,
  network_code TEXT,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  markup_percentage DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_type, network_code)
);

-- Enable RLS
ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage pricing
CREATE POLICY "Admins can view pricing config"
ON public.pricing_config
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert pricing config"
ON public.pricing_config
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pricing config"
ON public.pricing_config
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pricing config"
ON public.pricing_config
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create push_notifications table for broadcast notifications
CREATE TABLE public.push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT DEFAULT 'all',
  target_users UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can manage push notifications
CREATE POLICY "Admins can view push notifications"
ON public.push_notifications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert push notifications"
ON public.push_notifications
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update push notifications"
ON public.push_notifications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete push notifications"
ON public.push_notifications
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at on pricing_config
CREATE TRIGGER update_pricing_config_updated_at
BEFORE UPDATE ON public.pricing_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on app_settings
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default app settings
INSERT INTO public.app_settings (key, value, description) VALUES
('referral_bonus', '{"referrer": 200, "referee": 100}', 'Referral bonus amounts'),
('min_deposit', '{"amount": 100}', 'Minimum deposit amount'),
('maintenance_mode', '{"enabled": false}', 'App maintenance mode'),
('contact_info', '{"email": "support@smdata.com", "phone": "+234800000000"}', 'Contact information');

-- Insert default pricing config
INSERT INTO public.pricing_config (service_type, network_code, discount_percentage, markup_percentage) VALUES
('airtime', 'MTN', 2.0, 0),
('airtime', 'AIRTEL', 2.0, 0),
('airtime', 'GLO', 2.0, 0),
('airtime', '9MOBILE', 2.0, 0),
('data', 'MTN', 0, 0),
('data', 'AIRTEL', 0, 0),
('data', 'GLO', 0, 0),
('data', '9MOBILE', 0, 0),
('electricity', NULL, 0, 1.5),
('tv', NULL, 0, 1.0);