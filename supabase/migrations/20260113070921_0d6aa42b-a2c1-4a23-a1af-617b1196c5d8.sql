-- Create cashback wallets table
CREATE TABLE public.cashback_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance numeric NOT NULL DEFAULT 0.00,
  total_earned numeric NOT NULL DEFAULT 0.00,
  total_withdrawn numeric NOT NULL DEFAULT 0.00,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cashback_wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own cashback wallet"
ON public.cashback_wallets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own cashback wallet"
ON public.cashback_wallets
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_cashback_wallets_updated_at
BEFORE UPDATE ON public.cashback_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create cashback_transactions table to track cashback history
CREATE TABLE public.cashback_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('earned', 'withdrawn')),
  category text NOT NULL CHECK (category IN ('data', 'airtime', 'withdrawal')),
  reference_transaction_id uuid,
  description text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cashback_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own cashback transactions"
ON public.cashback_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cashback transactions"
ON public.cashback_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update handle_new_user function to also create cashback wallet
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referred_by_id UUID;
  referral_code_input TEXT;
BEGIN
  referral_code_input := NEW.raw_user_meta_data ->> 'referral_code';
  
  -- Find referrer if referral code was provided
  IF referral_code_input IS NOT NULL AND referral_code_input != '' THEN
    SELECT id INTO referred_by_id FROM public.profiles WHERE referral_code = referral_code_input;
  END IF;

  -- Create profile
  INSERT INTO public.profiles (user_id, full_name, phone, email, account_number, referral_code, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    NEW.email,
    public.generate_account_number(),
    public.generate_referral_code(),
    referred_by_id
  );

  -- Create wallet
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0.00);

  -- Create cashback wallet
  INSERT INTO public.cashback_wallets (user_id, balance)
  VALUES (NEW.id, 0.00);

  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  -- Create referral record if referred
  IF referred_by_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referee_id)
    VALUES (referred_by_id, (SELECT id FROM public.profiles WHERE user_id = NEW.id));
  END IF;

  RETURN NEW;
END;
$function$;