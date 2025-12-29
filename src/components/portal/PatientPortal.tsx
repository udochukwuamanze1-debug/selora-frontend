import { useState } from "react";
import { PatientSidebar } from "./PatientSidebar";
import { PatientHome } from "./PatientHome";
import { HealthArchive } from "./HealthArchive";
import { SecureVault } from "./SecureVault";
import { Prescriptions } from "./Prescriptions";
import { DataExchange } from "./DataExchange";
import { Vault } from "./Vault";
import { PortalHeader } from "./PortalHeader";
import { PortalFooter } from "./PortalFooter";
import { cn } from "@/lib/utils";

interface PatientPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

export const PatientPortal = ({ walletAddress, onSignOut }: PatientPortalProps) => {
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <PatientHome onNavigate={setActiveTab} />;
      case "archive":
        return <HealthArchive />;
      case "vault":
        return <Vault walletAddress={walletAddress} />;
      case "prescriptions":
        return <Prescriptions />;
      case "exchange":
        return <DataExchange />;
      case "coverage":
        return <ComingSoon title="Coverage & Protection" />;
      case "network":
        return <ComingSoon title="Care Network" />;
      case "contacts":
        return <ComingSoon title="Trusted Contacts" />;
      case "assistant":
        return <ComingSoon title="Health Guide" />;
      case "profile":
        return <ComingSoon title="Profile & Preferences" />;
      default:
        return <PatientHome onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PatientSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        walletAddress={walletAddress}
        onSignOut={onSignOut}
      />
      <main className={cn("transition-all duration-300 ml-64 p-6 lg:p-8")}>
        <PortalHeader
          title="Patient Portal"
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

const ComingSoon = ({ title }: { title: string }) => (
  <div className="glass-card p-12 text-center">
    <h1 className="font-heading text-2xl md:text-3xl font-bold mb-4">{title}</h1>
    <p className="text-muted-foreground">This feature is coming soon.</p>
  </div>
);
