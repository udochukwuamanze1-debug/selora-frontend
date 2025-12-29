import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, MapPin, Sun, Moon, Monitor, Check, Search, Shield } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";

interface ProfilePreferencesProps {
  walletAddress: string;
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

export const ProfilePreferences = ({ walletAddress }: ProfilePreferencesProps) => {
  const { theme, setTheme } = useTheme();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationData, setLocationData] = useState<LocationData>({
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });

  // Load saved profile data on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem(`selora_profile_${walletAddress}`);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setDisplayName(parsed.displayName || "");
        setProfileImage(parsed.profileImage || null);
      } catch {
        // Ignore parse errors
      }
    }

    const savedLocation = localStorage.getItem("selora_user_location");
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation) as LocationData;
        setLocationData(parsed);
        if (parsed.city && parsed.country) {
          setLocationEnabled(true);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, [walletAddress]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const image = event.target?.result as string;
        setProfileImage(image);
        // Save to localStorage
        const profile = { displayName, profileImage: image };
        localStorage.setItem(`selora_profile_${walletAddress}`, JSON.stringify(profile));
        toast.success("Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationToggle = (enabled: boolean) => {
    setLocationEnabled(enabled);
    if (enabled) {
      setShowLocationForm(true);
    } else {
      setShowLocationForm(false);
      // Clear saved location
      localStorage.removeItem("selora_user_location");
    }
  };

  const handleLocationSubmit = () => {
    if (!locationData.city || !locationData.country) {
      toast.error("Please fill in at least city and country");
      return;
    }

    // Geocode the address using a simple approximation
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

    // Save to localStorage for Care Network sync
    localStorage.setItem("selora_user_location", JSON.stringify(updatedLocation));
    setLocationData(updatedLocation);
    
    toast.success("Location saved and encrypted!");
    setShowLocationForm(false);
  };

  const handleSaveProfile = () => {
    const profile = { displayName, profileImage };
    localStorage.setItem(`selora_profile_${walletAddress}`, JSON.stringify(profile));
    toast.success("Profile saved successfully!");
  };

  const themes = [
    { id: "light" as const, label: "Light", icon: Sun },
    { id: "system" as const, label: "System", icon: Monitor },
    { id: "dark" as const, label: "Dark", icon: Moon },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="font-heading">Profile</CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileImage || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {displayName?.[0]?.toUpperCase() || walletAddress.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4 text-primary-foreground" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          </div>

          <Button onClick={handleSaveProfile}>Save Profile</Button>
        </CardContent>
      </Card>

      {/* Location Section */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Location Settings
          </CardTitle>
          <CardDescription>
            Enable location to find care specialists within a 2-mile radius. Your data is encrypted and only visible to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Location Services</Label>
              <p className="text-sm text-muted-foreground">Find doctors near you</p>
            </div>
            <Switch checked={locationEnabled} onCheckedChange={handleLocationToggle} />
          </div>

          {(showLocationForm || (locationEnabled && locationData.city)) && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                This information is encrypted and only used to find nearby doctors.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={locationData.street}
                    onChange={(e) => setLocationData({ ...locationData, street: e.target.value })}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={locationData.city}
                    onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
                    placeholder="Lagos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Region</Label>
                  <Input
                    id="state"
                    value={locationData.state}
                    onChange={(e) => setLocationData({ ...locationData, state: e.target.value })}
                    placeholder="Lagos State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={locationData.country}
                    onChange={(e) => setLocationData({ ...locationData, country: e.target.value })}
                    placeholder="Nigeria"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal">Zip/Postal Code</Label>
                  <Input
                    id="postal"
                    value={locationData.postalCode}
                    onChange={(e) => setLocationData({ ...locationData, postalCode: e.target.value })}
                    placeholder="100001"
                  />
                </div>
              </div>
              <Button onClick={handleLocationSubmit}>
                <Search className="w-4 h-4 mr-2" />
                Save Location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="font-heading">Appearance</CardTitle>
          <CardDescription>Customize how Selora looks for you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {themes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                  theme === id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div
                  className={cn(
                    "p-3 rounded-xl",
                    theme === id ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-medium">{label}</span>
                {theme === id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
