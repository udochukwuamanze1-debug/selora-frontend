import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface UserStats {
  healthRecords: number;
  stakedDatasets: number;
  rewardsEarned: number;
  activeGuardians: number;
}

interface Activity {
  id: string;
  action: string;
  time: string;
  type: "upload" | "access" | "reward" | "prescription" | "stake";
  timestamp: number;
}

interface UserStatsContextType {
  stats: UserStats;
  activities: Activity[];
  updateStats: (key: keyof UserStats, delta: number) => void;
  addActivity: (action: string, type: Activity["type"]) => void;
  resetStats: () => void;
}

const defaultStats: UserStats = {
  healthRecords: 0,
  stakedDatasets: 0,
  rewardsEarned: 0,
  activeGuardians: 0,
};

const UserStatsContext = createContext<UserStatsContextType | null>(null);

export const useUserStats = () => {
  const context = useContext(UserStatsContext);
  if (!context) {
    throw new Error("useUserStats must be used within UserStatsProvider");
  }
  return context;
};

export const UserStatsProvider = ({ 
  children, 
  walletAddress 
}: { 
  children: ReactNode; 
  walletAddress: string;
}) => {
  const storageKey = `selora_stats_${walletAddress}`;
  const activityKey = `selora_activities_${walletAddress}`;

  const [stats, setStats] = useState<UserStats>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : defaultStats;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const stored = localStorage.getItem(activityKey);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(stats));
  }, [stats, storageKey]);

  useEffect(() => {
    localStorage.setItem(activityKey, JSON.stringify(activities));
  }, [activities, activityKey]);

  const updateStats = (key: keyof UserStats, delta: number) => {
    setStats(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  };

  const addActivity = (action: string, type: Activity["type"]) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      action,
      time: "Just now",
      type,
      timestamp: Date.now(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 20)); // Keep last 20
  };

  const resetStats = () => {
    setStats(defaultStats);
    setActivities([]);
  };

  return (
    <UserStatsContext.Provider value={{ stats, activities, updateStats, addActivity, resetStats }}>
      {children}
    </UserStatsContext.Provider>
  );
};

// Format relative time for activities
export const formatRelativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(timestamp).toLocaleDateString();
};
