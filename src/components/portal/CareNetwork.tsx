import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Search, Stethoscope } from "lucide-react";
import { toast } from "sonner";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  lat: number;
  lon: number;
  acceptsNewPatients: boolean;
};

const MILES_RADIUS = 2;

const demoDoctors: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Sarah Chen",
    specialty: "Primary Care",
    lat: 40.7128,
    lon: -74.006,
    acceptsNewPatients: true,
  },
  {
    id: "d2",
    name: "Dr. Michael Brown",
    specialty: "Cardiology",
    lat: 40.716,
    lon: -74.01,
    acceptsNewPatients: false,
  },
  {
    id: "d3",
    name: "Dr. Amina Patel",
    specialty: "Dermatology",
    lat: 40.709,
    lon: -74.001,
    acceptsNewPatients: true,
  },
];

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

export function CareNetwork() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  const doctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    return demoDoctors
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
  }, [query, location]);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not available in this browser.");
      return;
    }

    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocLoading(false);
      },
      () => {
        toast.error("Couldn't access location. You can still search by name.");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    // Keep it opt-in; don't auto-prompt on first render.
  }, []);

  return (
    <section className="space-y-6" aria-label="Care Network">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Care Network</h1>
          <p className="text-muted-foreground">
            Find nearby doctors within a {MILES_RADIUS}-mile radius.
          </p>
        </div>
        <Button variant="glass" className="gap-2" onClick={requestLocation} disabled={locLoading}>
          <Navigation className="w-4 h-4" />
          {locLoading ? "Locating..." : location ? "Update location" : "Use my location"}
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
            {location ? "Filtering by your location" : "Location filter off"}
          </div>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-semibold text-lg">No matches</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Try a different name/specialty, or enable location access.
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
    </section>
  );
}
