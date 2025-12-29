import { Home, Lock, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

const menuItems = [
  { id: "archive", label: "Health Archive", icon: "📁" },
  { id: "prescriptions", label: "Prescriptions", icon: "💊" },
  { id: "exchange", label: "Data Exchange", icon: "🔄" },
  { id: "network", label: "Care Network", icon: "🩺" },
  { id: "contacts", label: "Trusted Contacts", icon: "👥" },
  { id: "coverage", label: "Analytics", icon: "📊" },
  { id: "assistant", label: "Selora AI", icon: "🤖" },
  { id: "profile", label: "Settings", icon: "⚙️" },
];

export function BottomNav({ activeTab, onTabChange, onSignOut }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-4">
        {/* Vault */}
        <button
          onClick={() => onTabChange("vault")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors",
            activeTab === "vault"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Lock className="w-5 h-5" />
          <span className="text-xs font-medium">Vault</span>
        </button>

        {/* Dashboard */}
        <button
          onClick={() => onTabChange("home")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors",
            activeTab === "home"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs font-medium">Dashboard</span>
        </button>

        {/* Menu Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <Menu className="w-5 h-5" />
              <span className="text-xs font-medium">Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
            <SheetHeader className="text-left">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl text-left transition-colors",
                    activeTab === item.id
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={onSignOut}
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
