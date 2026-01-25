import { useState, useEffect } from "react";
import { PatientSidebar } from "./PatientSidebar";
import { PatientHome } from "./PatientHome";
import { HealthArchive } from "./HealthArchive";
import { Prescriptions } from "./Prescriptions";
import { DataExchange } from "./DataExchange";
import { Vault } from "./Vault";
import { PortalHeader } from "./PortalHeader";
import { PortalFooter } from "./PortalFooter";
import { HealthAssistant } from "./HealthAssistant";
import { ProfilePreferences } from "./ProfilePreferences";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { OnboardingTutorial } from "./OnboardingTutorial";
import { PatientInbox } from "./PatientInbox";
import { DoctorsDirectory } from "./DoctorsDirectory";
import { UserStatsProvider, useUserStats } from "@/hooks/useUserStats";
import { XPRewardsProvider } from "@/hooks/useXPRewards";
import { cn } from "@/lib/utils";
import { CareNetwork } from "./CareNetwork";
import { TrustedContacts } from "./TrustedContacts";
import { BottomNav } from "./BottomNav";
import { MobileHeader } from "./MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLoginReminder } from "@/hooks/useLoginReminder";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

interface PatientPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

const PatientPortalContent = ({ walletAddress, onSignOut }: PatientPortalProps) => {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { updateStats, addActivity } = useUserStats();
  const isMobile = useIsMobile();

  const handleRecordUploaded = () => {
    updateStats("healthRecords", 1);
    addActivity("Uploaded health record", "upload");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <PatientHome walletAddress={walletAddress} onNavigate={setActiveTab} />;
      case "inbox":
        return <PatientInbox walletAddress={walletAddress} />;
      case "doctors":
        return <DoctorsDirectory patientWalletAddress={walletAddress} />;
      case "archive":
        return (
          <HealthArchive
            walletAddress={walletAddress}
            onRecordUploaded={handleRecordUploaded}
          />
        );
      case "vault":
        return <Vault walletAddress={walletAddress} externalSearchQuery={searchQuery} />;
      case "prescriptions":
        return <Prescriptions />;
      case "exchange":
        return <DataExchange />;
      case "coverage":
        return <AnalyticsDashboard walletAddress={walletAddress} />;
      case "network":
        return <CareNetwork />;
      case "contacts":
        return <TrustedContacts walletAddress={walletAddress} />;
      case "assistant":
        return <HealthAssistant walletAddress={walletAddress} />;
      case "profile":
        return <ProfilePreferences walletAddress={walletAddress} />;
      default:
        return <PatientHome walletAddress={walletAddress} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTutorial walletAddress={walletAddress} onComplete={() => {}} />
      
      {/* PWA Install Prompt - only shown when logged in */}
      <PWAInstallPrompt isLoggedIn={true} />
      
      {/* Mobile Header */}
      {isMobile && <MobileHeader walletAddress={walletAddress} portalType="Patient" />}
      
      {/* Desktop Sidebar - hidden on mobile */}
      {!isMobile && (
        <PatientSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          walletAddress={walletAddress}
          onSignOut={onSignOut}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      )}
      
      <main className={cn(
        "transition-all duration-300 p-4 pb-24",
        !isMobile && (sidebarCollapsed ? "ml-20" : "ml-64"),
        !isMobile && "p-6 lg:p-8 pb-8"
      )}>
        {/* Desktop Header - hidden on mobile */}
        {!isMobile && (
          <PortalHeader
            title="Dashboard"
            subtitle="Manage your health data securely"
            walletAddress={walletAddress}
            onSearch={setSearchQuery}
          />
        )}
        {renderContent()}
        {!isMobile && <PortalFooter />}
      </main>
      
      {/* Mobile Bottom Nav */}
      {isMobile && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSignOut={onSignOut}
        />
      )}
    </div>
  );
};

export const PatientPortal = ({ walletAddress, onSignOut }: PatientPortalProps) => {
  // Track login for reminder notifications
  useLoginReminder(walletAddress);

  useEffect(() => {
    const userKey = `selora_user_${walletAddress}`;
    if (!localStorage.getItem(userKey)) {
      localStorage.setItem(userKey, "true");
      const count = parseInt(localStorage.getItem("selora_user_count") || "0", 10);
      localStorage.setItem("selora_user_count", (count + 1).toString());
    }
  }, [walletAddress]);

  return (
    <UserStatsProvider walletAddress={walletAddress}>
      <XPRewardsProvider walletAddress={walletAddress}>
        <PatientPortalContent walletAddress={walletAddress} onSignOut={onSignOut} />
      </XPRewardsProvider>
    </UserStatsProvider>
  );
};