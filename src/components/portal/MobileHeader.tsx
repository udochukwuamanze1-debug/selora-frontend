import { useState } from "react";
import { QrCode, Star } from "lucide-react";
import { WalletAddress } from "./WalletAddress";
import { WalletBalance } from "./WalletBalance";
import { NotificationBell } from "./NotificationBell";
import { Logo } from "@/components/Logo";
import { useWalrusNotifications } from "@/hooks/useWalrusNotifications";
import { useAvatar } from "@/hooks/useAvatar";
import { useXPRewards } from "@/hooks/useXPRewards";
import { useGreeting } from "./PortalHeader";
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

interface MobileHeaderProps {
  walletAddress: string;
  portalType?: string;
  showQR?: boolean;
  /** Override title — if not set and showGreeting is true, shows greeting */
  title?: string;
  subtitle?: string;
  showGreeting?: boolean;
}

export function MobileHeader({
  walletAddress,
  portalType = "Patient",
  showQR = true,
  title,
  subtitle,
  showGreeting = false,
}: MobileHeaderProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  const { notifications, markAsRead, markAllRead, remove } = useWalrusNotifications(walletAddress);
  const { avatar } = useAvatar(walletAddress);
  const { xp, level, xpProgress, xpToNextLevel } = useXPRewards();
  const { greeting } = useGreeting(walletAddress, avatar?.name);

  const displayTitle = showGreeting ? greeting : title;

  const formattedNotifications = notifications.map((n) => ({
    id: n.id,
    type: mapNotificationType(n.type),
    title: n.title,
    message: n.message,
    time: formatTime(n.timestamp),
    read: n.read,
  }));

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 md:hidden">
      {/* Top bar: Logo + icons */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <Logo size="sm" showText={true} />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium ml-11 -mt-1">
            {portalType}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {showQR && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowQRModal(true)}>
                    <QrCode className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share QR Code</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <NotificationBell
            notifications={formattedNotifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllRead}
            onRemove={remove}
          />
          <WalletBalance />
          <WalletAddress address={walletAddress} className="text-xs" />
        </div>
      </div>

      {/* Title / Greeting + subtitle */}
      {displayTitle && (
        <div className="mt-2">
          <h1 className="font-heading text-base sm:text-lg font-bold text-foreground truncate">
            {displayTitle}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{subtitle}</p>
          )}
        </div>
      )}

      {/* XP bar — only on home */}
      {showGreeting && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-[10px]">Lvl {level}</span>
          </div>
          <div className="flex-1 max-w-[100px]">
            <Progress value={xpProgress} className="h-1.5" />
          </div>
          <span className="text-[10px] text-muted-foreground">{xp} XP</span>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                Your Access QR Code
              </DialogTitle>
              <DialogDescription>Show this to your doctor to grant temporary access</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center py-6">
              <div className="p-4 bg-white rounded-xl">
                <QRCodeSVG
                  value={JSON.stringify({
                    type: "selora_access_request",
                    patientAddress: walletAddress,
                    recordId: "default_record",
                    timestamp: Date.now(),
                    nonce: Math.random().toString(36).slice(2, 11),
                  })}
                  size={200}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">QR code expires in 5 minutes</p>
              <Badge variant="outline" className="mt-2">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
              </Badge>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </header>
  );
}

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
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hr ago`;
  return `${Math.floor(diffMins / 1440)} days ago`;
}
