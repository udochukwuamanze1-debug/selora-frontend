import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, X, Share, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, showIOSInstructions, installApp } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const hasDismissed = localStorage.getItem("selora_pwa_dismissed");
    if (hasDismissed) {
      setDismissed(true);
      return;
    }

    // Show banner after 5 seconds if installable or iOS
    const timer = setTimeout(() => {
      if ((isInstallable || showIOSInstructions) && !isInstalled) {
        setShowBanner(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isInstallable, showIOSInstructions, isInstalled]);

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("selora_pwa_dismissed", "true");
  };

  const handleInstall = async () => {
    const installed = await installApp();
    if (installed) {
      setShowBanner(false);
    }
  };

  if (isInstalled || dismissed || !showBanner) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50",
        "bg-card border border-border rounded-2xl shadow-2xl p-4",
        "animate-in slide-in-from-bottom-4 duration-300"
      )}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">Install Selora App</h3>
          {isIOS ? (
            <p className="text-xs text-muted-foreground mb-3">
              Tap <Share className="w-3 h-3 inline mx-0.5" /> then "Add to Home Screen" <Plus className="w-3 h-3 inline mx-0.5" /> for quick access
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mb-3">
              Get instant access to your health data right from your home screen
            </p>
          )}
          
          {!isIOS && (
            <Button size="sm" onClick={handleInstall} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Install Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
