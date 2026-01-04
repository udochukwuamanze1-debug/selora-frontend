-- Create function to increment referral count
CREATE OR REPLACE FUNCTION public.increment_referral_count(ref_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.waitlist 
  SET referral_count = referral_count + 1 
  WHERE referral_code = ref_code;
END;
$$;