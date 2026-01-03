import { WalletAddress } from "./WalletAddress";
import { WalletBalance } from "./WalletBalance";
import { NotificationBell } from "./NotificationBell";
import { Logo } from "@/components/Logo";
import { useWalrusNotifications } from "@/hooks/useWalrusNotifications";

interface MobileHeaderProps {
  walletAddress: string;
  portalType?: string;
}

export function MobileHeader({ walletAddress, portalType = "Patient" }: MobileHeaderProps) {
  const { notifications, markAsRead, markAllRead, remove } =
    useWalrusNotifications(walletAddress);

  const formattedNotifications = notifications.map((n) => ({
    id: n.id,
    type: mapNotificationType(n.type),
    title: n.title,
    message: n.message,
    time: formatTime(n.timestamp),
    read: n.read,
  }));

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 md:hidden">
      <div className="flex items-center justify-between">
        {/* Left side: Logo with portal type underneath */}
        <div className="flex flex-col">
          <Logo size="sm" showText={true} />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium ml-11 -mt-1">
            {portalType}
          </span>
        </div>

        {/* Right side: Bell, Balance, Address */}
        <div className="flex items-center gap-2">
          <NotificationBell
            notifications={formattedNotifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllRead}
            onRemove={remove}
          />
          <WalletBalance />
          <WalletAddress address={walletAddress} className="text-xs" />
        </div>
      </div>
    </header>
  );
}

function mapNotificationType(type: string): "prescription" | "access" | "alert" | "info" | "welcome" {
  switch (type) {
    case "visit_report":
      return "info";
    case "prescription":
      return "prescription";
    case "access_request":
    case "access_granted":
      return "access";
    default:
      return "info";
  }
}

function formatTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`;
  return `${Math.floor(diffMins / 1440)} days ago`;
}