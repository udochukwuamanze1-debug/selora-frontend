-- Create storage bucket for doctor credentials
INSERT INTO storage.buckets (id, name, public)
VALUES ('doctor-credentials', 'doctor-credentials', false);

-- Allow doctors to upload their own credentials
CREATE POLICY "Doctors can upload their credentials"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'doctor-credentials');

-- Allow doctors to view their own credentials
CREATE POLICY "Doctors can view their credentials"
ON storage.objects
FOR SELECT
USING (bucket_id = 'doctor-credentials');

-- Add columns to doctor_profiles for credentials
ALTER TABLE public.doctor_profiles
ADD COLUMN IF NOT EXISTS medical_degree TEXT,
ADD COLUMN IF NOT EXISTS credential_document_path TEXT,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;
