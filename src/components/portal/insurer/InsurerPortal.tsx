import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { InsurerSidebar } from "./InsurerSidebar";
import { RiskOverview } from "./RiskOverview";
import { DataMarketplace } from "./DataMarketplace";
import { Vault } from "../Vault";
import { HealthAssistant } from "../HealthAssistant";
import { ProfilePreferences } from "../ProfilePreferences";
import { cn } from "@/lib/utils";

interface InsurerPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

export const InsurerPortal = ({ walletAddress: propWalletAddress, onSignOut }: InsurerPortalProps) => {
  const [activeTab, setActiveTab] = useState("risk");
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  
  // Use real wallet address if connected, otherwise use prop
  const walletAddress = currentAccount?.address || propWalletAddress;

  const handleSignOut = () => {
    // Clear all user data
    localStorage.removeItem(`selora_user_${walletAddress}`);
    localStorage.removeItem(`selora_avatar_${walletAddress}`);
    localStorage.removeItem(`selora_notifications_${walletAddress}`);
    localStorage.removeItem(`selora_profile_${walletAddress}`);
    // Navigate to landing page
    navigate("/");
    onSignOut();
  };

  const renderContent = () => {
    switch (activeTab) {
      case "risk":
        return <RiskOverview isNewUser={true} />;
      case "marketplace":
        return <DataMarketplace isNewUser={true} />;
      case "claims":
        return <ClaimsProcessing />;
      case "vault":
        return <Vault walletAddress={walletAddress} />;
      case "assistant":
        return <HealthAssistant walletAddress={walletAddress} />;
      case "settings":
        return <ProfilePreferences walletAddress={walletAddress} />;
      default:
        return <RiskOverview isNewUser={true} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <InsurerSidebar
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

const ClaimsProcessing = () => (
  <div className="space-y-6">
    <div>
      <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
        Claims Processing
      </h1>
      <p className="text-muted-foreground">
        Manage and process insurance claims
      </p>
    </div>
    <div className="glass-card p-12 text-center">
      <p className="text-muted-foreground">No claims to process yet. Claims will appear here when patients submit them.</p>
    </div>
  </div>
);
