import { WalletAddress } from "./WalletAddress";
import { WalletBalance } from "./WalletBalance";
import { NotificationBell } from "./NotificationBell";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

interface MobileHeaderProps {
  walletAddress: string;
  portalType?: string;
}

export function MobileHeader({ walletAddress, portalType = "Patient" }: MobileHeaderProps) {
  const { notifications, markAsRead, markAllAsRead, removeNotification } =
    useRealtimeNotifications(walletAddress);

  const formattedNotifications = notifications.map((n) => ({
    id: n.id,
    type: n.type as "prescription" | "access" | "alert" | "info",
    title: n.title,
    message: n.message,
    time: formatTime(n.created_at),
    read: n.read,
  }));

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 md:hidden">
      <div className="flex items-center justify-between">
        {/* Left side: Wallet info */}
        <div className="flex items-center gap-2">
          <WalletAddress address={walletAddress} />
          <WalletBalance />
        </div>

        {/* Right side: Notifications, Logo, Portal ID */}
        <div className="flex items-center gap-2">
          <NotificationBell
            notifications={formattedNotifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onRemove={removeNotification}
          />
          <Logo className="h-6 w-auto" />
          <Badge variant="outline" className="text-xs">
            {portalType}
          </Badge>
        </div>
      </div>
    </header>
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`;
  return `${Math.floor(diffMins / 1440)} days ago`;
}
