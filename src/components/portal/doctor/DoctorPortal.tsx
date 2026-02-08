import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@iota/dapp-kit";
import { loadZkLoginState, clearZkLoginState, isZkLoginReady } from "@/lib/zklogin";
import { DoctorSidebar, doctorMenuItems } from "./DoctorSidebar";
import { CareWorkspace } from "./CareWorkspace";
import { PatientInsights } from "./PatientInsights";
import { PrescriptionCreation } from "./PrescriptionCreation";
import { VisitReportCreator } from "./VisitReportCreator";
import { Vault } from "../Vault";
import { HealthAssistant } from "../HealthAssistant";
import { ProfilePreferences } from "../ProfilePreferences";
import { DoctorProfileForm } from "./DoctorProfileForm";
import { MobileHeader } from "../MobileHeader";
import { PortalBottomNav } from "../PortalBottomNav";
import { PortalHeader } from "../PortalHeader";
import { cn } from "@/lib/utils";
import { useLoginReminder } from "@/hooks/useLoginReminder";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useIsMobile } from "@/hooks/use-mobile";
import { LayoutDashboard, Lock, Scan } from "lucide-react";

interface DoctorPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

export const DoctorPortal = ({ walletAddress: propWalletAddress, onSignOut }: DoctorPortalProps) => {
  const [activeTab, setActiveTab] = useState("workspace");
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
      case "workspace":
        return <CareWorkspace isNewUser={true} walletAddress={walletAddress} />;
      case "visit-report":
        return <VisitReportCreator doctorAddress={walletAddress} doctorName="Doctor" />;
      case "insights":
        return <PatientInsights isNewUser={true} />;
      case "prescriptions":
        return <PrescriptionCreation />;
      case "vault":
        return <Vault walletAddress={walletAddress} />;
      case "assistant":
        return <HealthAssistant walletAddress={walletAddress} />;
      case "profile":
        return <ProfilePreferences walletAddress={walletAddress} />;
      case "doctor-profile":
        return <DoctorProfileForm walletAddress={walletAddress} />;
      default:
        return <CareWorkspace isNewUser={true} />;
    }
  };

  // Convert menu items for bottom nav
  const bottomNavItems = doctorMenuItems.map((item) => ({
    id: item.id,
    label: item.label,
    icon: item.icon,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* PWA Install Prompt - only shown when logged in */}
      <PWAInstallPrompt isLoggedIn={true} />
      
      {/* Mobile Header */}
      {isMobile && <MobileHeader walletAddress={walletAddress} portalType="Doctor" showQR={false} />}
      
      {/* Desktop Sidebar - hidden on mobile */}
      <DoctorSidebar
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
            subtitle="Overview of your patients and recent activity"
            showQR={false}
            actions={[
              { label: "Scan QR Code", icon: Scan, onClick: () => {} },
            ]}
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
            { id: "workspace", label: "Workspace", icon: LayoutDashboard },
            { id: "vault", label: "Vault", icon: Lock },
          ]}
        />
      )}
    </div>
  );
};
