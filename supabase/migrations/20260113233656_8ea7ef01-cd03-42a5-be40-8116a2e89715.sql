-- Add policy for admins to update referrals
CREATE POLICY "Admins can update referrals"
ON public.referrals
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));