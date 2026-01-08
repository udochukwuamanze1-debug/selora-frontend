import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@iota/dapp-kit";
import { ResearcherSidebar } from "./ResearcherSidebar";
import { ResearchConsole } from "./ResearchConsole";
import { DataPools } from "./DataPools";
import { ConsentManagement } from "./ConsentManagement";
import { Vault } from "../Vault";
import { HealthAssistant } from "../HealthAssistant";
import { ProfilePreferences } from "../ProfilePreferences";
import { cn } from "@/lib/utils";
import { getZkLoginUserInfo, loadZkLoginState, clearZkLoginState } from "@/lib/zklogin";

interface ResearcherPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

export const ResearcherPortal = ({ walletAddress: propWalletAddress, onSignOut }: ResearcherPortalProps) => {
  const [activeTab, setActiveTab] = useState("console");
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  
  // Check for zkLogin state
  const zkLoginState = loadZkLoginState();
  const zkLoginUser = zkLoginState ? getZkLoginUserInfo(zkLoginState) : null;
  
  // Use IOTA wallet address if connected, zkLogin address, or prop
  const walletAddress = currentAccount?.address || zkLoginState?.address || propWalletAddress;

  const handleSignOut = () => {
    // Clear all user data
    localStorage.removeItem(`selora_user_${walletAddress}`);
    localStorage.removeItem(`selora_avatar_${walletAddress}`);
    localStorage.removeItem(`selora_notifications_${walletAddress}`);
    localStorage.removeItem(`selora_profile_${walletAddress}`);
    localStorage.removeItem(`selora_research_studies_${walletAddress}`);
    localStorage.removeItem(`selora_research_consents_${walletAddress}`);
    localStorage.removeItem(`selora_data_pools_${walletAddress}`);
    
    // Clear zkLogin state if using zkLogin
    if (zkLoginUser) {
      clearZkLoginState();
      sessionStorage.removeItem("selora_zklogin_address");
      sessionStorage.removeItem("selora_app_state");
    }
    
    // Navigate to landing page
    navigate("/");
    onSignOut();
  };

  const renderContent = () => {
    switch (activeTab) {
      case "console":
        return <ResearchConsole isNewUser={true} walletAddress={walletAddress} />;
      case "pools":
        return <DataPools isNewUser={true} walletAddress={walletAddress} />;
      case "consent":
        return <ConsentManagement isNewUser={true} walletAddress={walletAddress} />;
      case "publications":
        return <PublicationsReports />;
      case "vault":
        return <Vault walletAddress={walletAddress} />;
      case "assistant":
        return <HealthAssistant walletAddress={walletAddress} />;
      default:
        return <ResearchConsole isNewUser={true} walletAddress={walletAddress} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ResearcherSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        walletAddress={walletAddress}
        onSignOut={handleSignOut}
      />
      <main className={cn("transition-all duration-300 ml-64 p-6 lg:p-8")}>
        {renderContent()}
      </main>
    </div>
  );
};

const PublicationsReports = () => (
  <div className="space-y-6">
    <div>
      <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
        Publications & Reports
      </h1>
      <p className="text-muted-foreground">
        Manage your research publications and generate reports
      </p>
    </div>
    <div className="glass-card p-12 text-center">
      <p className="text-muted-foreground">No publications yet. Start a study to create reports.</p>
    </div>
  </div>
);
