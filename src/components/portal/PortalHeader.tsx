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
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col gap-4 mb-4 md:mb-6">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{subtitle}</p>
            )}
          </div>
          
          {/* Wallet info - always visible but compact on mobile */}
          <div className="flex items-center gap-2 shrink-0">
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
        
        {/* Search row - full width on mobile */}
        {onSearch && (
          <PortalSearch 
            placeholder="Search..." 
            onSearch={onSearch}
            className="w-full sm:w-64 md:w-72"
          />
        )}
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