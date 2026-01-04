-- Create waitlist table with referral tracking
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by TEXT REFERENCES public.waitlist(referral_code),
  referral_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public waitlist signup)
CREATE POLICY "Anyone can join waitlist" 
ON public.waitlist 
FOR INSERT 
WITH CHECK (true);

-- Anyone can read (for referral validation)
CREATE POLICY "Anyone can read waitlist" 
ON public.waitlist 
FOR SELECT 
USING (true);

-- Anyone can update referral count
CREATE POLICY "Anyone can update referral count" 
ON public.waitlist 
FOR UPDATE 
USING (true);

-- Create index for referral code lookups
CREATE INDEX idx_waitlist_referral_code ON public.waitlist(referral_code);
CREATE INDEX idx_waitlist_referred_by ON public.waitlist(referred_by);