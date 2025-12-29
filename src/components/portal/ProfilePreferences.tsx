import { useState } from "react";
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

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  avatar: string;
  verified: boolean;
}

const mockDoctors: Doctor[] = [
  { id: "1", name: "Dr. Sarah Johnson", specialty: "OB-GYN", location: "Lagos, Nigeria", avatar: "", verified: true },
  { id: "2", name: "Dr. Michael Chen", specialty: "Cardiologist", location: "Lagos, Nigeria", avatar: "", verified: true },
  { id: "3", name: "Dr. Emily Williams", specialty: "Dermatologist", location: "Lagos, Nigeria", avatar: "", verified: false },
  { id: "4", name: "Dr. James Okonkwo", specialty: "General Practitioner", location: "Lagos, Nigeria", avatar: "", verified: true },
];

export const ProfilePreferences = ({ walletAddress }: ProfilePreferencesProps) => {
  const { theme, setTheme } = useTheme();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [locationData, setLocationData] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  const [showDoctors, setShowDoctors] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
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
      setShowDoctors(false);
    }
  };

  const handleLocationSubmit = () => {
    if (!locationData.city || !locationData.country) {
      toast.error("Please fill in at least city and country");
      return;
    }
    toast.success("Location saved and encrypted!");
    setShowLocationForm(false);
    setShowDoctors(true);
  };

  const handleSaveProfile = () => {
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

          {showLocationForm && (
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
                Save & Find Doctors
              </Button>
            </div>
          )}

          {showDoctors && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Doctors within 2 miles</h3>
              <div className="grid gap-4">
                {mockDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={doctor.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {doctor.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{doctor.name}</span>
                        {doctor.verified && (
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {doctor.location}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">View Profile</Button>
                  </div>
                ))}
              </div>
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
