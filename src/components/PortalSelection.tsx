import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { AvatarMintModal } from "@/components/AvatarMintModal";
import { useAvatar } from "@/hooks/useAvatar";
import {
  User,
  Stethoscope,
  FlaskConical,
  Shield,
  Microscope,
  Wallet,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

const portals = [
  {
    id: "patient",
    title: "Patient",
    description: "Manage your health records, prescriptions, and data sharing",
    icon: User,
    path: "/portal/patient",
  },
  {
    id: "doctor",
    title: "Doctor",
    description: "Access patient records and manage prescriptions",
    icon: Stethoscope,
    path: "/portal/doctor",
  },
  {
    id: "lab",
    title: "Lab / Pharmacist",
    description: "Fulfill prescriptions and manage diagnostics",
    icon: FlaskConical,
    path: "/portal/lab",
  },
  {
    id: "insurer",
    title: "Insurer",
    description: "Manage coverage pools and access anonymized data",
    icon: Shield,
    path: "/portal/insurer",
  },
  {
    id: "researcher",
    title: "Researcher",
    description: "Access consented datasets for research",
    icon: Microscope,
    path: "/portal/researcher",
  },
];

interface PortalSelectionProps {
  walletAddress: string;
  onSelectPortal: (portalId: string) => void;
  onDisconnect: () => void;
}

export const PortalSelection = ({
  walletAddress,
  onSelectPortal,
  onDisconnect,
}: PortalSelectionProps) => {
  const navigate = useNavigate();
  const { avatar, hasAvatar, isMinting, mintAvatar } = useAvatar(walletAddress);
  const [showMintModal, setShowMintModal] = useState(false);
  const [pendingPortal, setPendingPortal] = useState<string | null>(null);

  // Show mint modal for first-time users
  useEffect(() => {
    if (!hasAvatar) {
      const timer = setTimeout(() => setShowMintModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [hasAvatar]);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handlePortalClick = (portalId: string) => {
    if (!hasAvatar) {
      setPendingPortal(portalId);
      setShowMintModal(true);
      return;
    }

    // Navigate to the portal
    if (portalId === "patient") {
      onSelectPortal(portalId);
    } else if (portalId === "doctor") {
      navigate("/portal/doctor");
    } else if (portalId === "lab") {
      navigate("/portal/lab");
    } else if (portalId === "insurer") {
      navigate("/portal/insurer");
    } else if (portalId === "researcher") {
      navigate("/portal/researcher");
    }
  };

  const handleMint = async (name: string) => {
    await mintAvatar(name);
    toast.success("Selora Avatar minted successfully!");
    setShowMintModal(false);
    
    // If user was trying to enter a portal, proceed
    if (pendingPortal) {
      handlePortalClick(pendingPortal);
      setPendingPortal(null);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: "-3s" }} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onDisconnect}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Logo />
            </div>
            <div className="flex items-center gap-3">
              {hasAvatar && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass-effect text-sm">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span className="text-muted-foreground">{avatar?.name}</span>
                </div>
              )}
              <Button variant="outline" className="gap-2">
                <Wallet className="w-4 h-4" />
                {truncateAddress(walletAddress)}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-up">
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-foreground">
              What are you using Selora as{" "}
              <span className="text-primary">today?</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Select your portal to get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portals.map((portal, index) => {
              const IconComponent = portal.icon;
              return (
                <div
                  key={portal.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handlePortalClick(portal.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePortalClick(portal.id);
                    }
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handlePortalClick(portal.id);
                  }}
                  className="glass-card-hover p-6 text-left group animate-fade-up cursor-pointer select-none touch-manipulation active:scale-[0.98] transition-transform"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-4 rounded-2xl bg-primary/5 inline-block mb-4 group-hover:bg-primary/10 transition-colors pointer-events-none">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors pointer-events-none">
                    {portal.title}
                  </h3>
                  <p className="text-muted-foreground text-sm pointer-events-none">
                    {portal.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Avatar Mint Modal */}
      <AvatarMintModal
        isOpen={showMintModal}
        onClose={() => {
          setShowMintModal(false);
          setPendingPortal(null);
        }}
        onMint={handleMint}
        isMinting={isMinting}
      />
    </div>
  );
};
