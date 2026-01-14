import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { IotaProvider } from "@/providers/IotaProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useCurrentAccount, useDisconnectWallet } from "@iota/dapp-kit";
import { loadZkLoginState, clearZkLoginState, isZkLoginReady } from "@/lib/zklogin";
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Documentation from "./pages/Documentation";
import Whitepaper from "./pages/Whitepaper";
import Waitlist from "./pages/Waitlist";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import ExecutiveSummary from "./pages/ExecutiveSummary";
import DemoScript from "./pages/DemoScript";
import { DoctorPortal } from "./components/portal/doctor/DoctorPortal";
import { LabPortal } from "./components/portal/lab/LabPortal";
import { InsurerPortal } from "./components/portal/insurer/InsurerPortal";
import { ResearcherPortal } from "./components/portal/researcher/ResearcherPortal";

function ProtectedPortal({ portal }: { portal: "doctor" | "lab" | "insurer" | "researcher" }) {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const navigate = useNavigate();
  
  // Check both IOTA wallet and zkLogin for authentication
  const zkLoginState = loadZkLoginState();
  const zkLoginAddress = isZkLoginReady(zkLoginState) ? zkLoginState?.address : null;
  const walletAddress = currentAccount?.address || zkLoginAddress;

  const handleSignOut = () => {
    // Disable auto-connect for this tab/session
    window.sessionStorage.setItem("selora_disable_autoconnect", "1");
    window.sessionStorage.removeItem("selora_app_state");
    window.sessionStorage.removeItem("selora_last_portal");
    
    // Clear zkLogin state
    clearZkLoginState();
    
    // Clear all user-specific localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("selora_") || 
         key.startsWith("iota-dapp-kit") ||
         key.startsWith("dapp-kit") || 
         key.includes("wallet"))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    
    disconnect();
    navigate("/");
  };

  if (!walletAddress) {
    return <Navigate to="/" replace />;
  }

  switch (portal) {
    case "doctor":
      return <DoctorPortal walletAddress={walletAddress} onSignOut={handleSignOut} />;
    case "lab":
      return <LabPortal walletAddress={walletAddress} onSignOut={handleSignOut} />;
    case "insurer":
      return <InsurerPortal walletAddress={walletAddress} onSignOut={handleSignOut} />;
    case "researcher":
      return <ResearcherPortal walletAddress={walletAddress} onSignOut={handleSignOut} />;
  }
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/waitlist" element={<Waitlist />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/docs" element={<Documentation />} />
    <Route path="/documentation" element={<Documentation />} />
    <Route path="/whitepaper" element={<Whitepaper />} />
    <Route path="/executive-summary" element={<ExecutiveSummary />} />
    <Route path="/demo-script" element={<DemoScript />} />
    <Route path="/portal/doctor" element={<ProtectedPortal portal="doctor" />} />
    <Route path="/portal/lab" element={<ProtectedPortal portal="lab" />} />
    <Route path="/portal/insurer" element={<ProtectedPortal portal="insurer" />} />
    <Route path="/portal/researcher" element={<ProtectedPortal portal="researcher" />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="selora-theme">
    <IotaProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </IotaProvider>
  </ThemeProvider>
);

export default App;
