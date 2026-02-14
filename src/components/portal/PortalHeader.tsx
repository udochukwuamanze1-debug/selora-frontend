import { useState, useMemo } from "react";
import { QrCode, Gift, PartyPopper, Star } from "lucide-react";
import { PortalSearch } from "./PortalSearch";
import { NotificationBell, Notification } from "./NotificationBell";
import { WalletAddress } from "./WalletAddress";
import { WalletBalance } from "./WalletBalance";
import { useWalrusNotifications } from "@/hooks/useWalrusNotifications";
import { useAvatar } from "@/hooks/useAvatar";
import { useXPRewards } from "@/hooks/useXPRewards";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Greeting logic
const FRIENDLY_NAMES = [
  "Seloran", "champ", "friend", "health warrior", "wellness star",
  "care champion", "health hero", "wellness champ", "trailblazer", "pioneer",
];

const GREETING_PREFIXES = [
  { prefix: "Good", suffix: "" },
  { prefix: "A wonderful", suffix: " to you" },
  { prefix: "Hope you're having a great", suffix: "" },
  { prefix: "Lovely", suffix: "" },
  { prefix: "What a beautiful", suffix: "" },
];

interface HolidayGreeting {
  check: (date: Date) => boolean;
  greetings: string[];
  icon: "gift" | "party";
}

const HOLIDAY_GREETINGS: HolidayGreeting[] = [
  { check: (d) => d.getMonth() === 0 && d.getDate() <= 3, greetings: ["Happy New Year", "Cheers to a healthy new year"], icon: "party" },
  { check: (d) => d.getMonth() === 1 && d.getDate() === 14, greetings: ["Happy Valentine's Day", "Spreading love and wellness"], icon: "gift" },
  { check: (d) => d.getMonth() === 11 && d.getDate() >= 20 && d.getDate() <= 26, greetings: ["Merry Christmas", "Happy Holidays", "Season's greetings"], icon: "gift" },
  { check: (d) => d.getMonth() === 11 && d.getDate() === 31, greetings: ["Happy New Year's Eve"], icon: "party" },
];

export function useGreeting(walletAddress: string, userName?: string) {
  return useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const holiday = HOLIDAY_GREETINGS.find(h => h.check(now));

    let displayName: string;
    if (userName?.trim()) {
      displayName = userName;
    } else if (walletAddress) {
      const nameIndex = parseInt(walletAddress.slice(-4), 16) % FRIENDLY_NAMES.length;
      displayName = FRIENDLY_NAMES[nameIndex];
    } else {
      displayName = FRIENDLY_NAMES[now.getDay() % FRIENDLY_NAMES.length];
    }

    if (holiday) {
      const gi = now.getHours() % holiday.greetings.length;
      return { greeting: `${holiday.greetings[gi]}, ${displayName}!`, isHoliday: true, holidayIcon: holiday.icon };
    }

    let timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    const seed = walletAddress ? parseInt(walletAddress.slice(-2), 16) + now.getDate() : now.getDate();
    const { prefix, suffix } = GREETING_PREFIXES[seed % GREETING_PREFIXES.length];
    const text = suffix ? `${prefix} ${timeOfDay}${suffix}, ${displayName}!` : `${prefix} ${timeOfDay}, ${displayName}!`;

    return { greeting: text, isHoliday: false, holidayIcon: null };
  }, [userName, walletAddress]);
}

export interface PortalAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "glass";
}

interface PortalHeaderProps {
  walletAddress: string;
  onSearch?: (query: string) => void;
  /** Page title — defaults to greeting on "home" */
  title?: string;
  subtitle?: string;
  actions?: PortalAction[];
  showQR?: boolean;
  /** When true, show the greeting instead of title */
  showGreeting?: boolean;
}

export const PortalHeader = ({
  walletAddress,
  onSearch,
  title,
  subtitle,
  actions = [],
  showQR = true,
  showGreeting = false,
}: PortalHeaderProps) => {
  const { notifications: walrusNotifications, markAsRead, markAllRead, remove } =
    useWalrusNotifications(walletAddress);
  const { avatar } = useAvatar(walletAddress);
  const { xp, level, xpProgress, xpToNextLevel } = useXPRewards();
  const { greeting, isHoliday, holidayIcon } = useGreeting(walletAddress, avatar?.name);
  const [showQRModal, setShowQRModal] = useState(false);

  const notifications: Notification[] = walrusNotifications.map(n => ({
    id: n.id,
    type: mapNotificationType(n.type),
    title: n.title,
    message: n.message,
    time: formatTime(n.timestamp),
    read: n.read,
  }));

  const displayTitle = showGreeting ? greeting : title;

  const qrData = JSON.stringify({
    type: "selora_access_request",
    patientAddress: walletAddress,
    recordId: "default_record",
    timestamp: Date.now(),
    nonce: Math.random().toString(36).slice(2, 11),
  });

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col gap-3 md:gap-4">
        {/* Row 1: Title + Wallet info */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          {/* Title / Greeting */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {showGreeting && isHoliday && holidayIcon === "gift" && <Gift className="w-5 h-5 text-primary animate-pulse shrink-0" />}
              {showGreeting && isHoliday && holidayIcon === "party" && <PartyPopper className="w-5 h-5 text-primary animate-pulse shrink-0" />}
              <h1 className="font-heading text-lg sm:text-2xl md:text-3xl font-bold text-foreground">
                {displayTitle}
              </h1>
            </div>
            {subtitle && (
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">{subtitle}</p>
            )}

            {/* XP Progress Bar — only on home/greeting */}
            {showGreeting && (
              <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-xs sm:text-sm">Lvl {level}</span>
                </div>
                <div className="flex-1 min-w-[80px] max-w-[120px] sm:max-w-40">
                  <Progress value={xpProgress} className="h-1.5 sm:h-2" />
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                  {xp} XP • {xpToNextLevel} to next
                </span>
              </div>
            )}
          </div>

          {/* Wallet + Notifications */}
          <div className="flex items-center gap-2 shrink-0">
            {showQR && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-lg"
                      onClick={() => setShowQRModal(true)}
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share QR Code</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <NotificationBell
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllRead}
              onRemove={remove}
            />
            <WalletBalance />
            <WalletAddress address={walletAddress} />
          </div>
        </div>

        {/* Row 2: Search + Action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {onSearch && (
            <PortalSearch
              placeholder="Search..."
              onSearch={onSearch}
              className="w-full sm:w-64 md:w-72"
            />
          )}
          {actions.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              {actions.map((action, i) => (
                <Button
                  key={i}
                  variant={action.variant === "glass" ? "outline" : "default"}
                  size="sm"
                  onClick={action.onClick}
                  className="gap-1.5 text-xs sm:text-sm"
                >
                  <action.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{action.label}</span>
                  <span className="sm:hidden">{action.label.split(" ")[0]}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Your Access QR Code
            </DialogTitle>
            <DialogDescription>
              Show this to your doctor to grant temporary access
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="p-4 bg-white rounded-xl">
              <QRCodeSVG value={qrData} size={200} level="H" includeMargin bgColor="#ffffff" fgColor="#000000" />
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">QR code expires in 5 minutes</p>
            <Badge variant="outline" className="mt-2">
              {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </Badge>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function mapNotificationType(type: string): "prescription" | "access" | "alert" | "info" | "welcome" {
  switch (type) {
    case "visit_report": return "info";
    case "prescription": return "prescription";
    case "access_request":
    case "access_granted": return "access";
    default: return "info";
  }
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(timestamp).toLocaleDateString();
}
