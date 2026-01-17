import { Button } from "@/components/ui/button";
import {
  Upload,
  Database,
  Award,
  FileText,
  Shield,
  Zap,
} from "lucide-react";
import { useUserStats, formatRelativeTime } from "@/hooks/useUserStats";
import { DashboardGreeting } from "./DashboardGreeting";
import { QRAccessRequest } from "./QRAccessRequest";
import { useAvatar } from "@/hooks/useAvatar";
import { useXPRewards } from "@/hooks/useXPRewards";
import { useEffect } from "react";

interface PatientHomeProps {
  walletAddress: string;
  onNavigate: (tab: string) => void;
}

export const PatientHome = ({ walletAddress, onNavigate }: PatientHomeProps) => {
  const { stats, activities } = useUserStats();
  const { avatar } = useAvatar(walletAddress);
  const { xp, level, xpProgress, xpToNextLevel, checkDailyLogin, records } = useXPRewards();

  // Check for daily login XP on mount
  useEffect(() => {
    checkDailyLogin();
  }, []);

  const statCards = [
    { label: "Health Records", value: stats.healthRecords.toString(), icon: FileText, color: "primary" },
    { label: "Staked Datasets", value: stats.stakedDatasets.toString(), icon: Database, color: "secondary" },
    { label: "Total XP", value: xp.toString(), icon: Zap, color: "accent" },
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

  // Get recent XP rewards
  const recentXPRewards = records.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Dashboard Greeting with Health Score and XP */}
      <DashboardGreeting 
        userName={avatar?.name}
        healthScore={stats.healthRecords > 0 ? 75 + Math.min(stats.healthRecords * 2, 20) : undefined}
        previousScore={stats.healthRecords > 0 ? 73 + Math.min(stats.healthRecords * 2, 18) : undefined}
        healthRecordsCount={stats.healthRecords}
        walletAddress={walletAddress}
        xp={xp}
        level={level}
        xpProgress={xpProgress}
        xpToNextLevel={xpToNextLevel}
      />

      <QRAccessRequest walletAddress={walletAddress} userType="patient" />

      {/* Quick Actions */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-semibold mb-1">
              Quick Actions
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Your health data is secure and under your control
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button onClick={() => onNavigate("vault")} className="gap-2 w-full sm:w-auto">
              <Upload className="w-4 h-4" />
              Upload Record
            </Button>
            <Button variant="glass" onClick={() => onNavigate("exchange")} className="gap-2 w-full sm:w-auto">
              <Database className="w-4 h-4" />
              Stake Data
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card-hover p-3 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className={`p-1.5 sm:p-2 rounded-lg bg-${stat.color}/10`}>
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${stat.color}`} />
              </div>
            </div>
            <p className="font-heading text-xl sm:text-3xl font-bold mb-0.5 sm:mb-1">{stat.value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="glass-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="font-heading text-lg sm:text-xl font-semibold">Recent Activity</h2>
          </div>
          <div className="space-y-2 sm:space-y-4">
            {displayActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                  {activity.type === "upload" && <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />}
                  {activity.type === "access" && <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />}
                  {activity.type === "reward" && <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />}
                  {activity.type === "prescription" && <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />}
                  {activity.type === "stake" && <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">{activity.action}</p>
                  {activity.time && <p className="text-[10px] sm:text-xs text-muted-foreground">{activity.time}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* XP Rewards & Quick Actions */}
        <div className="space-y-4 sm:space-y-6">
          {/* Recent XP Rewards */}
          {recentXPRewards.length > 0 && (
            <div className="glass-card p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                <h2 className="font-heading text-base sm:text-lg font-semibold">Recent XP Earned</h2>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {recentXPRewards.map((reward) => (
                  <div key={reward.timestamp} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground truncate mr-2">{reward.action.replace(/_/g, ' ').toLowerCase()}</span>
                    <span className="font-bold text-yellow-500 shrink-0">+{reward.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions Grid */}
          <div className="glass-card p-4 sm:p-6">
            <h2 className="font-heading text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <Button
                variant="glass"
                className="h-auto flex-col gap-1.5 sm:gap-2 py-4 sm:py-6"
                onClick={() => onNavigate("archive")}
              >
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm">View Records</span>
              </Button>
              <Button
                variant="glass"
                className="h-auto flex-col gap-1.5 sm:gap-2 py-4 sm:py-6"
                onClick={() => onNavigate("prescriptions")}
              >
                <Database className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                <span className="text-xs sm:text-sm">Prescriptions</span>
              </Button>
              <Button
                variant="glass"
                className="h-auto flex-col gap-1.5 sm:gap-2 py-4 sm:py-6"
                onClick={() => onNavigate("contacts")}
              >
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                <span className="text-xs sm:text-sm">Guardians</span>
              </Button>
              <Button
                variant="glass"
                className="h-auto flex-col gap-1.5 sm:gap-2 py-4 sm:py-6"
                onClick={() => onNavigate("assistant")}
              >
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span className="text-xs sm:text-sm">Selora AI</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};