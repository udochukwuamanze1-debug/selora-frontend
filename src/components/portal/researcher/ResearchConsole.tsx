import { BarChart3, Database, Users, FileText, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResearchConsoleProps {
  isNewUser?: boolean;
  walletAddress?: string;
}

export const ResearchConsole = ({ isNewUser = false, walletAddress = "" }: ResearchConsoleProps) => {
  const stats = isNewUser
    ? [
        { label: "Active Studies", value: "0", icon: FileText, change: "Start a study" },
        { label: "Data Access Grants", value: "0", icon: Database, change: "No grants yet" },
        { label: "Participants", value: "0", icon: Users, change: "No participants" },
        { label: "Analysis Hours", value: "0h", icon: Clock, change: "N/A" },
      ]
    : [
        { label: "Active Studies", value: "0", icon: FileText, change: "Create your first study" },
        { label: "Data Access Grants", value: "0", icon: Database, change: "Request access" },
        { label: "Participants", value: "0", icon: Users, change: "Recruit participants" },
        { label: "Analysis Hours", value: "0h", icon: Clock, change: "N/A" },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          Research Console
        </h1>
        <p className="text-muted-foreground">
          {isNewUser ? "Welcome! Start by creating a research study" : "Manage your research studies and data access"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xs text-primary mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {isNewUser ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading text-xl font-semibold mb-2 text-foreground">
            No Active Studies
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Create your first research study to start collecting consented patient data.
            All data access is fully auditable and requires explicit patient consent.
          </p>
          <Button>
            Create New Study
          </Button>
        </div>
      ) : (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Active Studies
            </h2>
            <Button variant="outline" size="sm">
              New Study
            </Button>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No active studies. Create a study to get started.</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <Database className="w-6 h-6 text-primary" />
          <span>Request Data Access</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          <span>Manage Participants</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          <span>Run Analysis</span>
        </Button>
      </div>
    </div>
  );
};
