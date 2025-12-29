import { Activity, Users, FileText, Clock } from "lucide-react";

interface CareWorkspaceProps {
  isNewUser?: boolean;
}

export const CareWorkspace = ({ isNewUser = false }: CareWorkspaceProps) => {
  const stats = isNewUser
    ? [
        { label: "Active Patients", value: "0", icon: Users, change: "No patients yet" },
        { label: "Pending Reviews", value: "0", icon: FileText, change: "No reviews pending" },
        { label: "Prescriptions Today", value: "0", icon: Activity, change: "No prescriptions yet" },
        { label: "Avg. Response Time", value: "--", icon: Clock, change: "N/A" },
      ]
    : [
        { label: "Active Patients", value: "24", icon: Users, change: "+3 this week" },
        { label: "Pending Reviews", value: "8", icon: FileText, change: "2 urgent" },
        { label: "Prescriptions Today", value: "12", icon: Activity, change: "+4 from yesterday" },
        { label: "Avg. Response Time", value: "2.4h", icon: Clock, change: "-0.5h improvement" },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          Care Workspace
        </h1>
        <p className="text-muted-foreground">
          {isNewUser ? "Welcome! Start by connecting with patients" : "Overview of your patients and recent activity"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xs text-primary mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4 text-foreground">
          Recent Activity
        </h2>
        {isNewUser ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent activity yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Patient activity will appear here once you start caring for patients.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground text-center py-4">Activity will appear here</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="glass-card p-5 text-left hover:border-primary/20 transition-colors">
          <FileText className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-1">New Prescription</h3>
          <p className="text-sm text-muted-foreground">Create a digital prescription</p>
        </button>
        <button className="glass-card p-5 text-left hover:border-primary/20 transition-colors">
          <Users className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-1">View Patients</h3>
          <p className="text-sm text-muted-foreground">Access patient records</p>
        </button>
        <button className="glass-card p-5 text-left hover:border-primary/20 transition-colors">
          <Activity className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Analytics</h3>
          <p className="text-sm text-muted-foreground">View practice insights</p>
        </button>
      </div>
    </div>
  );
};
