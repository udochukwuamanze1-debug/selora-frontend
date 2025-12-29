import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Database,
  TrendingUp,
  Users,
  Clock,
  Gift,
  ArrowRight,
  Shield,
} from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";

export const DataExchange = () => {
  const { stats } = useUserStats();

  const hasStakes = stats.stakedDatasets > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
            Data Exchange
          </h1>
          <p className="text-muted-foreground">
            Stake your data and earn rewards transparently
          </p>
        </div>
        <Button className="gap-2">
          <Database className="w-4 h-4" />
          Stake New Data
        </Button>
      </div>

      {/* Rewards Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <span className="text-muted-foreground">Total Rewards</span>
          </div>
          <p className="text-3xl font-heading font-bold">{stats.rewardsEarned}</p>
          <p className="text-sm text-muted-foreground">Selora Points</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary/10">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-muted-foreground">Projected Monthly</span>
          </div>
          <p className="text-3xl font-heading font-bold">+0</p>
          <p className="text-sm text-muted-foreground">Points per month</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/10">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <span className="text-muted-foreground">Active Shares</span>
          </div>
          <p className="text-3xl font-heading font-bold">{stats.stakedDatasets}</p>
          <p className="text-sm text-muted-foreground">Datasets shared</p>
        </div>
      </div>

      {/* Staked Datasets */}
      <div className="glass-card p-6">
        <h2 className="font-heading text-xl font-semibold mb-6">
          Staked Datasets
        </h2>

        {!hasStakes ? (
          <div className="rounded-xl border border-border/50 p-10 text-center">
            <p className="text-muted-foreground">
              You haven’t staked any datasets yet.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              When you stake data, your active shares and rewards will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Placeholder structure for future on-chain stakes */}
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Staked dataset</h3>
                    <p className="text-sm text-muted-foreground">On-chain</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Shared With</p>
                    <p className="text-sm font-medium">—</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <p className="text-sm font-medium">—</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Rewards</p>
                    <div className="flex items-center gap-1">
                      <Gift className="w-3 h-3 text-primary" />
                      <p className="text-sm font-medium text-primary">+0</p>
                    </div>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <p className="text-xs text-muted-foreground mb-1">Progress</p>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Opportunities */}
      <div className="glass-card p-6">
        <h2 className="font-heading text-xl font-semibold mb-6">
          Available Opportunities
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Clinical Research Study</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Contribute anonymized health metrics for research
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary font-medium">
                    +0 points/month
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border hover:border-secondary/50 transition-colors cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Insurance Analytics Pool</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Join a pool to improve coverage predictions
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary font-medium">
                    +0 points/month
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
