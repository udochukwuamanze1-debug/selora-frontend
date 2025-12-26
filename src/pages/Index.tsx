import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { BuiltOnSui } from "@/components/BuiltOnSui";
import { Footer } from "@/components/Footer";
import { WalletConnectModal } from "@/components/WalletConnectModal";
import { PortalSelection } from "@/components/PortalSelection";
import { PatientPortal } from "@/components/portal/PatientPortal";

type AppState = "landing" | "portal-selection" | "patient-portal";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  const handleConnectWallet = () => {
    setWalletModalOpen(true);
  };

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address);
    setAppState("portal-selection");
  };

  const handleSelectPortal = (portalId: string) => {
    if (portalId === "patient") {
      setAppState("patient-portal");
    }
    // Other portals can be added here
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setAppState("landing");
  };

  // Patient Portal View
  if (appState === "patient-portal" && walletAddress) {
    return (
      <PatientPortal
        walletAddress={walletAddress}
        onSignOut={handleDisconnect}
      />
    );
  }

  // Portal Selection View
  if (appState === "portal-selection" && walletAddress) {
    return (
      <PortalSelection
        walletAddress={walletAddress}
        onSelectPortal={handleSelectPortal}
        onDisconnect={handleDisconnect}
      />
    );
  }

  // Landing Page
  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onConnectWallet={handleConnectWallet}
        walletAddress={walletAddress || undefined}
      />
      <HeroSection onConnectWallet={handleConnectWallet} />
      <FeaturesSection />
      <BuiltOnSui />
      <Footer />

      <WalletConnectModal
        open={walletModalOpen}
        onOpenChange={setWalletModalOpen}
        onConnect={handleWalletConnected}
      />
    </div>
  );
};

export default Index;
