import { useState, useMemo } from "react";
import { Heart, TrendingUp, TrendingDown, Minus, Sparkles, Star, Loader2, Gift, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIotaTransaction } from "@/hooks/useIotaTransaction";
import { AvatarMintModal } from "@/components/AvatarMintModal";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface DashboardGreetingProps {
  userName?: string;
  healthScore?: number;
  previousScore?: number;
  healthRecordsCount?: number;
  walletAddress?: string;
  xp?: number;
  level?: number;
  xpProgress?: number;
  xpToNextLevel?: number;
}

// Friendly name variations for users who haven't set a display name
const FRIENDLY_NAMES = [
  "Seloran",
  "champ",
  "friend",
  "health warrior",
  "wellness star",
  "care champion",
  "health hero",
  "wellness champ",
  "trailblazer",
  "pioneer",
];

// Standard greeting variations
const GREETING_PREFIXES = [
  { prefix: "Good", suffix: "" },
  { prefix: "A wonderful", suffix: " to you" },
  { prefix: "Hope you're having a great", suffix: "" },
  { prefix: "Lovely", suffix: "" },
  { prefix: "What a beautiful", suffix: "" },
];

// Holiday and festive greetings
interface HolidayGreeting {
  check: (date: Date) => boolean;
  greetings: string[];
  icon: "gift" | "party";
}

const HOLIDAY_GREETINGS: HolidayGreeting[] = [
  // New Year (Jan 1-3)
  {
    check: (date) => date.getMonth() === 0 && date.getDate() <= 3,
    greetings: [
      "Happy New Year",
      "Cheers to a healthy new year",
      "Here's to new beginnings",
      "Wishing you a prosperous year",
    ],
    icon: "party",
  },
  // Valentine's Day (Feb 14)
  {
    check: (date) => date.getMonth() === 1 && date.getDate() === 14,
    greetings: [
      "Happy Valentine's Day",
      "Spreading love and wellness",
      "Health is love",
    ],
    icon: "gift",
  },
  // St. Patrick's Day (Mar 17)
  {
    check: (date) => date.getMonth() === 2 && date.getDate() === 17,
    greetings: [
      "Happy St. Patrick's Day",
      "Luck of the Irish to you",
    ],
    icon: "party",
  },
  // Easter (approximate - late March/April, simplified check)
  {
    check: (date) => {
      const month = date.getMonth();
      const day = date.getDate();
      // Easter Sunday 2024: March 31, 2025: April 20, 2026: April 5
      return (month === 2 && day >= 28) || (month === 3 && day <= 25);
    },
    greetings: [
      "Happy Easter",
      "Hoppy Easter",
      "Spring blessings to you",
    ],
    icon: "gift",
  },
  // Independence Day (Jul 4)
  {
    check: (date) => date.getMonth() === 6 && date.getDate() === 4,
    greetings: [
      "Happy Independence Day",
      "Happy 4th of July",
      "Celebrating freedom",
    ],
    icon: "party",
  },
  // Halloween (Oct 31)
  {
    check: (date) => date.getMonth() === 9 && date.getDate() === 31,
    greetings: [
      "Happy Halloween",
      "Spooky greetings",
      "Stay healthy, stay spooky",
    ],
    icon: "party",
  },
  // Thanksgiving (4th Thursday of November - simplified)
  {
    check: (date) => date.getMonth() === 10 && date.getDate() >= 22 && date.getDate() <= 28,
    greetings: [
      "Happy Thanksgiving",
      "Grateful for your health",
      "Thankful for you",
    ],
    icon: "gift",
  },
  // Christmas Season (Dec 20-26)
  {
    check: (date) => date.getMonth() === 11 && date.getDate() >= 20 && date.getDate() <= 26,
    greetings: [
      "Merry Christmas",
      "Happy Holidays",
      "Season's greetings",
      "Wishing you a healthy holiday",
      "Joy to the world",
    ],
    icon: "gift",
  },
  // New Year's Eve (Dec 31)
  {
    check: (date) => date.getMonth() === 11 && date.getDate() === 31,
    greetings: [
      "Happy New Year's Eve",
      "Ready to ring in the new year",
      "Last day of the year",
    ],
    icon: "party",
  },
];

export function DashboardGreeting({ 
  userName,
  healthScore,
  previousScore,
  healthRecordsCount = 0,
  walletAddress,
  xp = 0,
  level = 1,
  xpProgress = 0,
  xpToNextLevel = 100,
}: DashboardGreetingProps) {
  const [showMintModal, setShowMintModal] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const { mintAvatar, isPending } = useIotaTransaction();

  const handleMintAvatar = async (name: string): Promise<{ success: boolean; error?: string }> => {
    setIsMinting(true);
    try {
      const result = await mintAvatar(name);
      if (result) {
        toast.success("Avatar minted successfully!", {
          description: `Your Selora Avatar "${name}" is now on-chain.`,
        });
        return { success: true };
      }
      return { success: false, error: "Minting failed" };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Minting failed" };
    } finally {
      setIsMinting(false);
    }
  };

  // Determine if user is new (no health records)
  const isNewUser = healthRecordsCount === 0;

  // Calculate display health score - neutral (50) for new users
  const displayScore = isNewUser ? 50 : (healthScore ?? 50);
  const displayPreviousScore = isNewUser ? 50 : (previousScore ?? displayScore);

  // Generate varied greeting with holiday support
  const { greeting, isHoliday, holidayIcon } = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    
    // Check for holiday
    const holiday = HOLIDAY_GREETINGS.find(h => h.check(now));
    
    // Use userName if provided, otherwise pick a friendly name based on wallet address or date
    let displayName: string;
    if (userName && userName.trim()) {
      displayName = userName;
    } else if (walletAddress) {
      // Use wallet address to get consistent random name
      const nameIndex = parseInt(walletAddress.slice(-4), 16) % FRIENDLY_NAMES.length;
      displayName = FRIENDLY_NAMES[nameIndex];
    } else {
      displayName = FRIENDLY_NAMES[now.getDay() % FRIENDLY_NAMES.length];
    }

    if (holiday) {
      // Holiday greeting
      const greetingIndex = now.getHours() % holiday.greetings.length;
      return {
        greeting: `${holiday.greetings[greetingIndex]}, ${displayName}!`,
        isHoliday: true,
        holidayIcon: holiday.icon,
      };
    }

    // Standard time-based greeting
    let timeOfDay: string;
    if (hour < 12) timeOfDay = "morning";
    else if (hour < 17) timeOfDay = "afternoon";
    else timeOfDay = "evening";

    // Pick a consistent random greeting based on the day and wallet
    const seedValue = walletAddress 
      ? parseInt(walletAddress.slice(-2), 16) + now.getDate()
      : now.getDate();
    const dayIndex = seedValue % GREETING_PREFIXES.length;
    const { prefix, suffix } = GREETING_PREFIXES[dayIndex];

    const greetingText = suffix 
      ? `${prefix} ${timeOfDay}${suffix}, ${displayName}!`
      : `${prefix} ${timeOfDay}, ${displayName}!`;

    return {
      greeting: greetingText,
      isHoliday: false,
      holidayIcon: null,
    };
  }, [userName, walletAddress]);

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

  return (
    <>
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Greeting */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isHoliday && holidayIcon === "gift" && (
                <Gift className="w-6 h-6 text-primary animate-pulse" />
              )}
              {isHoliday && holidayIcon === "party" && (
                <PartyPopper className="w-6 h-6 text-primary animate-pulse" />
              )}
              <h1 className="font-heading text-2xl md:text-3xl font-bold">
                {greeting}
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              {isNewUser 
                ? "Welcome to Selora! Upload your first health record to get started."
                : "Here's your health overview for today"
              }
            </p>

            {/* XP Progress */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-sm">Lvl {level}</span>
              </div>
              <div className="flex-1 max-w-40">
                <Progress value={xpProgress} className="h-2" />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {xp} XP • {xpToNextLevel} to next
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-row items-stretch sm:items-center gap-4">
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
            <div className="glass-card-hover p-4 rounded-2xl flex justify-center min-w-[140px] border border-primary/20">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mb-2 text-center">Mint Your Avatar</p>
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
