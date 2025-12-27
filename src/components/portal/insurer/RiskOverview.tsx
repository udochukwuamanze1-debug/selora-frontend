import { TrendingUp, TrendingDown, Users, FileText, AlertTriangle, DollarSign } from "lucide-react";

const stats = [
  { label: "Active Policies", value: "12,847", icon: FileText, change: "+4.2%", positive: true },
  { label: "Claims This Month", value: "342", icon: AlertTriangle, change: "-8.1%", positive: true },
  { label: "Pool Coverage", value: "$24.5M", icon: DollarSign, change: "+12.3%", positive: true },
  { label: "Risk Score Avg", value: "72/100", icon: TrendingUp, change: "-2.1%", positive: true },
];

const riskCategories = [
  { name: "Chronic Conditions", coverage: 4200, claims: 89, riskLevel: "moderate" },
  { name: "Preventive Care", coverage: 6100, claims: 42, riskLevel: "low" },
  { name: "Emergency Services", coverage: 1800, claims: 156, riskLevel: "high" },
  { name: "Mental Health", coverage: 2100, claims: 34, riskLevel: "low" },
  { name: "Specialist Visits", coverage: 3400, claims: 67, riskLevel: "moderate" },
];

export const RiskOverview = () => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-500 bg-green-500/10";
      case "moderate":
        return "text-yellow-500 bg-yellow-500/10";
      case "high":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          Risk Overview Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor coverage pools, claims, and risk metrics
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
              <span
                className={`flex items-center gap-1 text-sm ${
                  stat.positive ? "text-green-500" : "text-red-500"
                }`}
              >
                {stat.positive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Risk Categories Table */}
      <div className="glass-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Risk Categories
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Coverage Count</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Claims</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Risk Level</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Claim Rate</th>
              </tr>
            </thead>
            <tbody>
              {riskCategories.map((category) => (
                <tr key={category.name} className="border-b border-border/30 hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium text-foreground">{category.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{category.coverage.toLocaleString()}</td>
                  <td className="py-3 px-4 text-muted-foreground">{category.claims}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${getRiskColor(category.riskLevel)}`}>
                      {category.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {((category.claims / category.coverage) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pool Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-semibold mb-4 text-foreground">Pool Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Reserve Ratio</span>
                <span className="text-foreground font-medium">78%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "78%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Claims Coverage</span>
                <span className="text-foreground font-medium">92%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Risk Exposure</span>
                <span className="text-foreground font-medium">34%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: "34%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-heading text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Coverage Distribution
          </h3>
          <div className="space-y-3">
            {[
              { label: "Individual Plans", count: 8420, percentage: 65 },
              { label: "Family Plans", count: 3200, percentage: 25 },
              { label: "Corporate Plans", count: 1227, percentage: 10 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground w-12">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
