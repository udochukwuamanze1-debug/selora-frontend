import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Notification {
  id: string;
  wallet_address: string;
  type: "prescription" | "access" | "alert" | "info" | "welcome";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function useRealtimeNotifications(walletAddress: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("wallet_address", walletAddress)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications((data as Notification[]) || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Create welcome notification for new users
  const createWelcomeNotification = useCallback(async () => {
    if (!walletAddress) return;

    const welcomeKey = `selora_welcomed_${walletAddress}`;
    if (localStorage.getItem(welcomeKey)) return;

    try {
      const { error } = await supabase.from("notifications").insert({
        wallet_address: walletAddress,
        type: "welcome",
        title: "Welcome to Selora!",
        message: "Explore your dashboard. Need help? Use the Health Guide tab or report issues to our AI assistant.",
      });

      if (!error) {
        localStorage.setItem(welcomeKey, "true");
      }
    } catch (error) {
      console.error("Error creating welcome notification:", error);
    }
  }, [walletAddress]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!walletAddress) return;
    
    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("wallet_address", walletAddress);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [walletAddress]);

  // Remove notification
  const removeNotification = useCallback(async (id: string) => {
    try {
      await supabase.from("notifications").delete().eq("id", id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error removing notification:", error);
    }
  }, []);

  // Add notification
  const addNotification = useCallback(async (
    type: Notification["type"],
    title: string,
    message: string
  ) => {
    if (!walletAddress) return;

    try {
      const { error } = await supabase.from("notifications").insert({
        wallet_address: walletAddress,
        type,
        title,
        message,
      });

      if (error) throw error;
      toast.success(title);
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  }, [walletAddress]);

  // Set up realtime subscription
  useEffect(() => {
    if (!walletAddress) return;

    fetchNotifications();
    createWelcomeNotification();

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `wallet_address=eq.${walletAddress}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for new notifications
          if (newNotification.type !== "welcome") {
            toast.info(newNotification.title, {
              description: newNotification.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [walletAddress, fetchNotifications, createWelcomeNotification]);

  return {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addNotification,
    refetch: fetchNotifications,
  };
}
