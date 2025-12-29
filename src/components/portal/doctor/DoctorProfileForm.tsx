import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle, AlertCircle, Save } from "lucide-react";

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
};

export function DoctorProfileForm({ walletAddress }: DoctorProfileFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Partial<DoctorProfile>>({
    full_name: "",
    specialty: "",
    license_number: "",
    clinic_name: "",
    city: "",
    country: "",
    accepts_new_patients: true,
    verified: false,
  });

  useEffect(() => {
    loadProfile();
  }, [walletAddress]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("doctor_profiles")
        .select("*")
        .eq("wallet_address", walletAddress)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error);
      }
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Failed to load doctor profile:", err);
    } finally {
      setLoading(false);
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

      const payload = {
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
      };

      const { data: existing } = await supabase
        .from("doctor_profiles")
        .select("id")
        .eq("wallet_address", walletAddress)
        .maybeSingle();

      let error;
      if (existing) {
        const res = await supabase
          .from("doctor_profiles")
          .update(payload)
          .eq("wallet_address", walletAddress);
        error = res.error;
      } else {
        const res = await supabase.from("doctor_profiles").insert(payload);
        error = res.error;
      }

      if (error) throw error;

      toast.success("Profile saved! It will appear in Care Network once verified.");
      loadProfile();
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
            Complete your profile to appear in the Care Network for patients
          </p>
        </div>
        {profile.verified ? (
          <Badge className="gap-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> Verified
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-amber-500 border-amber-500/20">
            <AlertCircle className="w-3 h-3" /> Pending Verification
          </Badge>
        )}
      </div>

      <div className="glass-card p-6 space-y-5">
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
            <Label htmlFor="specialty">Specialty *</Label>
            <Input
              id="specialty"
              value={profile.specialty || ""}
              onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
              placeholder="General Practice"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="license_number">Medical License Number</Label>
            <Input
              id="license_number"
              value={profile.license_number || ""}
              onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
              placeholder="ABC123456"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinic_name">Clinic / Hospital Name</Label>
            <Input
              id="clinic_name"
              value={profile.clinic_name || ""}
              onChange={(e) => setProfile({ ...profile, clinic_name: e.target.value })}
              placeholder="City Medical Center"
            />
          </div>
        </div>

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

        <div className="flex items-center justify-between py-2">
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
          {saving ? "Saving..." : "Save Profile"}
        </Button>

        {!profile.verified && (
          <p className="text-xs text-muted-foreground text-center">
            Your profile will be visible to patients once it's verified by our team.
          </p>
        )}
      </div>
    </div>
  );
}
