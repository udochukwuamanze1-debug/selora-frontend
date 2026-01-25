import { useEffect } from "react";
import { addNotification, getLocalNotifications } from "@/lib/walrus-notifications";

const LAST_ACTIVE_KEY = "selora_last_active";
const REMINDER_SHOWN_KEY = "selora_reminder_shown";

export function useLoginReminder(walletAddress: string | null) {
  useEffect(() => {
    if (!walletAddress) return;

    // Update last active timestamp
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());

    // Check if we should show a welcome back notification
    const reminderShown = localStorage.getItem(`${REMINDER_SHOWN_KEY}_${walletAddress}`);
    const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
    
    if (lastActive) {
      const daysSinceActive = (Date.now() - parseInt(lastActive)) / (1000 * 60 * 60 * 24);
      
      // If user hasn't been active for more than 3 days and we haven't shown a reminder yet
      if (daysSinceActive > 3 && !reminderShown) {
        // Check if there's already a welcome back notification
        const notifications = getLocalNotifications(walletAddress);
        const hasWelcomeBack = notifications.some(
          n => n.type === "access_granted" && n.title.includes("Welcome back")
        );

        if (!hasWelcomeBack) {
          addNotification(walletAddress, {
            type: "access_granted",
            title: "Welcome back to Selora! 👋",
            message: "It's been a while! Check your health records and stay on top of your wellness journey.",
            fromAddress: "system",
            fromName: "Selora",
          });
        }

        localStorage.setItem(`${REMINDER_SHOWN_KEY}_${walletAddress}`, "true");
      }
    }

    // Clear the reminder flag after 24 hours so it can show again
    const clearReminder = setTimeout(() => {
      localStorage.removeItem(`${REMINDER_SHOWN_KEY}_${walletAddress}`);
    }, 24 * 60 * 60 * 1000);

    return () => clearTimeout(clearReminder);
  }, [walletAddress]);
}

// Utility to create activity notifications
export function createActivityNotification(
  walletAddress: string,
  activity: {
    type: "visit_report" | "prescription" | "access_request" | "access_granted";
    title: string;
    message: string;
    fromName?: string;
  }
) {
  return addNotification(walletAddress, {
    type: activity.type,
    title: activity.title,
    message: activity.message,
    fromAddress: "system",
    fromName: activity.fromName || "Selora",
  });
}
