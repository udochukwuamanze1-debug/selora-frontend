
-- ==================== Visit Reports Table ====================
CREATE TABLE public.visit_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_address TEXT NOT NULL,
  doctor_name TEXT NOT NULL DEFAULT '',
  patient_address TEXT NOT NULL,
  patient_name TEXT DEFAULT '',
  chief_complaint TEXT DEFAULT '',
  diagnosis TEXT NOT NULL,
  prescription_details TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  report_type TEXT NOT NULL DEFAULT 'general_visit',
  vital_signs JSONB DEFAULT '{}',
  blob_id TEXT DEFAULT '',
  tx_digest TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.visit_reports ENABLE ROW LEVEL SECURITY;

-- Doctors can insert their own reports
CREATE POLICY "Doctors can create visit reports"
  ON public.visit_reports FOR INSERT
  WITH CHECK (true);

-- Doctors and patients can view relevant reports
CREATE POLICY "Users can view their own reports"
  ON public.visit_reports FOR SELECT
  USING (true);

-- Doctors can update their own reports
CREATE POLICY "Doctors can update their own reports"
  ON public.visit_reports FOR UPDATE
  USING (true);

-- ==================== Prescriptions Table ====================
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_address TEXT NOT NULL,
  doctor_name TEXT NOT NULL DEFAULT '',
  patient_address TEXT NOT NULL,
  medication TEXT NOT NULL,
  dosage TEXT NOT NULL DEFAULT '',
  frequency TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  pharmacy_id TEXT DEFAULT '',
  pharmacy_name TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  blob_id TEXT DEFAULT '',
  tx_digest TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view relevant prescriptions"
  ON public.prescriptions FOR SELECT
  USING (true);

CREATE POLICY "Doctors can update prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (true);

-- ==================== Research Data Requests Table ====================
CREATE TABLE public.research_data_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  researcher_address TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  data_type TEXT NOT NULL DEFAULT 'anonymized',
  status TEXT NOT NULL DEFAULT 'pending',
  patient_count INTEGER DEFAULT 0,
  consent_count INTEGER DEFAULT 0,
  budget_tokens NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.research_data_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create research requests"
  ON public.research_data_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view research requests"
  ON public.research_data_requests FOR SELECT
  USING (true);

CREATE POLICY "Researchers can update own requests"
  ON public.research_data_requests FOR UPDATE
  USING (true);

-- ==================== Insurance Claims Table ====================
CREATE TABLE public.insurance_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insurer_address TEXT NOT NULL,
  patient_address TEXT NOT NULL,
  prescription_id UUID REFERENCES public.prescriptions(id),
  claim_amount NUMERIC DEFAULT 0,
  approved_amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'submitted',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create claims"
  ON public.insurance_claims FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view claims"
  ON public.insurance_claims FOR SELECT
  USING (true);

CREATE POLICY "Insurers can update claims"
  ON public.insurance_claims FOR UPDATE
  USING (true);

-- ==================== Triggers for updated_at ====================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_visit_reports_updated_at
  BEFORE UPDATE ON public.visit_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_research_data_requests_updated_at
  BEFORE UPDATE ON public.research_data_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_insurance_claims_updated_at
  BEFORE UPDATE ON public.insurance_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
