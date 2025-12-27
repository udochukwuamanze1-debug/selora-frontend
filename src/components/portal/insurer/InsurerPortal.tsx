import { useState } from "react";
import { InsurerSidebar } from "./InsurerSidebar";
import { RiskOverview } from "./RiskOverview";
import { DataMarketplace } from "./DataMarketplace";
import { cn } from "@/lib/utils";

interface InsurerPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

export const InsurerPortal = ({ walletAddress, onSignOut }: InsurerPortalProps) => {
  const [activeTab, setActiveTab] = useState("risk");

  const renderContent = () => {
    switch (activeTab) {
      case "risk":
        return <RiskOverview />;
      case "marketplace":
        return <DataMarketplace />;
      case "claims":
        return <ComingSoon title="Claims Processing" />;
      case "settings":
        return <ComingSoon title="Settings" />;
      default:
        return <RiskOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <InsurerSidebar
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
