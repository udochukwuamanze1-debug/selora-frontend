import { useState } from "react";
import { DoctorSidebar } from "./DoctorSidebar";
import { CareWorkspace } from "./CareWorkspace";
import { PatientInsights } from "./PatientInsights";
import { PrescriptionCreation } from "./PrescriptionCreation";
import { cn } from "@/lib/utils";

interface DoctorPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

export const DoctorPortal = ({ walletAddress, onSignOut }: DoctorPortalProps) => {
  const [activeTab, setActiveTab] = useState("workspace");

  const renderContent = () => {
    switch (activeTab) {
      case "workspace":
        return <CareWorkspace />;
      case "insights":
        return <PatientInsights />;
      case "prescriptions":
        return <PrescriptionCreation />;
      case "profile":
        return <ComingSoon title="Profile & Preferences" />;
      default:
        return <CareWorkspace />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DoctorSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        walletAddress={walletAddress}
        onSignOut={onSignOut}
      />
      <main className={cn("transition-all duration-300 ml-64 p-6 lg:p-8")}>
        {renderContent()}
      </main>
    </div>
  );
};

const ComingSoon = ({ title }: { title: string }) => (
  <div className="glass-card p-12 text-center">
    <h1 className="font-heading text-2xl md:text-3xl font-bold mb-4 text-foreground">{title}</h1>
    <p className="text-muted-foreground">This feature is coming soon.</p>
  </div>
);
