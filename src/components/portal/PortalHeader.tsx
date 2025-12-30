import { useState, useEffect } from "react";
import { PortalSearch } from "./PortalSearch";
import { NotificationBell, Notification } from "./NotificationBell";
import { WalletAddress } from "./WalletAddress";
import { WalletBalance } from "./WalletBalance";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

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
  const { 
    notifications: realtimeNotifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useRealtimeNotifications(walletAddress);

  // Convert to the NotificationBell format
  const notifications: Notification[] = realtimeNotifications.map(n => ({
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    time: formatTime(n.created_at),
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
            onMarkAllAsRead={markAllAsRead}
            onRemove={removeNotification}
          />
          <WalletBalance />
          <WalletAddress address={walletAddress} />
        </div>
      </div>
    </div>
  );
};

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}
