import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Shield,
  Search,
  Loader2,
  UserCheck,
  Clock,
} from "lucide-react";

interface DoctorProfile {
  id: string;
  wallet_address: string;
  full_name: string;
  specialty: string;
  license_number: string | null;
  clinic_name: string | null;
  city: string;
  country: string;
  accepts_new_patients: boolean;
  verified: boolean;
  created_at: string;
}

const ADMIN_KEY = "selora_admin_2024"; // Simple admin access key

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const storedAuth = sessionStorage.getItem("selora_admin_auth");
    if (storedAuth === "true") {
      setIsAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthed) {
      fetchDoctors();
    }
  }, [isAuthed, filter]);

  const handleAdminLogin = () => {
    if (adminKey === ADMIN_KEY) {
      setIsAuthed(true);
      sessionStorage.setItem("selora_admin_auth", "true");
      toast.success("Admin access granted");
    } else {
      toast.error("Invalid admin key");
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let query = supabase.from("doctor_profiles").select("*");

      if (filter === "pending") {
        query = query.eq("verified", false);
      } else if (filter === "verified") {
        query = query.eq("verified", true);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      toast.error("Failed to load doctor profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, verify: boolean) => {
    try {
      const { error } = await supabase
        .from("doctor_profiles")
        .update({ verified: verify })
        .eq("id", id);

      if (error) throw error;

      toast.success(verify ? "Doctor verified successfully" : "Verification removed");
      fetchDoctors();
    } catch (err) {
      console.error("Error updating doctor:", err);
      toast.error("Failed to update verification status");
    }
  };

  const filteredDoctors = doctors.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.full_name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q) ||
      d.license_number?.toLowerCase().includes(q)
    );
  });

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card p-8 w-full max-w-md space-y-6">
          <div className="text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="font-heading text-2xl font-bold">Admin Access</h1>
            <p className="text-muted-foreground mt-2">
              Enter the admin key to access the verification panel
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Admin Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
            />
            <Button onClick={handleAdminLogin} className="w-full">
              Access Admin Panel
            </Button>
          </div>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-heading text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Doctor Verification Panel
              </h1>
              <p className="text-sm text-muted-foreground">
                Verify doctor profiles to appear in Care Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <UserCheck className="w-3 h-3" />
              {doctors.filter((d) => d.verified).length} verified
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {doctors.filter((d) => !d.verified).length} pending
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search by name, specialty, city, or license..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "pending", "verified"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Doctor List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-lg font-semibold">No profiles found</h2>
            <p className="text-muted-foreground mt-2">
              {filter === "pending"
                ? "No pending verifications at this time."
                : "No doctor profiles match your search."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="glass-card p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{doctor.full_name}</h3>
                      {doctor.verified ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/20">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{doctor.specialty}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>📍 {doctor.city}, {doctor.country}</span>
                      {doctor.clinic_name && <span>🏥 {doctor.clinic_name}</span>}
                      {doctor.license_number && <span>📋 {doctor.license_number}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Wallet: {doctor.wallet_address.slice(0, 10)}...{doctor.wallet_address.slice(-6)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Applied: {new Date(doctor.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {doctor.verified ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleVerify(doctor.id, false)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Revoke
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleVerify(doctor.id, true)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
