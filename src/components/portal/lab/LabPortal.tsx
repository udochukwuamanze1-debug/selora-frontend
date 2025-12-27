import { useState } from "react";
import { LabSidebar } from "./LabSidebar";
import { DiagnosticsHub } from "./DiagnosticsHub";
import { InventoryManagement } from "./InventoryManagement";
import { cn } from "@/lib/utils";

interface LabPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

export const LabPortal = ({ walletAddress, onSignOut }: LabPortalProps) => {
  const [activeTab, setActiveTab] = useState("diagnostics");

  const renderContent = () => {
    switch (activeTab) {
      case "diagnostics":
        return <DiagnosticsHub />;
      case "inventory":
        return <InventoryManagement />;
      case "profile":
        return <ComingSoon title="Profile & Preferences" />;
      default:
        return <DiagnosticsHub />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <LabSidebar
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
