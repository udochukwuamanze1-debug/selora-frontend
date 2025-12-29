import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowSeloraWorks } from "@/components/HowSeloraWorks";
import { NeonDivider } from "@/components/NeonDivider";
import { BuiltOnSui } from "@/components/BuiltOnSui";
import { Footer } from "@/components/Footer";
import { PortalSelection } from "@/components/PortalSelection";
import { PatientPortal } from "@/components/portal/PatientPortal";
import { useCurrentAccount, ConnectModal, useDisconnectWallet } from "@mysten/dapp-kit";

type AppState = "landing" | "portal-selection" | "patient-portal";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const walletAddress = currentAccount?.address || null;

  // When wallet connects, move to portal selection
  useEffect(() => {
    if (walletAddress && appState === "landing") {
      setAppState("portal-selection");
    }
    if (!walletAddress && appState !== "landing") {
      setAppState("landing");
    }
  }, [walletAddress, appState]);

  const handleConnectWallet = () => {
    if (walletAddress) {
      setAppState("portal-selection");
    } else {
      setConnectModalOpen(true);
    }
  };

  const handleSelectPortal = (portalId: string) => {
    if (portalId === "patient") {
      setAppState("patient-portal");
    }
    // Other portals can be added here
  };

  const handleDisconnect = () => {
    // Clear all user-specific localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith("selora_") ||
        key.startsWith("sui-dapp-kit") ||
        key.includes("wallet")
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Disconnect wallet using dapp-kit
    disconnect();
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
      <NeonDivider />
      <HowSeloraWorks />
      <NeonDivider />
      <BuiltOnSui />
      <Footer />

      <ConnectModal
        trigger={<></>}
        open={connectModalOpen}
        onOpenChange={(open) => setConnectModalOpen(open)}
      />
    </div>
  );
};

export default Index;
