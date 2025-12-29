import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { LabSidebar } from "./LabSidebar";
import { DiagnosticsHub } from "./DiagnosticsHub";
import { InventoryManagement } from "./InventoryManagement";
import { Vault } from "../Vault";
import { HealthAssistant } from "../HealthAssistant";
import { ProfilePreferences } from "../ProfilePreferences";
import { cn } from "@/lib/utils";

interface LabPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

export const LabPortal = ({ walletAddress: propWalletAddress, onSignOut }: LabPortalProps) => {
  const [activeTab, setActiveTab] = useState("diagnostics");
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
      case "diagnostics":
        return <DiagnosticsHub isNewUser={true} />;
      case "inventory":
        return <InventoryManagement isNewUser={true} />;
      case "vault":
        return <Vault walletAddress={walletAddress} />;
      case "assistant":
        return <HealthAssistant walletAddress={walletAddress} />;
      case "profile":
        return <ProfilePreferences walletAddress={walletAddress} />;
      default:
        return <DiagnosticsHub isNewUser={true} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <LabSidebar
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
