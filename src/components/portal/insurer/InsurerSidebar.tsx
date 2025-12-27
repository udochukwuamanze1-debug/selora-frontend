import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Shield,
  BarChart3,
  ShoppingCart,
  FileCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "risk", label: "Risk Overview", icon: BarChart3 },
  { id: "marketplace", label: "Data Marketplace", icon: ShoppingCart },
  { id: "claims", label: "Claims", icon: FileCheck },
  { id: "settings", label: "Settings", icon: Settings },
];

interface InsurerSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  walletAddress: string;
  onSignOut: () => void;
}

export const InsurerSidebar = ({
  activeTab,
  onTabChange,
  walletAddress,
  onSignOut,
}: InsurerSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full glass-card border-r border-border/50 transition-all duration-300 z-50 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          {!collapsed && <Logo />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Role Badge */}
      <div className="p-4 border-b border-border/50">
        <div
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl bg-primary/10",
            collapsed && "justify-center"
          )}
        >
          <Shield className="w-5 h-5 text-primary shrink-0" />
          {!collapsed && (
            <div>
              <p className="text-sm font-medium text-foreground">Insurer</p>
              <p className="text-xs text-muted-foreground">Risk Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Wallet */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="w-4 h-4" />
            <span>{truncateAddress(walletAddress)}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
              activeTab === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive",
            collapsed && "justify-center"
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
