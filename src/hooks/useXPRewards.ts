import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { toast } from "sonner";

// XP values for different actions
export const XP_VALUES = {
  UPLOAD_RECORD: 50,
  SCAN_DOCUMENT: 30,
  COMPLETE_PRESCRIPTION: 100,
  GRANT_ACCESS: 20,
  RECEIVE_VISIT_REPORT: 40,
  MINT_AVATAR: 200,
  CONNECT_WEARABLE: 150,
  DAILY_LOGIN: 10,
  STAKE_DATA: 75,
  BACKUP_KEYPHRASE: 100,
} as const;

// Level thresholds
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2100,   // Level 7
  2800,   // Level 8
  3600,   // Level 9
  4500,   // Level 10
  5500,   // Level 11+
];

interface XPRecord {
  action: string;
  xp: number;
  timestamp: number;
}

interface XPState {
  totalXP: number;
  level: number;
  records: XPRecord[];
  lastDailyLogin: string | null;
}

interface XPContextType {
  xp: number;
  level: number;
  xpToNextLevel: number;
  xpProgress: number;
  records: XPRecord[];
  awardXP: (action: keyof typeof XP_VALUES, customMessage?: string) => void;
  checkDailyLogin: () => void;
}

const XPContext = createContext<XPContextType | null>(null);

const DEFAULT_XP_CONTEXT: XPContextType = {
  xp: 0,
  level: 1,
  xpToNextLevel: 100,
  xpProgress: 0,
  records: [],
  awardXP: () => {},
  checkDailyLogin: () => {},
};

export const useXPRewards = () => {
  const context = useContext(XPContext);
  return context ?? DEFAULT_XP_CONTEXT;
};

interface XPRewardsProviderProps {
  children: ReactNode;
  walletAddress: string;
}

export const XPRewardsProvider: React.FC<XPRewardsProviderProps> = ({ children, walletAddress }) => {
  const storageKey = `selora_xp_${walletAddress}`;

  const [state, setState] = useState<XPState>(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      totalXP: 0,
      level: 1,
      records: [],
      lastDailyLogin: null,
    };
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const calculateLevel = (xp: number): number => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  };

  const getXPToNextLevel = (currentXP: number, currentLevel: number): number => {
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
      return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 1000 * (currentLevel - LEVEL_THRESHOLDS.length + 1);
    }
    return LEVEL_THRESHOLDS[currentLevel] - currentXP;
  };

  const getXPProgress = (currentXP: number, currentLevel: number): number => {
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[currentLevel] || (currentThreshold + 1000);
    const progress = ((currentXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const actionLabels: Record<keyof typeof XP_VALUES, string> = {
    UPLOAD_RECORD: "Uploading health record",
    SCAN_DOCUMENT: "Scanning document",
    COMPLETE_PRESCRIPTION: "Completing prescription",
    GRANT_ACCESS: "Granting access",
    RECEIVE_VISIT_REPORT: "Receiving visit report",
    MINT_AVATAR: "Minting avatar",
    CONNECT_WEARABLE: "Connecting wearable",
    DAILY_LOGIN: "Daily login",
    STAKE_DATA: "Staking data",
    BACKUP_KEYPHRASE: "Backing up keyphrase",
  };

  const awardXP = (action: keyof typeof XP_VALUES, customMessage?: string) => {
    const xpAmount = XP_VALUES[action];
    
    setState((prev) => {
      const newTotalXP = prev.totalXP + xpAmount;
      const newLevel = calculateLevel(newTotalXP);
      const leveledUp = newLevel > prev.level;

      const newRecord: XPRecord = {
        action,
        xp: xpAmount,
        timestamp: Date.now(),
      };

      const message = customMessage || `+${xpAmount} XP for ${actionLabels[action]}!`;
      const description = leveledUp ? `Level Up! You are now Level ${newLevel}` : undefined;
      
      toast.success(message, { description });

      return {
        totalXP: newTotalXP,
        level: newLevel,
        records: [newRecord, ...prev.records].slice(0, 50),
        lastDailyLogin: prev.lastDailyLogin,
      };
    });
  };

  const checkDailyLogin = () => {
    const today = new Date().toISOString().split("T")[0];
    
    if (state.lastDailyLogin !== today) {
      setState((prev) => ({
        ...prev,
        lastDailyLogin: today,
      }));
      awardXP("DAILY_LOGIN");
    }
  };

  const level = calculateLevel(state.totalXP);
  const xpToNextLevel = getXPToNextLevel(state.totalXP, level);
  const xpProgress = getXPProgress(state.totalXP, level);

  const contextValue: XPContextType = {
    xp: state.totalXP,
    level,
    xpToNextLevel,
    xpProgress,
    records: state.records,
    awardXP,
    checkDailyLogin,
  };

  return React.createElement(
    XPContext.Provider,
    { value: contextValue },
    children
  );
};