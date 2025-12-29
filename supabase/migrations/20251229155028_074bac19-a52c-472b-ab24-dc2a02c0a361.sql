-- Doctor profiles table for Care Network discovery
CREATE TABLE public.doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  license_number TEXT,
  clinic_name TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  accepts_new_patients BOOLEAN NOT NULL DEFAULT true,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

-- Public read: only verified doctors
CREATE POLICY "Anyone can view verified doctors"
  ON public.doctor_profiles
  FOR SELECT
  USING (verified = true);

-- Owner can view own profile (even if unverified)
CREATE POLICY "Doctors can view their own profile"
  ON public.doctor_profiles
  FOR SELECT
  USING (wallet_address = current_setting('request.headers', true)::json->>'x-wallet-address');

-- Owner can insert their own profile
CREATE POLICY "Doctors can create their own profile"
  ON public.doctor_profiles
  FOR INSERT
  WITH CHECK (wallet_address = current_setting('request.headers', true)::json->>'x-wallet-address');

-- Owner can update their own profile
CREATE POLICY "Doctors can update their own profile"
  ON public.doctor_profiles
  FOR UPDATE
  USING (wallet_address = current_setting('request.headers', true)::json->>'x-wallet-address');

-- Owner can delete their own profile
CREATE POLICY "Doctors can delete their own profile"
  ON public.doctor_profiles
  FOR DELETE
  USING (wallet_address = current_setting('request.headers', true)::json->>'x-wallet-address');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_doctor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_doctor_profiles_updated_at
  BEFORE UPDATE ON public.doctor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_doctor_updated_at();
