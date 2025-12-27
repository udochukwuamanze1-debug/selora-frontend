import { useState, useEffect } from 'react';

export interface SeloraAvatar {
  id: string;
  name: string;
  minted: boolean;
  mintedAt?: string;
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

  const mintAvatar = async (name: string) => {
    if (!walletAddress) return;
    
    setIsMinting(true);
    try {
      // In production, this would call the actual smart contract
      // For now, we simulate the minting process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAvatar: SeloraAvatar = {
        id: `avatar_${Date.now()}`,
        name,
        minted: true,
        mintedAt: new Date().toISOString(),
      };
      
      localStorage.setItem(`selora_avatar_${walletAddress}`, JSON.stringify(newAvatar));
      setAvatar(newAvatar);
      
      return newAvatar;
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
