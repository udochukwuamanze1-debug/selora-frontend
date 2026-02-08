import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@iota/dapp-kit";
import { LabSidebar, labMenuItems } from "./LabSidebar";
import { DiagnosticsHub } from "./DiagnosticsHub";
import { InventoryManagement } from "./InventoryManagement";
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
import { FlaskConical, Lock } from "lucide-react";

interface LabPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

export const LabPortal = ({ walletAddress: propWalletAddress, onSignOut }: LabPortalProps) => {
  const [activeTab, setActiveTab] = useState("diagnostics");
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
    localStorage.removeItem(`selora_lab_inventory_${walletAddress}`);
    localStorage.removeItem(`selora_lab_prescriptions_${walletAddress}`);
    
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
      case "diagnostics":
        return <DiagnosticsHub isNewUser={true} walletAddress={walletAddress} />;
      case "inventory":
        return <InventoryManagement isNewUser={true} walletAddress={walletAddress} />;
      case "vault":
        return <Vault walletAddress={walletAddress} />;
      case "assistant":
        return <HealthAssistant walletAddress={walletAddress} />;
      case "profile":
        return <ProfilePreferences walletAddress={walletAddress} />;
      default:
        return <DiagnosticsHub isNewUser={true} walletAddress={walletAddress} />;
    }
  };

  // Convert menu items for bottom nav
  const bottomNavItems = labMenuItems.map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* PWA Install Prompt */}
      <PWAInstallPrompt isLoggedIn={true} />
      
      {/* Mobile Header */}
      {isMobile && <MobileHeader walletAddress={walletAddress} portalType="Lab" showQR={false} />}
      
      {/* Desktop Sidebar */}
      <LabSidebar
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
            subtitle="Manage diagnostics and lab operations"
            showQR={false}
          />
        )}
        {renderContent()}
      </main>
      
      {/* Mobile Bottom Nav */}
      {isMobile && (
        <PortalBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSignOut={handleSignOut}
          menuItems={bottomNavItems}
          primaryTabs={[
            { id: "diagnostics", label: "Diagnostics", icon: FlaskConical },
            { id: "vault", label: "Vault", icon: Lock },
          ]}
        />
      )}
    </div>
  );
};
