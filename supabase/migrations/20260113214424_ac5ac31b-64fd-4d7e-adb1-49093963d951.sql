-- Allow admins to view ALL profiles (for top resellers and user management)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view ALL transactions (for transaction management and analytics)
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update transactions (for refunds)
CREATE POLICY "Admins can update transactions"
ON public.transactions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view ALL wallets (for user management)
CREATE POLICY "Admins can view all wallets"
ON public.wallets
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update ALL wallets (for funding/refunds)
CREATE POLICY "Admins can update all wallets"
ON public.wallets
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));