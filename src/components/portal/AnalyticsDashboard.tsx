import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  TrendingUp,
  Users,
  FileText,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Shield,
  Wallet,
  Database,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AnalyticsDashboardProps {
  walletAddress: string;
}

interface ActivityLog {
  id: string;
  action: string;
  type: "upload" | "view" | "share" | "payment" | "access" | "mint";
  timestamp: Date;
  details: string;
  portal?: string;
}

const mockActivityLogs: ActivityLog[] = [
  { id: "1", action: "File uploaded", type: "upload", timestamp: new Date(Date.now() - 1000 * 60 * 5), details: "blood_test_results.pdf", portal: "Patient" },
  { id: "2", action: "Prescription paid", type: "payment", timestamp: new Date(Date.now() - 1000 * 60 * 30), details: "0.5 SUI", portal: "Patient" },
  { id: "3", action: "Data access granted", type: "access", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), details: "Dr. Sarah Johnson", portal: "Patient" },
  { id: "4", action: "Health record viewed", type: "view", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), details: "Cardiology Report 2024", portal: "Patient" },
  { id: "5", action: "Avatar minted", type: "mint", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), details: "Selora Avatar #1234", portal: "Patient" },
  { id: "6", action: "Data shared", type: "share", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), details: "Anonymized dataset for research", portal: "Patient" },
];

const mockStats = {
  totalUploads: 24,
  uploadsChange: 12,
  totalTransactions: 8,
  transactionsChange: -5,
  activeConnections: 3,
  connectionsChange: 50,
  storageUsed: "128 MB",
  storageChange: 8,
};

const getActionIcon = (type: ActivityLog["type"]) => {
  switch (type) {
    case "upload":
      return <FileText className="w-4 h-4" />;
    case "view":
      return <Eye className="w-4 h-4" />;
    case "share":
      return <Users className="w-4 h-4" />;
    case "payment":
      return <Wallet className="w-4 h-4" />;
    case "access":
      return <Shield className="w-4 h-4" />;
    case "mint":
      return <Database className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

const getActionColor = (type: ActivityLog["type"]) => {
  switch (type) {
    case "upload":
      return "bg-blue-500/10 text-blue-500";
    case "view":
      return "bg-gray-500/10 text-gray-500";
    case "share":
      return "bg-green-500/10 text-green-500";
    case "payment":
      return "bg-yellow-500/10 text-yellow-500";
    case "access":
      return "bg-purple-500/10 text-purple-500";
    case "mint":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const AnalyticsDashboard = ({ walletAddress }: AnalyticsDashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Uploads</p>
                <p className="text-2xl font-bold">{mockStats.totalUploads}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              {mockStats.uploadsChange > 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={mockStats.uploadsChange > 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(mockStats.uploadsChange)}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{mockStats.totalTransactions}</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Wallet className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              {mockStats.transactionsChange > 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={mockStats.transactionsChange > 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(mockStats.transactionsChange)}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold">{mockStats.activeConnections}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-green-500">{mockStats.connectionsChange}%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">{mockStats.storageUsed}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Database className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-green-500">{mockStats.storageChange}%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Transaction History */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Activity Log</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="access">Access History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>All portal activities across your account</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {mockActivityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn("p-2 rounded-lg", getActionColor(log.type))}>
                        {getActionIcon(log.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.action}</span>
                          {log.portal && (
                            <Badge variant="outline" className="text-xs">
                              {log.portal}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(log.timestamp)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(log.timestamp, "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Transaction History
              </CardTitle>
              <CardDescription>All on-chain transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {mockActivityLogs
                    .filter((log) => ["payment", "mint"].includes(log.type))
                    .map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted/30"
                      >
                        <div className={cn("p-2 rounded-lg", getActionColor(log.type))}>
                          {getActionIcon(log.type)}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">{log.action}</span>
                          <p className="text-sm text-muted-foreground">{log.details}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {formatTimeAgo(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="mt-4">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Access History
              </CardTitle>
              <CardDescription>Who has accessed your data</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {mockActivityLogs
                    .filter((log) => ["access", "share", "view"].includes(log.type))
                    .map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted/30"
                      >
                        <div className={cn("p-2 rounded-lg", getActionColor(log.type))}>
                          {getActionIcon(log.type)}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">{log.action}</span>
                          <p className="text-sm text-muted-foreground">{log.details}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {formatTimeAgo(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
