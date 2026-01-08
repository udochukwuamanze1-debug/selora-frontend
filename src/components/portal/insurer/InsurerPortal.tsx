import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@iota/dapp-kit";
import { loadZkLoginState, clearZkLoginState, isZkLoginReady } from "@/lib/zklogin";
import { InsurerSidebar } from "./InsurerSidebar";
import { RiskOverview } from "./RiskOverview";
import { DataMarketplace } from "./DataMarketplace";
import { Vault } from "../Vault";
import { HealthAssistant } from "../HealthAssistant";
import { ProfilePreferences } from "../ProfilePreferences";
import { cn } from "@/lib/utils";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InsurerPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

export const InsurerPortal = ({ walletAddress: propWalletAddress, onSignOut }: InsurerPortalProps) => {
  const [activeTab, setActiveTab] = useState("risk");
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  
  // Check both IOTA wallet and zkLogin for authentication
  const zkLoginState = loadZkLoginState();
  const zkLoginAddress = isZkLoginReady(zkLoginState) ? zkLoginState?.address : null;
  const walletAddress = currentAccount?.address || zkLoginAddress || propWalletAddress;

  const handleSignOut = () => {
    // Clear all user data
    localStorage.removeItem(`selora_user_${walletAddress}`);
    localStorage.removeItem(`selora_avatar_${walletAddress}`);
    localStorage.removeItem(`selora_notifications_${walletAddress}`);
    localStorage.removeItem(`selora_profile_${walletAddress}`);
    
    // Clear zkLogin state
    clearZkLoginState();
    
    // Clear session storage
    window.sessionStorage.removeItem("selora_app_state");
    window.sessionStorage.removeItem("selora_last_portal");
    
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

const ClaimsProcessing = () => {
  const [claims, setClaims] = useState<any[]>(() => {
    const stored = localStorage.getItem("selora_insurance_claims");
    return stored ? JSON.parse(stored) : [];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
            Claims Processing
          </h1>
          <p className="text-muted-foreground">
            Manage and process insurance claims
          </p>
        </div>
      </div>
      
      {claims.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No claims to process</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Claims will appear here when patients submit them through their portal. You'll be able to review, approve, or reject claims.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{claim.patientName}</p>
                  <p className="text-sm text-muted-foreground">{claim.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${claim.amount}</p>
                  <p className="text-xs text-muted-foreground">{claim.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
