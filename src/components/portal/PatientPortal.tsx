import { useState, useEffect, useMemo } from "react";
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
import { PatientVisitReports } from "./PatientVisitReports";
import { UserStatsProvider, useUserStats } from "@/hooks/useUserStats";
import { XPRewardsProvider } from "@/hooks/useXPRewards";
import { cn } from "@/lib/utils";
import { Upload, Database } from "lucide-react";
import { CareNetwork } from "./CareNetwork";
import { TrustedContacts } from "./TrustedContacts";
import { BottomNav } from "./BottomNav";
import { MobileHeader } from "./MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLoginReminder } from "@/hooks/useLoginReminder";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

// Tab metadata: title + subtitle for each tab
const TAB_META: Record<string, { title: string; subtitle: string }> = {
  home: { title: "", subtitle: "Your health data is secure and under your control" }, // greeting used
  inbox: { title: "Access Inbox", subtitle: "Review and manage access requests from providers" },
  doctors: { title: "Find Doctors", subtitle: "Discover and connect with verified healthcare providers" },
  archive: { title: "Health Archive", subtitle: "Browse and manage your uploaded health records" },
  vault: { title: "Secure Vault", subtitle: "Encrypted storage for your sensitive health documents" },
  prescriptions: { title: "Prescriptions", subtitle: "View and track your prescriptions" },
  "visit-reports": { title: "Visit Reports", subtitle: "View reports from your doctors" },
  exchange: { title: "Data Exchange", subtitle: "Stake and monetize your anonymized health data" },
  coverage: { title: "Coverage & Analytics", subtitle: "Track your health coverage and insights" },
  network: { title: "Care Network", subtitle: "Find nearby doctors and manage your care team" },
  contacts: { title: "Trusted Contacts", subtitle: "Manage guardians who can access your data in emergencies" },
  assistant: { title: "Selora AI", subtitle: "Your AI-powered health assistant" },
  profile: { title: "Profile & Preferences", subtitle: "Manage your account settings and preferences" },
};

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

  const tabMeta = TAB_META[activeTab] || TAB_META.home;
  const isHome = activeTab === "home";

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <PatientHome walletAddress={walletAddress} onNavigate={setActiveTab} />;
      case "inbox":
        return <PatientInbox walletAddress={walletAddress} />;
      case "doctors":
        return <DoctorsDirectory patientWalletAddress={walletAddress} />;
      case "archive":
        return <HealthArchive walletAddress={walletAddress} onRecordUploaded={handleRecordUploaded} />;
      case "vault":
        return <Vault walletAddress={walletAddress} externalSearchQuery={searchQuery} />;
      case "prescriptions":
        return <Prescriptions walletAddress={walletAddress} />;
      case "exchange":
        return <DataExchange />;
      case "visit-reports":
        return <PatientVisitReports walletAddress={walletAddress} />;
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
      <PWAInstallPrompt isLoggedIn={true} />

      {/* Mobile Header — shows title per tab */}
      {isMobile && (
        <MobileHeader
          walletAddress={walletAddress}
          portalType="Patient"
          title={isHome ? undefined : tabMeta.title}
          subtitle={tabMeta.subtitle}
          showGreeting={isHome}
        />
      )}

      {/* Desktop Sidebar */}
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
        {/* Desktop Header — per-tab title */}
        {!isMobile && (
          <PortalHeader
            walletAddress={walletAddress}
            onSearch={setSearchQuery}
            title={tabMeta.title}
            subtitle={tabMeta.subtitle}
            showGreeting={isHome}
            actions={[
              { label: "Upload Record", icon: Upload, onClick: () => setActiveTab("vault") },
              { label: "Stake Data", icon: Database, onClick: () => setActiveTab("exchange"), variant: "glass" as const },
            ]}
          />
        )}
        {renderContent()}
        {!isMobile && <PortalFooter />}
      </main>

      {isMobile && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onSignOut={onSignOut} />
      )}
    </div>
  );
};

export const PatientPortal = ({ walletAddress, onSignOut }: PatientPortalProps) => {
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
