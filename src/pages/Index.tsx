import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowSeloraWorks } from "@/components/HowSeloraWorks";
import { NeonDivider } from "@/components/NeonDivider";
import { BuiltOnIota } from "@/components/BuiltOnIota";
import { Footer } from "@/components/Footer";
import { PortalSelection } from "@/components/PortalSelection";
import { PatientPortal } from "@/components/portal/PatientPortal";
import { useCurrentAccount, ConnectModal, useDisconnectWallet } from "@iota/dapp-kit";
import { loadZkLoginState, clearZkLoginState, isZkLoginReady } from "@/lib/zklogin";

type AppState = "landing" | "portal-selection" | "patient-portal";

const APP_STATE_KEY = "selora_app_state";
const LAST_PORTAL_KEY = "selora_last_portal";
const DISABLE_AUTOCONNECT_KEY = "selora_disable_autoconnect";

const Index = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    if (typeof window === "undefined") return "landing";
    const saved = window.sessionStorage.getItem(APP_STATE_KEY) as AppState | null;
    return saved ?? "landing";
  });
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  
  const zkLoginState = loadZkLoginState();
  const zkLoginAddress = isZkLoginReady(zkLoginState) ? zkLoginState?.address : null;
  const walletAddress = currentAccount?.address || zkLoginAddress || null;

  useEffect(() => {
    if (!walletAddress) return;
    window.sessionStorage.removeItem(DISABLE_AUTOCONNECT_KEY);
    const lastPortal = window.sessionStorage.getItem(LAST_PORTAL_KEY);
    if (lastPortal === "patient") {
      setAppState("patient-portal");
    } else if (appState === "landing") {
      setAppState("portal-selection");
    }
  }, [walletAddress]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(APP_STATE_KEY, appState);
  }, [appState]);

  useEffect(() => {
    if (!walletAddress && appState !== "landing") {
      const zkState = loadZkLoginState();
      if (!isZkLoginReady(zkState)) {
        setAppState("landing");
      }
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
      window.sessionStorage.setItem(LAST_PORTAL_KEY, "patient");
      setAppState("patient-portal");
    }
  };

  const handleDisconnect = () => {
    window.sessionStorage.setItem(DISABLE_AUTOCONNECT_KEY, "1");
    window.sessionStorage.removeItem(APP_STATE_KEY);
    window.sessionStorage.removeItem(LAST_PORTAL_KEY);
    clearZkLoginState();
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("selora_") || key.startsWith("iota-dapp-kit") || key.startsWith("dapp-kit") || key.includes("wallet"))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    disconnect();
    setAppState("landing");
  };

  if (appState === "patient-portal" && walletAddress) {
    return <PatientPortal walletAddress={walletAddress} onSignOut={handleDisconnect} />;
  }

  if (appState === "portal-selection" && walletAddress) {
    return <PortalSelection walletAddress={walletAddress} onSelectPortal={handleSelectPortal} onDisconnect={handleDisconnect} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onConnectWallet={handleConnectWallet} walletAddress={walletAddress || undefined} />
      <HeroSection onConnectWallet={handleConnectWallet} />
      <FeaturesSection />
      <NeonDivider />
      <HowSeloraWorks />
      <NeonDivider />
      <BuiltOnIota />
      <Footer />
      <ConnectModal trigger={<></>} open={connectModalOpen} onOpenChange={(open) => setConnectModalOpen(open)} />
    </div>
  );
};

export default Index;
