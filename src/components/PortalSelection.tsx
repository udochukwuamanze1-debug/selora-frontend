import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  User,
  Stethoscope,
  FlaskConical,
  Shield,
  Microscope,
  Wallet,
  ArrowLeft,
} from "lucide-react";

const portals = [
  {
    id: "patient",
    title: "Patient",
    description: "Manage your health records, prescriptions, and data sharing",
    icon: User,
    gradient: "from-primary/20 to-primary/5",
  },
  {
    id: "doctor",
    title: "Doctor",
    description: "Access patient records and manage prescriptions",
    icon: Stethoscope,
    gradient: "from-secondary/20 to-secondary/5",
  },
  {
    id: "lab",
    title: "Lab / Pharmacist",
    description: "Fulfill prescriptions and manage diagnostics",
    icon: FlaskConical,
    gradient: "from-accent/20 to-accent/5",
  },
  {
    id: "insurer",
    title: "Insurer",
    description: "Manage coverage pools and access anonymized data",
    icon: Shield,
    gradient: "from-primary/20 to-secondary/10",
  },
  {
    id: "researcher",
    title: "Researcher",
    description: "Access consented datasets for research",
    icon: Microscope,
    gradient: "from-secondary/20 to-primary/10",
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
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />

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
            <Button variant="glass" className="gap-2">
              <Wallet className="w-4 h-4" />
              {truncateAddress(walletAddress)}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-up">
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-4">
              What are you using Selora as{" "}
              <span className="text-gradient">today?</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Select your portal to get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portals.map((portal, index) => (
              <button
                key={portal.id}
                onClick={() => onSelectPortal(portal.id)}
                className="glass-card-hover p-6 text-left group animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${portal.gradient} inline-block mb-4 group-hover:scale-110 transition-transform`}>
                  <portal.icon className="w-8 h-8 text-foreground" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {portal.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {portal.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
