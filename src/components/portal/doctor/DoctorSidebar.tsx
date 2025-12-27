import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { id: "workspace", label: "Care Workspace", icon: LayoutDashboard },
  { id: "insights", label: "Patient Insights", icon: Users },
  { id: "prescriptions", label: "Prescriptions & Orders", icon: FileText },
  { id: "profile", label: "Profile & Preferences", icon: Settings },
];

interface DoctorSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  walletAddress: string;
  onSignOut: () => void;
}

export const DoctorSidebar = ({
  activeTab,
  onTabChange,
  walletAddress,
  onSignOut,
}: DoctorSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Logo showText={!collapsed} />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Role Badge */}
      <div className={cn("px-4 py-2", collapsed && "px-2")}>
        <div className={cn(
          "text-xs font-medium text-primary bg-primary/10 rounded-full py-1 text-center",
          collapsed ? "px-1" : "px-3"
        )}>
          {collapsed ? "Dr" : "Doctor Portal"}
        </div>
      </div>

      {/* Wallet Address */}
      <div className={cn("p-4 border-b border-border", collapsed && "px-2")}>
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg bg-muted text-sm",
            collapsed && "justify-center"
          )}
        >
          <Wallet className="w-4 h-4 text-primary shrink-0" />
          {!collapsed && (
            <span className="truncate text-muted-foreground">
              {truncateAddress(walletAddress)}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive",
            collapsed && "justify-center px-2"
          )}
          onClick={onSignOut}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
};
