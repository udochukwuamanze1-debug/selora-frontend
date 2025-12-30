import { Heart, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardGreetingProps {
  userName?: string;
  healthScore?: number;
  previousScore?: number;
}

export function DashboardGreeting({ 
  userName = "Tunde", 
  healthScore = 85,
  previousScore = 82
}: DashboardGreetingProps) {
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "from-green-500/20 to-green-500/5";
    if (score >= 60) return "from-yellow-500/20 to-yellow-500/5";
    return "from-red-500/20 to-red-500/5";
  };

  const scoreDiff = healthScore - previousScore;
  const TrendIcon = scoreDiff > 0 ? TrendingUp : scoreDiff < 0 ? TrendingDown : Minus;
  const trendColor = scoreDiff > 0 ? "text-green-500" : scoreDiff < 0 ? "text-red-500" : "text-muted-foreground";

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Greeting */}
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-1">
            {getTimeGreeting()}, {userName} 👋
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your health overview
          </p>
        </div>

        {/* Health Score */}
        <div className={cn(
          "flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br",
          getScoreBgColor(healthScore)
        )}>
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-background/50 flex items-center justify-center">
              <Heart className={cn("w-8 h-8", getScoreColor(healthScore))} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
              <TrendIcon className={cn("w-4 h-4", trendColor)} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-bold", getScoreColor(healthScore))}>
                {healthScore}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Health Score</p>
            {scoreDiff !== 0 && (
              <p className={cn("text-xs", trendColor)}>
                {scoreDiff > 0 ? "+" : ""}{scoreDiff} from last week
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
