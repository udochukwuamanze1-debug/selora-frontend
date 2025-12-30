import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation, Search, Stethoscope, X, Shield } from "lucide-react";
import { toast } from "sonner";
import { syncAllDoctorProfiles, getVerifiedDoctors } from "@/lib/walrus-sync";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  lat: number;
  lon: number;
  acceptsNewPatients: boolean;
};

const MILES_RADIUS = 2;

function milesBetween(aLat: number, aLon: number, bLat: number, bLon: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 3958.8; // miles
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

interface LocationData {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  lat?: number;
  lon?: number;
}

export function CareNetwork() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationData, setLocationData] = useState<LocationData>({
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  const [registeredDoctors, setRegisteredDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  // Fetch + sync verified doctors from Walrus + local
  useEffect(() => {
    let mounted = true;
    (async () => {
      setDoctorsLoading(true);
      try {
        await syncAllDoctorProfiles();
        const verified = getVerifiedDoctors();
        if (!mounted) return;
        setRegisteredDoctors(
          verified.map((d) => ({
            id: d.id,
            name: d.full_name,
            specialty: d.specialty,
            lat: d.lat ?? 0,
            lon: d.lon ?? 0,
            acceptsNewPatients: d.accepts_new_patients,
          }))
        );
      } catch (err) {
        console.error("Failed to sync doctors:", err);
      } finally {
        if (mounted) setDoctorsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Load saved location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem("selora_user_location");
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation) as LocationData;
        setLocationData(parsed);
        if (parsed.lat && parsed.lon) {
          setLocation({ lat: parsed.lat, lon: parsed.lon });
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const doctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    return registeredDoctors
      .filter((d) => {
        if (!q) return true;
        return (
          d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)
        );
      })
      .map((d) => {
        const distance = location
          ? milesBetween(location.lat, location.lon, d.lat, d.lon)
          : null;
        return { ...d, distance };
      })
      .filter((d) => (d.distance == null ? true : d.distance <= MILES_RADIUS))
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }, [query, location, registeredDoctors]);

  const handleUseLocation = () => {
    // Check if user has saved location in profile
    const savedLocation = localStorage.getItem("selora_user_location");
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation) as LocationData;
        if (parsed.lat && parsed.lon) {
          setLocation({ lat: parsed.lat, lon: parsed.lon });
          toast.success("Using your saved location");
          return;
        }
      } catch {
        // Fall through to show modal
      }
    }
    // Show modal to collect location
    setShowLocationModal(true);
  };

  const handleLocationSubmit = async () => {
    if (!locationData.city || !locationData.country) {
      toast.error("Please fill in at least city and country");
      return;
    }

    setLocLoading(true);
    
    const cityCoords: Record<string, { lat: number; lon: number }> = {
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

    const cityKey = locationData.city.toLowerCase();
    const coords = cityCoords[cityKey] || { lat: 0, lon: 0 };

    const updatedLocation: LocationData = {
      ...locationData,
      lat: coords.lat,
      lon: coords.lon,
    };

    // Save to localStorage for ProfilePreferences sync
    localStorage.setItem("selora_user_location", JSON.stringify(updatedLocation));
    setLocationData(updatedLocation);
    setLocation({ lat: coords.lat, lon: coords.lon });
    
    setLocLoading(false);
    setShowLocationModal(false);
    toast.success("Location saved and search started!");
  };

  const clearLocation = () => {
    setLocation(null);
  };

  return (
    <section className="space-y-6" aria-label="Care Network">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Care Network</h1>
          <p className="text-muted-foreground">
            Find nearby doctors within a {MILES_RADIUS}-mile radius.
          </p>
        </div>
        <Button variant="glass" className="gap-2" onClick={handleUseLocation} disabled={locLoading}>
          <Navigation className="w-4 h-4" />
          {locLoading ? "Loading..." : location ? "Update location" : "Use my location"}
        </Button>
      </header>

      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              placeholder="Search doctors or specialties..."
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {location ? (
              <span className="flex items-center gap-2">
                Filtering by your location
                <button
                  onClick={clearLocation}
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                  aria-label="Clear location filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : (
              "Location filter off"
            )}
          </div>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-semibold text-lg">No doctors available yet</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Doctors will appear here once they create their profiles in the Doctor Portal. 
            Check back soon or enable location to see nearby providers when available.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {doctors.map((d) => (
            <article key={d.id} className="glass-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading font-semibold">{d.name}</h2>
                  <p className="text-sm text-muted-foreground">{d.specialty}</p>
                </div>
                <Badge variant={d.acceptsNewPatients ? "default" : "outline"}>
                  {d.acceptsNewPatients ? "Accepting" : "Full"}
                </Badge>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {d.distance == null ? "—" : `${d.distance.toFixed(1)} mi away`}
                </p>
                <Button size="sm" className="gap-2" onClick={() => toast.info("Request sent", { description: `Asked ${d.name} for an appointment request.` })}>
                  <Stethoscope className="w-4 h-4" />
                  Request
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Location Input Modal */}
      <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Set Your Location
            </DialogTitle>
            <DialogDescription>
              Enter your location to find doctors within {MILES_RADIUS} miles.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              This information is stored locally and only used to find nearby doctors.
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-street">Street Address (optional)</Label>
                <Input
                  id="modal-street"
                  value={locationData.street}
                  onChange={(e) => setLocationData({ ...locationData, street: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modal-city">City *</Label>
                  <Input
                    id="modal-city"
                    value={locationData.city}
                    onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
                    placeholder="Lagos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-state">State/Region</Label>
                  <Input
                    id="modal-state"
                    value={locationData.state}
                    onChange={(e) => setLocationData({ ...locationData, state: e.target.value })}
                    placeholder="Lagos State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modal-country">Country *</Label>
                  <Input
                    id="modal-country"
                    value={locationData.country}
                    onChange={(e) => setLocationData({ ...locationData, country: e.target.value })}
                    placeholder="Nigeria"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modal-postal">Zip/Postal Code</Label>
                  <Input
                    id="modal-postal"
                    value={locationData.postalCode}
                    onChange={(e) => setLocationData({ ...locationData, postalCode: e.target.value })}
                    placeholder="100001"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowLocationModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleLocationSubmit} disabled={locLoading}>
                <Search className="w-4 h-4 mr-2" />
                {locLoading ? "Saving..." : "Save & Search"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
