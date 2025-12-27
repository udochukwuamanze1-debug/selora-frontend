import { useState } from "react";
import { ResearcherSidebar } from "./ResearcherSidebar";
import { ResearchConsole } from "./ResearchConsole";
import { DataPools } from "./DataPools";
import { ConsentManagement } from "./ConsentManagement";
import { cn } from "@/lib/utils";

interface ResearcherPortalProps {
  walletAddress: string;
  onSignOut: () => void;
}

export const ResearcherPortal = ({ walletAddress, onSignOut }: ResearcherPortalProps) => {
  const [activeTab, setActiveTab] = useState("console");

  const renderContent = () => {
    switch (activeTab) {
      case "console":
        return <ResearchConsole />;
      case "pools":
        return <DataPools />;
      case "consent":
        return <ConsentManagement />;
      case "publications":
        return <ComingSoon title="Publications & Reports" />;
      default:
        return <ResearchConsole />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ResearcherSidebar
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
