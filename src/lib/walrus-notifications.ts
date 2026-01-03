import { WALRUS_CONFIG } from "@/config/constants";

interface WalrusNotification {
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

interface NotificationBlobData {
  walletAddress: string;
  notifications: WalrusNotification[];
  lastUpdated: number;
}

const NOTIFICATION_STORAGE_KEY = "selora_notifications";
const NOTIFICATION_BLOB_KEY = "selora_notification_blob";

// Get notifications blob ID for a wallet
const getNotificationBlobId = (walletAddress: string): string | null => {
  const stored = localStorage.getItem(`${NOTIFICATION_BLOB_KEY}_${walletAddress}`);
  return stored;
};

// Save notification blob ID
const saveNotificationBlobId = (walletAddress: string, blobId: string): void => {
  localStorage.setItem(`${NOTIFICATION_BLOB_KEY}_${walletAddress}`, blobId);
};

// Get local notifications
export const getLocalNotifications = (walletAddress: string): WalrusNotification[] => {
  try {
    const stored = localStorage.getItem(`${NOTIFICATION_STORAGE_KEY}_${walletAddress}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save local notifications
const saveLocalNotifications = (walletAddress: string, notifications: WalrusNotification[]): void => {
  localStorage.setItem(`${NOTIFICATION_STORAGE_KEY}_${walletAddress}`, JSON.stringify(notifications));
};

// Upload notifications to Walrus
export const syncNotificationsToWalrus = async (
  walletAddress: string,
  notifications: WalrusNotification[]
): Promise<string | null> => {
  try {
    const data: NotificationBlobData = {
      walletAddress,
      notifications,
      lastUpdated: Date.now(),
    };

    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });

    const response = await fetch(`${WALRUS_CONFIG.PUBLISHER_URL}/v1/blobs`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: blob,
    });

    if (!response.ok) {
      console.error("Failed to upload notifications to Walrus:", response.statusText);
      return null;
    }

    const result = await response.json();
    const blobId = result.newlyCreated?.blobObject?.blobId || result.alreadyCertified?.blobId;
    
    if (blobId) {
      saveNotificationBlobId(walletAddress, blobId);
      return blobId;
    }
    
    return null;
  } catch (error) {
    console.error("Error syncing notifications to Walrus:", error);
    return null;
  }
};

// Fetch notifications from Walrus
export const fetchNotificationsFromWalrus = async (
  walletAddress: string
): Promise<WalrusNotification[]> => {
  try {
    const blobId = getNotificationBlobId(walletAddress);
    if (!blobId) {
      return getLocalNotifications(walletAddress);
    }

    const response = await fetch(`${WALRUS_CONFIG.AGGREGATOR_URL}/v1/blobs/${blobId}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn("Failed to fetch from Walrus, using local:", response.statusText);
      return getLocalNotifications(walletAddress);
    }

    const data: NotificationBlobData = await response.json();
    
    // Merge with local notifications (local might have newer ones)
    const localNotifications = getLocalNotifications(walletAddress);
    const mergedNotifications = mergeNotifications(data.notifications, localNotifications);
    
    // Save merged back to local
    saveLocalNotifications(walletAddress, mergedNotifications);
    
    return mergedNotifications;
  } catch (error) {
    console.error("Error fetching notifications from Walrus:", error);
    return getLocalNotifications(walletAddress);
  }
};

// Merge notifications, keeping unique ones by ID
const mergeNotifications = (
  walrusNotifications: WalrusNotification[],
  localNotifications: WalrusNotification[]
): WalrusNotification[] => {
  const notificationMap = new Map<string, WalrusNotification>();
  
  // Add Walrus notifications first
  walrusNotifications.forEach(n => notificationMap.set(n.id, n));
  
  // Override/add local notifications (they might be more up-to-date)
  localNotifications.forEach(n => {
    const existing = notificationMap.get(n.id);
    if (!existing || n.timestamp > existing.timestamp) {
      notificationMap.set(n.id, n);
    }
  });
  
  // Sort by timestamp descending
  return Array.from(notificationMap.values()).sort((a, b) => b.timestamp - a.timestamp);
};

// Add a new notification (for when doctor sends a visit report)
export const addNotification = async (
  patientWalletAddress: string,
  notification: Omit<WalrusNotification, "id" | "timestamp" | "read">
): Promise<WalrusNotification> => {
  const newNotification: WalrusNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
    read: false,
  };

  // Get existing notifications
  const notifications = getLocalNotifications(patientWalletAddress);
  
  // Add new notification at the beginning
  const updatedNotifications = [newNotification, ...notifications].slice(0, 50);
  
  // Save locally
  saveLocalNotifications(patientWalletAddress, updatedNotifications);
  
  // Sync to Walrus in background
  syncNotificationsToWalrus(patientWalletAddress, updatedNotifications).catch(console.error);
  
  return newNotification;
};

// Mark notification as read
export const markNotificationAsRead = async (
  walletAddress: string,
  notificationId: string
): Promise<void> => {
  const notifications = getLocalNotifications(walletAddress);
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  
  saveLocalNotifications(walletAddress, updated);
  
  // Sync to Walrus in background
  syncNotificationsToWalrus(walletAddress, updated).catch(console.error);
};

// Mark all as read
export const markAllNotificationsAsRead = async (walletAddress: string): Promise<void> => {
  const notifications = getLocalNotifications(walletAddress);
  const updated = notifications.map(n => ({ ...n, read: true }));
  
  saveLocalNotifications(walletAddress, updated);
  syncNotificationsToWalrus(walletAddress, updated).catch(console.error);
};

// Remove a notification
export const removeNotification = async (
  walletAddress: string,
  notificationId: string
): Promise<void> => {
  const notifications = getLocalNotifications(walletAddress);
  const updated = notifications.filter(n => n.id !== notificationId);
  
  saveLocalNotifications(walletAddress, updated);
  syncNotificationsToWalrus(walletAddress, updated).catch(console.error);
};

// Send visit report notification to patient
export const sendVisitReportNotification = async (
  patientWalletAddress: string,
  doctorName: string,
  doctorAddress: string,
  reportType: string,
  diagnosis: string
): Promise<WalrusNotification> => {
  return addNotification(patientWalletAddress, {
    type: "visit_report",
    title: `New Visit Report from Dr. ${doctorName}`,
    message: `You have received a new ${reportType} with diagnosis: ${diagnosis.slice(0, 50)}${diagnosis.length > 50 ? '...' : ''}`,
    fromAddress: doctorAddress,
    fromName: doctorName,
    data: {
      reportType,
      diagnosis,
    },
  });
};

// Send prescription notification to patient
export const sendPrescriptionNotification = async (
  patientWalletAddress: string,
  doctorName: string,
  doctorAddress: string,
  medicationDetails: string
): Promise<WalrusNotification> => {
  return addNotification(patientWalletAddress, {
    type: "prescription",
    title: `New Prescription from Dr. ${doctorName}`,
    message: `You have received a new prescription: ${medicationDetails.slice(0, 50)}${medicationDetails.length > 50 ? '...' : ''}`,
    fromAddress: doctorAddress,
    fromName: doctorName,
    data: {
      medicationDetails,
    },
  });
};
