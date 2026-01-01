import { useState, useMemo } from "react";
import { Heart, TrendingUp, TrendingDown, Minus, Sparkles, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSuiTransaction } from "@/hooks/useSuiTransaction";
import { AvatarMintModal } from "@/components/AvatarMintModal";
import { toast } from "sonner";

interface DashboardGreetingProps {
  userName?: string;
  healthScore?: number;
  previousScore?: number;
  healthRecordsCount?: number;
  walletAddress?: string;
  xp?: number;
}

// Friendly name variations for users who haven't set a display name
const FRIENDLY_NAMES = [
  "Seloran",
  "champ",
  "friend",
  "health warrior",
  "wellness star",
  "care champion",
];

// Greeting variations
const GREETING_PREFIXES = [
  { prefix: "Good", suffix: "" },
  { prefix: "A wonderful", suffix: " to you" },
  { prefix: "Hope you're having a great", suffix: "" },
  { prefix: "Lovely", suffix: "" },
];

export function DashboardGreeting({ 
  userName,
  healthScore,
  previousScore,
  healthRecordsCount = 0,
  walletAddress,
  xp = 0,
}: DashboardGreetingProps) {
  const [showMintModal, setShowMintModal] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const { mintAvatar, isPending } = useSuiTransaction();

  const handleMintAvatar = async (name: string) => {
    setIsMinting(true);
    try {
      const result = await mintAvatar(name);
      if (result) {
        toast.success("Avatar minted successfully!", {
          description: `Your Selora Avatar "${name}" is now on-chain.`,
        });
      }
    } finally {
      setIsMinting(false);
    }
  };

  // Determine if user is new (no health records)
  const isNewUser = healthRecordsCount === 0;

  // Calculate display health score - neutral (50) for new users
  const displayScore = isNewUser ? 50 : (healthScore ?? 50);
  const displayPreviousScore = isNewUser ? 50 : (previousScore ?? displayScore);

  // Generate varied greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    let timeOfDay: string;
    if (hour < 12) timeOfDay = "morning";
    else if (hour < 17) timeOfDay = "afternoon";
    else timeOfDay = "evening";

    // Pick a consistent random greeting based on the day
    const dayIndex = new Date().getDate() % GREETING_PREFIXES.length;
    const { prefix, suffix } = GREETING_PREFIXES[dayIndex];

    // Use userName if provided, otherwise pick a friendly name
    const displayName = userName || FRIENDLY_NAMES[new Date().getDay() % FRIENDLY_NAMES.length];

    if (suffix) {
      return `${prefix} ${timeOfDay}${suffix}, ${displayName}!`;
    }
    return `${prefix} ${timeOfDay}, ${displayName}!`;
  }, [userName]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-400";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "from-green-500/20 to-green-500/5";
    if (score >= 60) return "from-yellow-500/20 to-yellow-500/5";
    if (score >= 40) return "from-orange-400/20 to-orange-400/5";
    return "from-red-500/20 to-red-500/5";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Neutral";
    return "Needs Attention";
  };

  const scoreDiff = displayScore - displayPreviousScore;
  const TrendIcon = scoreDiff > 0 ? TrendingUp : scoreDiff < 0 ? TrendingDown : Minus;
  const trendColor = scoreDiff > 0 ? "text-green-500" : scoreDiff < 0 ? "text-red-500" : "text-muted-foreground";

  // Calculate XP level
  const level = Math.floor(xp / 100) + 1;
  const xpProgress = xp % 100;

  return (
    <>
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Greeting */}
          <div className="flex-1">
            <h1 className="font-heading text-2xl md:text-3xl font-bold mb-1">
              {greeting}
            </h1>
            <p className="text-muted-foreground">
              {isNewUser 
                ? "Welcome to Selora! Upload your first health record to get started."
                : "Here's your health overview for today"
              }
            </p>

            {/* XP Progress */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">Level {level}</span>
              </div>
              <div className="flex-1 max-w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{xp} XP</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Health Score Card */}
            <div className={cn(
              "flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br min-w-fit",
              getScoreBgColor(displayScore)
            )}>
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-background/50 flex items-center justify-center">
                  <Heart className={cn("w-8 h-8", getScoreColor(displayScore))} />
                </div>
                {!isNewUser && (
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                    <TrendIcon className={cn("w-4 h-4", trendColor)} />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-3xl font-bold", getScoreColor(displayScore))}>
                    {displayScore}
                  </span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                <p className={cn("text-xs", isNewUser ? "text-muted-foreground" : trendColor)}>
                  {isNewUser ? getScoreLabel(displayScore) : (
                    scoreDiff !== 0 
                      ? `${scoreDiff > 0 ? "+" : ""}${scoreDiff} from last week`
                      : "No change"
                  )}
                </p>
              </div>
            </div>
  
            {/* Avatar Mint Box */}
            <div className="glass-card-hover p-4 rounded-2xl flex gap-4 items-center justify-center min-w-[140px] border border-primary/20">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mb-2">Mint Your Avatar</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowMintModal(true)}
                disabled={isPending}
                className="text-xs gap-1"
              >
                {isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                Mint NFT
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Mint Modal */}
      <AvatarMintModal 
        isOpen={showMintModal} 
        onClose={() => setShowMintModal(false)}
        onMint={handleMintAvatar}
        isMinting={isMinting || isPending}
      />
    </>
  );
}
