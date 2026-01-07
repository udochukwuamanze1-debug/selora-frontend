import { useState, useEffect } from "react";
import { Search, MapPin, Stethoscope, CheckCircle, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { addLocalNotification } from "@/lib/wallet-keyphrase";

interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  clinic_name: string | null;
  city: string;
  country: string;
  verified: boolean;
  accepts_new_patients: boolean;
  wallet_address: string;
}

interface DoctorsDirectoryProps {
  patientWalletAddress: string;
}

const DOCTORS_STORAGE_KEY = "selora_doctors_directory";

// Sample doctors for demonstration
const sampleDoctors: Doctor[] = [
  {
    id: "doc_1",
    full_name: "Dr. Sarah Chen",
    specialty: "Cardiology",
    clinic_name: "Heart Care Center",
    city: "San Francisco",
    country: "USA",
    verified: true,
    accepts_new_patients: true,
    wallet_address: "0x1234...5678",
  },
  {
    id: "doc_2",
    full_name: "Dr. Michael Okonkwo",
    specialty: "General Practice",
    clinic_name: "Family Health Clinic",
    city: "Lagos",
    country: "Nigeria",
    verified: true,
    accepts_new_patients: true,
    wallet_address: "0x2345...6789",
  },
  {
    id: "doc_3",
    full_name: "Dr. Emma Rodriguez",
    specialty: "Dermatology",
    clinic_name: null,
    city: "Madrid",
    country: "Spain",
    verified: true,
    accepts_new_patients: true,
    wallet_address: "0x3456...7890",
  },
];

export function DoctorsDirectory({ patientWalletAddress }: DoctorsDirectoryProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Load doctors from localStorage
  useEffect(() => {
    const loadDoctors = () => {
      setIsLoading(true);
      try {
        const stored = localStorage.getItem(DOCTORS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setDoctors(parsed);
        } else {
          // Initialize with sample doctors
          localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(sampleDoctors));
          setDoctors(sampleDoctors);
        }
      } catch (error) {
        console.error("Error loading doctors:", error);
        setDoctors(sampleDoctors);
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctors();
  }, []);

  // Filter doctors
  useEffect(() => {
    let filtered = doctors.filter((d) => d.verified && d.accepts_new_patients);

    if (specialtyFilter !== "all") {
      filtered = filtered.filter((d) => d.specialty === specialtyFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.full_name.toLowerCase().includes(query) ||
          d.specialty.toLowerCase().includes(query) ||
          d.city.toLowerCase().includes(query) ||
          (d.clinic_name && d.clinic_name.toLowerCase().includes(query))
      );
    }

    setFilteredDoctors(filtered);
  }, [doctors, specialtyFilter, searchQuery]);

  // Get unique specialties
  const specialties = [...new Set(doctors.map((d) => d.specialty))].sort();

  // Request access from doctor
  const requestAccess = async () => {
    if (!selectedDoctor) return;

    setIsSending(true);
    try {
      // Create access request
      const ACCESS_REQUESTS_KEY = "selora_access_requests";
      const stored = localStorage.getItem(ACCESS_REQUESTS_KEY);
      const requests = stored ? JSON.parse(stored) : [];

      const newRequest = {
        id: `req_${Date.now()}`,
        patientAddress: patientWalletAddress,
        doctorName: selectedDoctor.full_name,
        doctorAddress: selectedDoctor.wallet_address,
        hospitalName: selectedDoctor.clinic_name || "Private Practice",
        accessType: "general" as const,
        requestedAt: new Date().toISOString(),
        status: "pending" as const,
      };

      requests.unshift(newRequest);
      localStorage.setItem(ACCESS_REQUESTS_KEY, JSON.stringify(requests));

      // Notify the doctor
      addLocalNotification({
        type: "access",
        title: "New Patient Request",
        message: `Patient ${patientWalletAddress.slice(0, 8)}... is requesting to share their health records with you.`,
        data: { requestId: newRequest.id, patientAddress: patientWalletAddress },
      });

      toast.success("Access request sent!", {
        description: `Dr. ${selectedDoctor.full_name} will be notified.`,
      });

      setSelectedDoctor(null);
    } catch (error) {
      toast.error("Failed to send request");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search doctors, specialties, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Stethoscope className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {specialties.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No doctors found</h3>
          <p className="text-sm text-muted-foreground">
            {doctors.length === 0
              ? "No verified doctors are available yet."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="glass-card p-4 hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => setSelectedDoctor(doctor)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{doctor.full_name}</h4>
                    {doctor.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs mb-2">
                    {doctor.specialty}
                  </Badge>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {doctor.city}, {doctor.country}
                  </p>
                  {doctor.clinic_name && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {doctor.clinic_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Profile Dialog */}
      <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Doctor Profile</DialogTitle>
            <DialogDescription>
              Request this doctor to view your health records
            </DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{selectedDoctor.full_name}</h3>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <Badge variant="outline">{selectedDoctor.specialty}</Badge>
                </div>
              </div>

              <div className="glass-card p-4 space-y-2">
                {selectedDoctor.clinic_name && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Clinic</span>
                    <span>{selectedDoctor.clinic_name}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location</span>
                  <span>{selectedDoctor.city}, {selectedDoctor.country}</span>
                </div>
              </div>

              <Button
                className="w-full gap-2"
                onClick={requestAccess}
                disabled={isSending}
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Request Access to My Records
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                The doctor will receive a notification to review your request
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}