import { useState, useEffect } from "react";
import { TrendingUp, Users, FileText, AlertTriangle, DollarSign, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RiskOverviewProps {
  isNewUser?: boolean;
  walletAddress?: string;
}

export const RiskOverview = ({ isNewUser = false, walletAddress = "" }: RiskOverviewProps) => {
  const [claimsCount, setClaimsCount] = useState(0);
  const [totalCoverage, setTotalCoverage] = useState(0);

  useEffect(() => {
    if (!walletAddress) return;
    const fetchData = async () => {
      const { count } = await supabase
        .from("insurance_claims")
        .select("*", { count: "exact", head: true })
        .eq("insurer_address", walletAddress);
      if (count !== null) setClaimsCount(count);

      const { data } = await supabase
        .from("insurance_claims")
        .select("claim_amount")
        .eq("insurer_address", walletAddress);
      if (data) setTotalCoverage(data.reduce((s, c) => s + Number(c.claim_amount || 0), 0));
    };
    fetchData();
  }, [walletAddress]);

  const stats = [
    { label: "Active Policies", value: "0", icon: FileText, change: "No policies yet", positive: true },
    { label: "Claims This Month", value: claimsCount.toString(), icon: AlertTriangle, change: claimsCount > 0 ? `${claimsCount} claims` : "No claims", positive: true },
    { label: "Pool Coverage", value: totalCoverage > 0 ? `$${totalCoverage.toLocaleString()}` : "$0", icon: DollarSign, change: totalCoverage > 0 ? "Active coverage" : "Set up your pool", positive: true },
    { label: "Risk Score Avg", value: "--", icon: TrendingUp, change: "N/A", positive: true },
  ];

  return (
    <div className="space-y-6">
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
            <p className="text-xs text-primary mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-heading text-xl font-semibold mb-2 text-foreground">
          {claimsCount === 0 ? "No Risk Data Yet" : "Risk Dashboard"}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {claimsCount === 0
            ? "Set up your coverage pools and start adding policies to see risk metrics and analytics. Patient data from consented pools will be analyzed for risk assessment."
            : `You have ${claimsCount} claims. Detailed analytics coming soon.`}
        </p>
      </div>

      {/* Pool Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-semibold mb-4 text-foreground">Pool Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Reserve Ratio</span>
                <span className="text-foreground font-medium">0%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Claims Coverage</span>
                <span className="text-foreground font-medium">0%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "0%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Coverage Distribution
          </h3>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No coverage data available yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};
