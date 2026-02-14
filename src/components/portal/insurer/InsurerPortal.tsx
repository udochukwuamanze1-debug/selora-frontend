import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@iota/dapp-kit";
import { loadZkLoginState, clearZkLoginState, isZkLoginReady } from "@/lib/zklogin";
import { InsurerSidebar, insurerMenuItems } from "./InsurerSidebar";
import { RiskOverview } from "./RiskOverview";
import { DataMarketplace } from "./DataMarketplace";
import { Vault } from "../Vault";
import { HealthAssistant } from "../HealthAssistant";
import { ProfilePreferences } from "../ProfilePreferences";
import { MobileHeader } from "../MobileHeader";
import { PortalBottomNav } from "../PortalBottomNav";
import { PortalHeader } from "../PortalHeader";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLoginReminder } from "@/hooks/useLoginReminder";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { FileText, BarChart3, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const TAB_META: Record<string, { title: string; subtitle: string }> = {
  risk: { title: "", subtitle: "Manage risk assessments and claims" },
  marketplace: { title: "Data Marketplace", subtitle: "Browse and purchase anonymized health datasets" },
  claims: { title: "Claims Processing", subtitle: "Review and process insurance claims" },
  vault: { title: "Secure Vault", subtitle: "Encrypted storage for sensitive documents" },
  assistant: { title: "Selora AI", subtitle: "Your AI-powered insurance assistant" },
  settings: { title: "Settings", subtitle: "Manage your account preferences" },
};

interface InsurerPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

export const InsurerPortal = ({ walletAddress: propWalletAddress, onSignOut }: InsurerPortalProps) => {
  const [activeTab, setActiveTab] = useState("risk");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const isMobile = useIsMobile();
  
  // Check both IOTA wallet and zkLogin for authentication
  const zkLoginState = loadZkLoginState();
  const zkLoginAddress = isZkLoginReady(zkLoginState) ? zkLoginState?.address : null;
  const walletAddress = currentAccount?.address || zkLoginAddress || propWalletAddress;

  // Track login for reminder notifications
  useLoginReminder(walletAddress);

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

  // Convert menu items for bottom nav
  const bottomNavItems = insurerMenuItems.map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
  }));

  const tabMeta = TAB_META[activeTab] || TAB_META.risk;
  const isHome = activeTab === "risk";

  return (
    <div className="min-h-screen bg-background">
      <PWAInstallPrompt isLoggedIn={true} />
      
      {isMobile && (
        <MobileHeader
          walletAddress={walletAddress}
          portalType="Insurer"
          showQR={false}
          title={isHome ? undefined : tabMeta.title}
          subtitle={tabMeta.subtitle}
          showGreeting={isHome}
        />
      )}
      
      <InsurerSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        walletAddress={walletAddress}
        onSignOut={handleSignOut}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      <main className={cn(
        "transition-all duration-300 p-4 pb-24",
        !isMobile && (sidebarCollapsed ? "ml-20" : "ml-64"),
        !isMobile && "p-6 lg:p-8 pb-8"
      )}>
        {!isMobile && (
          <PortalHeader
            walletAddress={walletAddress}
            title={tabMeta.title}
            subtitle={tabMeta.subtitle}
            showGreeting={isHome}
            showQR={false}
          />
        )}
        {renderContent()}
      </main>
      
      {isMobile && (
        <PortalBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSignOut={handleSignOut}
          menuItems={bottomNavItems}
          primaryTabs={[
            { id: "risk", label: "Risk", icon: BarChart3 },
            { id: "vault", label: "Vault", icon: Lock },
          ]}
        />
      )}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
            Claims Processing
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and process insurance claims
          </p>
        </div>
      </div>
      
      {claims.length === 0 ? (
        <div className="glass-card p-8 sm:p-12 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-base sm:text-lg mb-2">No claims to process</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
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
