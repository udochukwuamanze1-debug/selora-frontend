
-- Fix all RLS policies: drop restrictive ones and recreate as permissive

-- visit_reports
DROP POLICY IF EXISTS "Doctors can create visit reports" ON public.visit_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.visit_reports;
DROP POLICY IF EXISTS "Doctors can update their own reports" ON public.visit_reports;

CREATE POLICY "Anyone can create visit reports"
ON public.visit_reports FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can view visit reports"
ON public.visit_reports FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can update visit reports"
ON public.visit_reports FOR UPDATE
TO public
USING (true);

-- prescriptions
DROP POLICY IF EXISTS "Anyone can create prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can view relevant prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can update prescriptions" ON public.prescriptions;

CREATE POLICY "Anyone can create prescriptions"
ON public.prescriptions FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can view prescriptions"
ON public.prescriptions FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can update prescriptions"
ON public.prescriptions FOR UPDATE
TO public
USING (true);

-- research_data_requests
DROP POLICY IF EXISTS "Anyone can create research requests" ON public.research_data_requests;
DROP POLICY IF EXISTS "Anyone can view research requests" ON public.research_data_requests;
DROP POLICY IF EXISTS "Researchers can update own requests" ON public.research_data_requests;

CREATE POLICY "Anyone can create research requests"
ON public.research_data_requests FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can view research requests"
ON public.research_data_requests FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can update research requests"
ON public.research_data_requests FOR UPDATE
TO public
USING (true);

-- insurance_claims
DROP POLICY IF EXISTS "Anyone can create claims" ON public.insurance_claims;
DROP POLICY IF EXISTS "Anyone can view claims" ON public.insurance_claims;
DROP POLICY IF EXISTS "Insurers can update claims" ON public.insurance_claims;

CREATE POLICY "Anyone can create claims"
ON public.insurance_claims FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can view claims"
ON public.insurance_claims FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can update claims"
ON public.insurance_claims FOR UPDATE
TO public
USING (true);
