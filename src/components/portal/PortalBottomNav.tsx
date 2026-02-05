import { useState } from "react";
import { Home, Lock, Menu, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export interface BottomNavItem {
  id: string;
  label: string;
  icon: string | LucideIcon;
}

interface PortalBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  menuItems: BottomNavItem[];
  primaryTabs?: { id: string; label: string; icon: LucideIcon }[];
}

export function PortalBottomNav({
  activeTab,
  onTabChange,
  onSignOut,
  menuItems,
  primaryTabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "vault", label: "Vault", icon: Lock },
  ],
}: PortalBottomNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setMenuOpen(false);
  };

  // Filter out primary tabs from menu items to avoid duplication
  const primaryTabIds = primaryTabs.map((t) => t.id);
  const secondaryItems = menuItems.filter((item) => !primaryTabIds.includes(item.id));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-4">
        {/* Primary tabs */}
        {primaryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors min-w-[64px]",
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground active:scale-95"
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}

        {/* Menu Sheet */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors active:scale-95 min-w-[64px]">
              <Menu className="w-5 h-5" />
              <span className="text-xs font-medium">Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
            <SheetHeader className="text-left">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-3 mt-6 overflow-y-auto max-h-[calc(70vh-140px)]">
              {secondaryItems.map((item) => {
                const IconComponent = typeof item.icon === "string" ? null : item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl text-left transition-colors active:scale-[0.98]",
                      activeTab === item.id
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    {typeof item.icon === "string" ? (
                      <span className="text-xl">{item.icon}</span>
                    ) : IconComponent ? (
                      <IconComponent className="w-5 h-5" />
                    ) : null}
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive active:scale-[0.98]"
                onClick={() => {
                  onSignOut();
                  setMenuOpen(false);
                }}
              >
                Sign Out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
