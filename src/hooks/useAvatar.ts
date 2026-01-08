import { useState, useEffect } from 'react';

export interface SeloraAvatar {
  id: string;
  name: string;
  minted: boolean;
  mintedAt?: string;
}

const AVATARS_INDEX_KEY = "selora_avatars_index";

// Get all avatar names across all wallets
function getAllAvatarNames(): string[] {
  const index = localStorage.getItem(AVATARS_INDEX_KEY);
  return index ? JSON.parse(index) : [];
}

// Add avatar name to global index
function addAvatarToIndex(name: string): void {
  const names = getAllAvatarNames();
  if (!names.includes(name.toLowerCase())) {
    names.push(name.toLowerCase());
    localStorage.setItem(AVATARS_INDEX_KEY, JSON.stringify(names));
  }
}

// Check if avatar name already exists
export function isAvatarNameTaken(name: string): boolean {
  const names = getAllAvatarNames();
  return names.includes(name.toLowerCase());
}

export function useAvatar(walletAddress: string | undefined) {
  const [avatar, setAvatar] = useState<SeloraAvatar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);

  useEffect(() => {
    if (!walletAddress) {
      setAvatar(null);
      setIsLoading(false);
      return;
    }

    // Check local storage for avatar
    const stored = localStorage.getItem(`selora_avatar_${walletAddress}`);
    if (stored) {
      setAvatar(JSON.parse(stored));
    }
    setIsLoading(false);
  }, [walletAddress]);

  const mintAvatar = async (name: string): Promise<{ success: boolean; error?: string }> => {
    if (!walletAddress) {
      return { success: false, error: "No wallet connected" };
    }

    // Check if name is already taken
    if (isAvatarNameTaken(name)) {
      return { success: false, error: "This avatar name is already taken. Please choose a different name." };
    }
    
    setIsMinting(true);
    try {
      // Simulate on-chain minting (in production, this would call the actual smart contract)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAvatar: SeloraAvatar = {
        id: `avatar_${Date.now()}`,
        name,
        minted: true,
        mintedAt: new Date().toISOString(),
      };
      
      // Store avatar for this wallet
      localStorage.setItem(`selora_avatar_${walletAddress}`, JSON.stringify(newAvatar));
      
      // Add name to global index to prevent duplicates
      addAvatarToIndex(name);
      
      // Also update profile with the avatar name
      const profileKey = `selora_profile_${walletAddress}`;
      const existingProfile = localStorage.getItem(profileKey);
      const profile = existingProfile ? JSON.parse(existingProfile) : {};
      profile.displayName = name;
      localStorage.setItem(profileKey, JSON.stringify(profile));
      
      setAvatar(newAvatar);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to mint avatar. Please try again." };
    } finally {
      setIsMinting(false);
    }
  };

  return {
    avatar,
    isLoading,
    isMinting,
    mintAvatar,
    hasAvatar: !!avatar?.minted,
  };
}
