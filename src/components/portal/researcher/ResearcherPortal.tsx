import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@iota/dapp-kit";
import { ResearcherSidebar, researcherMenuItems } from "./ResearcherSidebar";
import { ResearchConsole } from "./ResearchConsole";
import { DataPools } from "./DataPools";
import { ConsentManagement } from "./ConsentManagement";
import { Vault } from "../Vault";
import { HealthAssistant } from "../HealthAssistant";
import { ProfilePreferences } from "../ProfilePreferences";
import { MobileHeader } from "../MobileHeader";
import { PortalBottomNav } from "../PortalBottomNav";
import { PortalHeader } from "../PortalHeader";
import { cn } from "@/lib/utils";
import { getZkLoginUserInfo, loadZkLoginState, clearZkLoginState } from "@/lib/zklogin";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLoginReminder } from "@/hooks/useLoginReminder";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { LayoutDashboard, Lock } from "lucide-react";

const TAB_META: Record<string, { title: string; subtitle: string }> = {
  console: { title: "", subtitle: "Manage research studies and data pools" },
  pools: { title: "Data Pools", subtitle: "Browse and contribute to anonymized data pools" },
  consent: { title: "Consent Management", subtitle: "Track and manage participant consent records" },
  publications: { title: "Publications & Reports", subtitle: "Manage your research publications" },
  vault: { title: "Secure Vault", subtitle: "Encrypted storage for research documents" },
  assistant: { title: "Selora AI", subtitle: "Your AI-powered research assistant" },
  profile: { title: "Settings", subtitle: "Manage your account preferences" },
};

interface ResearcherPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

export const ResearcherPortal = ({ walletAddress: propWalletAddress, onSignOut }: ResearcherPortalProps) => {
  const [activeTab, setActiveTab] = useState("console");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const isMobile = useIsMobile();
  
  // Check for zkLogin state
  const zkLoginState = loadZkLoginState();
  const zkLoginUser = zkLoginState ? getZkLoginUserInfo(zkLoginState) : null;
  
  // Use IOTA wallet address if connected, zkLogin address, or prop
  const walletAddress = currentAccount?.address || zkLoginState?.address || propWalletAddress;

  // Track login for reminder notifications
  useLoginReminder(walletAddress);

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
      case "profile":
        return <ProfilePreferences walletAddress={walletAddress} />;
      default:
        return <ResearchConsole isNewUser={true} walletAddress={walletAddress} />;
    }
  };

  // Convert menu items for bottom nav
  const bottomNavItems = researcherMenuItems.map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
  }));

  const tabMeta = TAB_META[activeTab] || TAB_META.console;
  const isHome = activeTab === "console";

  return (
    <div className="min-h-screen bg-background">
      <PWAInstallPrompt isLoggedIn={true} />
      
      {isMobile && (
        <MobileHeader
          walletAddress={walletAddress}
          portalType="Researcher"
          showQR={false}
          title={isHome ? undefined : tabMeta.title}
          subtitle={tabMeta.subtitle}
          showGreeting={isHome}
        />
      )}
      
      <ResearcherSidebar
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
            { id: "console", label: "Console", icon: LayoutDashboard },
            { id: "vault", label: "Vault", icon: Lock },
          ]}
        />
      )}
    </div>
  );
};

const PublicationsReports = () => (
  <div className="space-y-6">
    <div>
      <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
        Publications & Reports
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground">
        Manage your research publications and generate reports
      </p>
    </div>
    <div className="glass-card p-8 sm:p-12 text-center">
      <p className="text-muted-foreground">No publications yet. Start a study to create reports.</p>
    </div>
  </div>
);
