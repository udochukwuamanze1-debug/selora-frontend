import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Users,
  FileText,
  Clock,
  Shield,
  Wallet,
  Database,
  Eye,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Load activity from localStorage (new users will have empty logs)
  useEffect(() => {
    const savedLogs = localStorage.getItem(`selora_activity_${walletAddress}`);
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        setActivityLogs(parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        })));
      } catch {
        setActivityLogs([]);
      }
    }
  }, [walletAddress]);

  // Calculate stats from actual activity
  const stats = {
    totalUploads: activityLogs.filter((l) => l.type === "upload").length,
    totalTransactions: activityLogs.filter((l) => ["payment", "mint"].includes(l.type)).length,
    activeConnections: activityLogs.filter((l) => l.type === "access").length,
    storageUsed: "0 MB",
  };

  const EmptyState = ({ title, description }: { title: string; description: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">Coverage & Protection</h1>
        <p className="text-muted-foreground">Monitor your activity and data usage</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Uploads</p>
                <p className="text-2xl font-bold">{stats.totalUploads}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Wallet className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold">{stats.activeConnections}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">{stats.storageUsed}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Database className="w-6 h-6 text-primary" />
              </div>
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
              {activityLogs.length === 0 ? (
                <EmptyState
                  title="No activity yet"
                  description="Your activity will appear here as you use Selora. Upload files, make transactions, or share data to get started."
                />
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className={cn("p-2 rounded-lg", getActionColor(log.type))}>
                          {getActionIcon(log.type)}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">{log.action}</span>
                          <p className="text-sm text-muted-foreground">{log.details}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
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
              {activityLogs.filter((log) => ["payment", "mint"].includes(log.type)).length === 0 ? (
                <EmptyState
                  title="No transactions yet"
                  description="Your transaction history will appear here once you make payments or mint assets."
                />
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {activityLogs
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
              )}
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
              {activityLogs.filter((log) => ["access", "share", "view"].includes(log.type)).length === 0 ? (
                <EmptyState
                  title="No access history"
                  description="When you share data or grant access to others, their activity will appear here."
                />
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {activityLogs
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
