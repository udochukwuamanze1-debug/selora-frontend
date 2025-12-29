import { useCallback, useEffect, useMemo, useState } from "react";
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

type NotificationEvent =
  | { kind: "insert"; notification: Notification }
  | { kind: "update"; id: string; patch: Partial<Notification> }
  | { kind: "delete"; id: string };

function storageKey(walletAddress: string) {
  return `selora_notifications_${walletAddress}`;
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function nowIso() {
  return new Date().toISOString();
}

export function useRealtimeNotifications(walletAddress: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const channel = useMemo(() => {
    if (typeof window === "undefined") return null;
    // Single channel shared across all portals/tabs in the browser.
    return new BroadcastChannel("selora_notifications");
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    const list = safeParse<Notification[]>(
      localStorage.getItem(storageKey(walletAddress)),
      []
    );
    setNotifications(list);
    setIsLoading(false);
  }, [walletAddress]);

  const persist = useCallback(
    (next: Notification[]) => {
      if (!walletAddress) return;
      localStorage.setItem(storageKey(walletAddress), JSON.stringify(next));
    },
    [walletAddress]
  );

  const upsertLocal = useCallback(
    (n: Notification) => {
      setNotifications((prev) => {
        const next = [n, ...prev].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const deduped = next.filter(
          (item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx
        );
        const limited = deduped.slice(0, 50);
        persist(limited);
        return limited;
      });
    },
    [persist]
  );

  const createWelcomeNotification = useCallback(async () => {
    if (!walletAddress) return;

    const welcomeKey = `selora_welcomed_${walletAddress}`;
    if (localStorage.getItem(welcomeKey)) return;

    const welcome: Notification = {
      id: `welcome_${walletAddress}`,
      wallet_address: walletAddress,
      type: "welcome",
      title: "Welcome to Selora!",
      message: "Explore your dashboard. Need help? Use the Selora AI tab.",
      read: false,
      created_at: nowIso(),
    };

    upsertLocal(welcome);
    localStorage.setItem(welcomeKey, "true");

    channel?.postMessage({ kind: "insert", notification: welcome } satisfies NotificationEvent);
  }, [walletAddress, upsertLocal, channel]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!walletAddress) return;
      setNotifications((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        persist(next);
        return next;
      });
      channel?.postMessage({ kind: "update", id, patch: { read: true } } satisfies NotificationEvent);
    },
    [walletAddress, persist, channel]
  );

  const markAllAsRead = useCallback(async () => {
    if (!walletAddress) return;
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      persist(next);
      return next;
    });
    // No per-id fanout; local-only is fine.
  }, [walletAddress, persist]);

  const removeNotification = useCallback(
    async (id: string) => {
      if (!walletAddress) return;
      setNotifications((prev) => {
        const next = prev.filter((n) => n.id !== id);
        persist(next);
        return next;
      });
      channel?.postMessage({ kind: "delete", id } satisfies NotificationEvent);
    },
    [walletAddress, persist, channel]
  );

  const addNotification = useCallback(
    async (type: Notification["type"], title: string, message: string) => {
      if (!walletAddress) return;

      const n: Notification = {
        id: crypto.randomUUID(),
        wallet_address: walletAddress,
        type,
        title,
        message,
        read: false,
        created_at: nowIso(),
      };

      upsertLocal(n);
      channel?.postMessage({ kind: "insert", notification: n } satisfies NotificationEvent);

      if (type !== "welcome") {
        toast.info(title, { description: message });
      }
    },
    [walletAddress, upsertLocal, channel]
  );

  useEffect(() => {
    if (!walletAddress) return;
    fetchNotifications();
    createWelcomeNotification();
  }, [walletAddress, fetchNotifications, createWelcomeNotification]);

  useEffect(() => {
    if (!walletAddress || !channel) return;

    const onMessage = (evt: MessageEvent<NotificationEvent>) => {
      const data = evt.data;
      if (!data) return;

      if (data.kind === "insert") {
        if (data.notification.wallet_address !== walletAddress) return;
        upsertLocal(data.notification);
      }

      if (data.kind === "update") {
        setNotifications((prev) => {
          const next = prev.map((n) => (n.id === data.id ? { ...n, ...data.patch } : n));
          persist(next);
          return next;
        });
      }

      if (data.kind === "delete") {
        setNotifications((prev) => {
          const next = prev.filter((n) => n.id !== data.id);
          persist(next);
          return next;
        });
      }
    };

    channel.addEventListener("message", onMessage);
    return () => channel.removeEventListener("message", onMessage);
  }, [walletAddress, channel, upsertLocal, persist]);

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

