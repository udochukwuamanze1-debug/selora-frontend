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
import { UserStatsProvider, useUserStats } from "@/hooks/useUserStats";
import { cn } from "@/lib/utils";
import { CareNetwork } from "./CareNetwork";
import { TrustedContacts } from "./TrustedContacts";

interface PatientPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

const PatientPortalContent = ({ walletAddress, onSignOut }: PatientPortalProps) => {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const { updateStats, addActivity } = useUserStats();

  const handleRecordUploaded = () => {
    updateStats("healthRecords", 1);
    addActivity("Uploaded health record", "upload");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <PatientHome onNavigate={setActiveTab} />;
      case "archive":
        return (
          <HealthArchive
            walletAddress={walletAddress}
            onRecordUploaded={handleRecordUploaded}
          />
        );
      case "vault":
        return <Vault walletAddress={walletAddress} />;
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
        return <PatientHome onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTutorial walletAddress={walletAddress} onComplete={() => {}} />
      <PatientSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        walletAddress={walletAddress}
        onSignOut={onSignOut}
      />
      <main className={cn("transition-all duration-300 ml-64 p-6 lg:p-8")}
      >
        <PortalHeader
          title="Dashboard"
          subtitle="Manage your health data securely"
          walletAddress={walletAddress}
          onSearch={setSearchQuery}
        />
        {renderContent()}
        <PortalFooter />
      </main>
    </div>
  );
};

export const PatientPortal = ({ walletAddress, onSignOut }: PatientPortalProps) => {
  // Increment user count when a new user connects
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
      <PatientPortalContent walletAddress={walletAddress} onSignOut={onSignOut} />
    </UserStatsProvider>
  );
};

