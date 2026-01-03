import { useState, useEffect, useCallback } from "react";
import {
  getLocalNotifications,
  fetchNotificationsFromWalrus,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
} from "@/lib/walrus-notifications";

interface Notification {
  id: string;
  type: "visit_report" | "prescription" | "access_request" | "access_granted";
  title: string;
  message: string;
  fromAddress: string;
  fromName?: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, unknown>;
}

export function useWalrusNotifications(walletAddress: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!walletAddress) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // First load local for instant display
      const local = getLocalNotifications(walletAddress);
      setNotifications(local);
      setUnreadCount(local.filter(n => !n.read).length);

      // Then fetch from Walrus and merge
      const walrusNotifications = await fetchNotificationsFromWalrus(walletAddress);
      setNotifications(walrusNotifications);
      setUnreadCount(walrusNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!walletAddress) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [walletAddress, loadNotifications]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    await markNotificationAsRead(walletAddress, notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [walletAddress]);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    await markAllNotificationsAsRead(walletAddress);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [walletAddress]);

  // Remove notification
  const remove = useCallback(async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    await removeNotification(walletAddress, notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [walletAddress, notifications]);

  // Refresh notifications
  const refresh = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllRead,
    remove,
    refresh,
  };
}