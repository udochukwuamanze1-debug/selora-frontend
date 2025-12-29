import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Save,
  Upload,
  FileText,
  Shield,
  Info,
} from "lucide-react";

interface DoctorProfileFormProps {
  walletAddress: string;
}

interface DoctorProfile {
  id: string;
  wallet_address: string;
  full_name: string;
  specialty: string;
  license_number: string | null;
  clinic_name: string | null;
  city: string;
  country: string;
  lat: number | null;
  lon: number | null;
  accepts_new_patients: boolean;
  verified: boolean;
  medical_degree: string | null;
  credential_document_path: string | null;
}

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  lagos: { lat: 6.5244, lon: 3.3792 },
  "new york": { lat: 40.7128, lon: -74.006 },
  london: { lat: 51.5074, lon: -0.1278 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  paris: { lat: 48.8566, lon: 2.3522 },
  berlin: { lat: 52.52, lon: 13.405 },
  sydney: { lat: -33.8688, lon: 151.2093 },
  mumbai: { lat: 19.076, lon: 72.8777 },
  dubai: { lat: 25.2048, lon: 55.2708 },
  singapore: { lat: 1.3521, lon: 103.8198 },
  abuja: { lat: 9.0579, lon: 7.4951 },
  accra: { lat: 5.6037, lon: -0.187 },
  nairobi: { lat: -1.2921, lon: 36.8219 },
  johannesburg: { lat: -26.2041, lon: 28.0473 },
  cairo: { lat: 30.0444, lon: 31.2357 },
};

interface EligibilityCheck {
  label: string;
  met: boolean;
  field: string;
}

// Local storage key for doctor profiles
const DOCTORS_STORAGE_KEY = "selora_doctor_profiles";

function getLocalDoctors(): DoctorProfile[] {
  try {
    const stored = localStorage.getItem(DOCTORS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalDoctors(doctors: DoctorProfile[]) {
  localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(doctors));
}

export function DoctorProfileForm({ walletAddress }: DoctorProfileFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Partial<DoctorProfile>>({
    full_name: "",
    specialty: "",
    license_number: "",
    clinic_name: "",
    city: "",
    country: "",
    accepts_new_patients: true,
    verified: false,
    medical_degree: "",
    credential_document_path: null,
  });

  useEffect(() => {
    loadProfile();
  }, [walletAddress]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const doctors = getLocalDoctors();
      const existingProfile = doctors.find((d) => d.wallet_address === walletAddress);
      if (existingProfile) {
        setProfile(existingProfile);
      }
    } catch (err) {
      console.error("Failed to load doctor profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check eligibility criteria
  const eligibilityChecks: EligibilityCheck[] = [
    { label: "Full name provided", met: !!profile.full_name?.trim(), field: "full_name" },
    { label: "Medical specialty", met: !!profile.specialty?.trim(), field: "specialty" },
    { label: "Medical license number", met: !!profile.license_number?.trim(), field: "license_number" },
    { label: "Clinic/Hospital affiliation", met: !!profile.clinic_name?.trim(), field: "clinic_name" },
    { label: "Medical degree", met: !!profile.medical_degree?.trim(), field: "medical_degree" },
    { label: "City location", met: !!profile.city?.trim(), field: "city" },
    { label: "Country", met: !!profile.country?.trim(), field: "country" },
    { label: "Credential document uploaded", met: !!profile.credential_document_path, field: "document" },
  ];

  const eligibilityScore = eligibilityChecks.filter((c) => c.met).length;
  const isFullyEligible = eligibilityScore === eligibilityChecks.length;
  const eligibilityPercent = Math.round((eligibilityScore / eligibilityChecks.length) * 100);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or image file (JPG, PNG)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      // Store file locally as base64 (decentralized approach)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const fileKey = `selora_doc_${walletAddress}_${Date.now()}`;
        localStorage.setItem(fileKey, base64);
        setProfile({ ...profile, credential_document_path: fileKey });
        toast.success("Document saved locally");
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Failed to save document: " + err.message);
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.full_name || !profile.specialty || !profile.city || !profile.country) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      // Geocode city
      const cityKey = profile.city?.toLowerCase() || "";
      const coords = CITY_COORDS[cityKey] || { lat: 0, lon: 0 };

      // Check if eligible for auto-verification
      const shouldVerify = isFullyEligible && !profile.verified;

      const doctors = getLocalDoctors();
      const existingIndex = doctors.findIndex((d) => d.wallet_address === walletAddress);

      const newProfile: DoctorProfile = {
        id: profile.id || `doc_${Date.now()}`,
        wallet_address: walletAddress,
        full_name: profile.full_name,
        specialty: profile.specialty,
        license_number: profile.license_number || null,
        clinic_name: profile.clinic_name || null,
        city: profile.city,
        country: profile.country,
        lat: coords.lat,
        lon: coords.lon,
        accepts_new_patients: profile.accepts_new_patients ?? true,
        medical_degree: profile.medical_degree || null,
        credential_document_path: profile.credential_document_path || null,
        verified: shouldVerify ? true : profile.verified ?? false,
      };

      if (existingIndex >= 0) {
        doctors[existingIndex] = newProfile;
      } else {
        doctors.push(newProfile);
      }

      saveLocalDoctors(doctors);
      setProfile(newProfile);

      if (shouldVerify && !profile.verified) {
        toast.success("Profile verified! You now appear in Care Network.");
      } else {
        toast.success("Profile saved locally!");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Failed to save profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold">Doctor Profile</h2>
          <p className="text-sm text-muted-foreground">
            Complete your profile to appear in the Care Network
          </p>
        </div>
        {profile.verified ? (
          <Badge className="gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> Verified
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-amber-500 border-amber-500/20">
            <AlertCircle className="w-3 h-3" /> Not Verified
          </Badge>
        )}
      </div>

      {/* Eligibility Progress */}
      {!profile.verified && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-medium">Verification Eligibility</h3>
            </div>
            <span className="text-sm font-medium">
              {eligibilityScore}/{eligibilityChecks.length} requirements
            </span>
          </div>

          <Progress value={eligibilityPercent} className="h-2" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {eligibilityChecks.map((check) => (
              <div
                key={check.field}
                className={`flex items-center gap-2 text-xs p-2 rounded-lg ${
                  check.met
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {check.met ? (
                  <CheckCircle className="w-3 h-3 shrink-0" />
                ) : (
                  <AlertCircle className="w-3 h-3 shrink-0" />
                )}
                <span className="truncate">{check.label}</span>
              </div>
            ))}
          </div>

          {isFullyEligible && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-500/10 p-3 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              All requirements met! Save to get verified automatically.
            </div>
          )}
        </div>
      )}

      <div className="glass-card p-6 space-y-5">
        {/* Basic Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={profile.full_name || ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Dr. Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialty">Medical Specialty *</Label>
            <Input
              id="specialty"
              value={profile.specialty || ""}
              onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
              placeholder="General Practice, Cardiology, etc."
            />
          </div>
        </div>

        {/* Credentials */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="license_number">Medical License Number *</Label>
            <Input
              id="license_number"
              value={profile.license_number || ""}
              onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
              placeholder="e.g., MDCN/R/12345"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medical_degree">Medical Degree *</Label>
            <Input
              id="medical_degree"
              value={profile.medical_degree || ""}
              onChange={(e) => setProfile({ ...profile, medical_degree: e.target.value })}
              placeholder="e.g., MBBS, MD, DO"
            />
          </div>
        </div>

        {/* Affiliation */}
        <div className="space-y-2">
          <Label htmlFor="clinic_name">Clinic / Hospital Affiliation *</Label>
          <Input
            id="clinic_name"
            value={profile.clinic_name || ""}
            onChange={(e) => setProfile({ ...profile, clinic_name: e.target.value })}
            placeholder="City Medical Center"
          />
        </div>

        {/* Location */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={profile.city || ""}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              placeholder="Lagos"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={profile.country || ""}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              placeholder="Nigeria"
            />
          </div>
        </div>

        {/* Document Upload */}
        <div className="space-y-2">
          <Label>Credential Document *</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Upload your medical license or certification (PDF, JPG, PNG - max 5MB)
          </p>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? "Saving..." : "Upload Document"}
            </Button>
            {profile.credential_document_path && (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <FileText className="w-4 h-4" />
                Document saved
              </div>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between py-2 border-t border-border pt-5">
          <div>
            <p className="font-medium">Accepting New Patients</p>
            <p className="text-sm text-muted-foreground">Toggle off if you're not taking new patients</p>
          </div>
          <Switch
            checked={profile.accepts_new_patients ?? true}
            onCheckedChange={(v) => setProfile({ ...profile, accepts_new_patients: v })}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : isFullyEligible && !profile.verified ? "Save & Get Verified" : "Save Profile"}
        </Button>

        {!profile.verified && (
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Info className="w-3 h-3" />
            Complete all requirements above to get automatically verified
          </p>
        )}
      </div>
    </div>
  );
}
