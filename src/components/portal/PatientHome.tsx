import { Button } from "@/components/ui/button";
import {
  Upload,
  Database,
  Award,
  FileText,
  Shield,
} from "lucide-react";
import { useUserStats, formatRelativeTime } from "@/hooks/useUserStats";
import { DashboardGreeting } from "./DashboardGreeting";
import { QRAccessRequest } from "./QRAccessRequest";

interface PatientHomeProps {
  walletAddress: string;
  onNavigate: (tab: string) => void;
}

export const PatientHome = ({ walletAddress, onNavigate }: PatientHomeProps) => {
  const { stats, activities } = useUserStats();

  const statCards = [
    { label: "Health Records", value: stats.healthRecords.toString(), icon: FileText, color: "primary" },
    { label: "Staked Datasets", value: stats.stakedDatasets.toString(), icon: Database, color: "secondary" },
    { label: "Rewards Earned", value: stats.rewardsEarned.toString(), icon: Award, color: "accent" },
    { label: "Active Guardians", value: stats.activeGuardians.toString(), icon: Shield, color: "primary" },
  ];

  // Get recent activities with formatted time
  const recentActivities = activities.slice(0, 4).map(activity => ({
    ...activity,
    time: formatRelativeTime(activity.timestamp),
  }));

  // Show empty state if no activities
  const displayActivities = recentActivities.length > 0 
    ? recentActivities 
    : [
        { id: "empty", action: "No activity yet", time: "", type: "info" as const, timestamp: 0 }
      ];

  return (
    <div className="space-y-6">
      {/* Dashboard Greeting with Health Score */}
      <DashboardGreeting userName="Tunde" healthScore={85} previousScore={82} />

      <QRAccessRequest walletAddress={walletAddress} userType="patient" />

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-semibold mb-1">
              Quick Actions
            </h2>
            <p className="text-muted-foreground text-sm">
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
        {statCards.map((stat) => (
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
          </div>
          <div className="space-y-4">
            {displayActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  {activity.type === "upload" && <Upload className="w-4 h-4 text-primary" />}
                  {activity.type === "access" && <Shield className="w-4 h-4 text-secondary" />}
                  {activity.type === "reward" && <Award className="w-4 h-4 text-accent" />}
                  {activity.type === "prescription" && <FileText className="w-4 h-4 text-primary" />}
                  {activity.type === "stake" && <Database className="w-4 h-4 text-secondary" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  {activity.time && <p className="text-xs text-muted-foreground">{activity.time}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="font-heading text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
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
              <Database className="w-6 h-6 text-secondary" />
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
              <span>Selora AI</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
