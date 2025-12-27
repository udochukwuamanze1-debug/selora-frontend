import { Activity, Users, FileText, Clock } from "lucide-react";

const stats = [
  { label: "Active Patients", value: "24", icon: Users, change: "+3 this week" },
  { label: "Pending Reviews", value: "8", icon: FileText, change: "2 urgent" },
  { label: "Prescriptions Today", value: "12", icon: Activity, change: "+4 from yesterday" },
  { label: "Avg. Response Time", value: "2.4h", icon: Clock, change: "-0.5h improvement" },
];

const recentActivity = [
  { patient: "Patient #1842", action: "Uploaded lab results", time: "10 min ago", type: "upload" },
  { patient: "Patient #2391", action: "Requested access permission", time: "25 min ago", type: "permission" },
  { patient: "Patient #1567", action: "Prescription fulfilled", time: "1 hour ago", type: "prescription" },
  { patient: "Patient #3102", action: "New health record shared", time: "2 hours ago", type: "share" },
  { patient: "Patient #2845", action: "Emergency access triggered", time: "3 hours ago", type: "emergency" },
];

export const CareWorkspace = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          Care Workspace
        </h1>
        <p className="text-muted-foreground">
          Overview of your patients and recent activity
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
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div>
                <p className="font-medium text-foreground">{activity.patient}</p>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
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
