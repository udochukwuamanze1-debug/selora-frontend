import { Button } from "@/components/ui/button";
import {
  Upload,
  Database,
  Award,
  Bell,
  FileText,
  Shield,
  TrendingUp,
  Clock,
} from "lucide-react";

interface PatientHomeProps {
  onNavigate: (tab: string) => void;
}

export const PatientHome = ({ onNavigate }: PatientHomeProps) => {
  const stats = [
    { label: "Health Records", value: "12", icon: FileText, color: "primary" },
    { label: "Staked Datasets", value: "3", icon: Database, color: "secondary" },
    { label: "Rewards Earned", value: "156", icon: Award, color: "accent" },
    { label: "Active Guardians", value: "2", icon: Shield, color: "primary" },
  ];

  const recentActivity = [
    { action: "Uploaded lab report", time: "2 hours ago", type: "upload" },
    { action: "Granted access to Dr. Smith", time: "1 day ago", type: "access" },
    { action: "Earned 50 reward points", time: "3 days ago", type: "reward" },
    { action: "Prescription fulfilled", time: "1 week ago", type: "prescription" },
  ];

  const notifications = [
    { message: "New access request from Research Lab", urgent: true },
    { message: "Prescription ready for pickup", urgent: false },
    { message: "Insurance coverage renewal reminder", urgent: false },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Your health data is secure and under your control
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => onNavigate("vault")} className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Record
            </Button>
            <Button variant="glass" onClick={() => onNavigate("exchange")} className="gap-2">
              <Database className="w-4 h-4" />
              Stake Data
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card-hover p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
            </div>
            <p className="font-heading text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-semibold">Recent Activity</h2>
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  {activity.type === "upload" && <Upload className="w-4 h-4 text-primary" />}
                  {activity.type === "access" && <Shield className="w-4 h-4 text-secondary" />}
                  {activity.type === "reward" && <Award className="w-4 h-4 text-accent" />}
                  {activity.type === "prescription" && <FileText className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-semibold">Notifications</h2>
            <div className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full" />
            </div>
          </div>
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${
                  notification.urgent
                    ? "border-accent/30 bg-accent/5"
                    : "border-border bg-muted/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {notification.urgent && (
                    <span className="w-2 h-2 mt-2 rounded-full bg-accent shrink-0" />
                  )}
                  <p className="text-sm">{notification.message}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-muted-foreground">
            View all notifications
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h2 className="font-heading text-xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="glass"
            className="h-auto flex-col gap-2 py-6"
            onClick={() => onNavigate("archive")}
          >
            <FileText className="w-6 h-6 text-primary" />
            <span>View Records</span>
          </Button>
          <Button
            variant="glass"
            className="h-auto flex-col gap-2 py-6"
            onClick={() => onNavigate("prescriptions")}
          >
            <TrendingUp className="w-6 h-6 text-secondary" />
            <span>Prescriptions</span>
          </Button>
          <Button
            variant="glass"
            className="h-auto flex-col gap-2 py-6"
            onClick={() => onNavigate("contacts")}
          >
            <Shield className="w-6 h-6 text-accent" />
            <span>Guardians</span>
          </Button>
          <Button
            variant="glass"
            className="h-auto flex-col gap-2 py-6"
            onClick={() => onNavigate("assistant")}
          >
            <Award className="w-6 h-6 text-primary" />
            <span>Health Guide</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
