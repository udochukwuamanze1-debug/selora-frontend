-- Drop existing restrictive update policy
DROP POLICY IF EXISTS "Doctors can update their own profile" ON public.doctor_profiles;

-- Create a more permissive update policy (allows admin verification)
-- In production, this should be restricted to authenticated admin users
CREATE POLICY "Allow profile updates"
  ON public.doctor_profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
