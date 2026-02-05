import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Database,
  FileCheck,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Lock,
  Bot,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const researcherMenuItems = [
  { id: "console", label: "Research Console", icon: LayoutDashboard },
  { id: "pools", label: "Data Pools", icon: Database },
  { id: "consent", label: "Consent Management", icon: FileCheck },
  { id: "publications", label: "Publications", icon: BookOpen },
  { id: "vault", label: "Secure Vault", icon: Lock },
  { id: "assistant", label: "Selora AI", icon: Bot },
  { id: "profile", label: "Profile & Preferences", icon: Settings },
];

interface ResearcherSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  walletAddress: string;
  onSignOut: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const ResearcherSidebar = ({
  activeTab,
  onTabChange,
  walletAddress,
  onSignOut,
  collapsed: controlledCollapsed,
  onCollapsedChange,
}: ResearcherSidebarProps) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const setCollapsed = onCollapsedChange ?? setInternalCollapsed;

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50 flex-col",
        "hidden md:flex", // Hidden on mobile
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Logo showText={!collapsed} role={collapsed ? undefined : "RESEARCHER"} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Wallet */}
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
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {researcherMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-sm font-medium",
              activeTab === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-primary/10",
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
