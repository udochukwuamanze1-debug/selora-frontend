import { useState, useEffect } from "react";
import { PortalSearch } from "./PortalSearch";
import { NotificationBell, Notification } from "./NotificationBell";
import { WalletAddress } from "./WalletAddress";
import { WalletBalance } from "./WalletBalance";

interface PortalHeaderProps {
  title: string;
  subtitle?: string;
  walletAddress: string;
  onSearch?: (query: string) => void;
}

const getInitialNotifications = (walletAddress: string): Notification[] => {
  const storageKey = `selora_notifications_${walletAddress}`;
  const stored = localStorage.getItem(storageKey);
  
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Welcome notification for new users
  const welcomeNotification: Notification = {
    id: "welcome",
    type: "welcome",
    title: "Welcome to Selora!",
    message: "Explore your dashboard. Need help? Use the Health Guide tab or report issues to our AI assistant.",
    time: "Just now",
    read: false,
  };
  
  localStorage.setItem(storageKey, JSON.stringify([welcomeNotification]));
  return [welcomeNotification];
};

export const PortalHeader = ({
  title,
  subtitle,
  walletAddress,
  onSearch,
}: PortalHeaderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications(getInitialNotifications(walletAddress));
  }, [walletAddress]);

  const saveNotifications = (newNotifications: Notification[]) => {
    const storageKey = `selora_notifications_${walletAddress}`;
    localStorage.setItem(storageKey, JSON.stringify(newNotifications));
    setNotifications(newNotifications);
  };

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const handleRemove = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

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
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onRemove={handleRemove}
          />
          <WalletAddress address={walletAddress} />
          <WalletBalance />
        </div>
      </div>
    </div>
  );
};
