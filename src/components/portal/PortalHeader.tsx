import { PortalSearch } from "./PortalSearch";
import { NotificationBell, Notification } from "./NotificationBell";
import { WalletAddress } from "./WalletAddress";
import { WalletBalance } from "./WalletBalance";
import { useWalrusNotifications } from "@/hooks/useWalrusNotifications";

interface PortalHeaderProps {
  title: string;
  subtitle?: string;
  walletAddress: string;
  onSearch?: (query: string) => void;
}

export const PortalHeader = ({
  title,
  subtitle,
  walletAddress,
  onSearch,
}: PortalHeaderProps) => {
  const { notifications: walrusNotifications, markAsRead, markAllRead, remove } = 
    useWalrusNotifications(walletAddress);

  // Convert to the NotificationBell format
  const notifications: Notification[] = walrusNotifications.map(n => ({
    id: n.id,
    type: mapNotificationType(n.type),
    title: n.title,
    message: n.message,
    time: formatTime(n.timestamp),
    read: n.read,
  }));

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <PortalSearch 
            placeholder="Search..." 
            onSearch={onSearch}
            className="w-48 md:w-64"
          />
          <NotificationBell
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllRead}
            onRemove={remove}
          />
          <WalletBalance />
          <WalletAddress address={walletAddress} />
        </div>
      </div>
    </div>
  );
};

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
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(timestamp).toLocaleDateString();
}