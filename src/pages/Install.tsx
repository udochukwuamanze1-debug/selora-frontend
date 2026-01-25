import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, Share, Plus, Smartphone, CheckCircle2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const navigate = useNavigate();
  const { isInstallable, isInstalled, isIOS, installApp } = usePWAInstall();

  const handleInstall = async () => {
    await installApp();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-6" />
          <h1 className="text-3xl font-heading font-bold mb-3">Install Selora</h1>
          <p className="text-muted-foreground">
            Add Selora to your home screen for quick, app-like access to your health data.
          </p>
        </div>

        {isInstalled ? (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Already Installed!</h2>
            <p className="text-muted-foreground">
              Selora is already installed on your device. Look for it on your home screen.
            </p>
          </div>
        ) : isIOS ? (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                How to Install on iPhone/iPad
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Tap the Share button</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      Look for <Share className="w-4 h-4" /> at the bottom of Safari
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Scroll down and tap "Add to Home Screen"</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      Look for <Plus className="w-4 h-4" /> Add to Home Screen
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Tap "Add" to confirm</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Selora will appear on your home screen
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              {isInstallable ? (
                <>
                  <Download className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Ready to Install</h2>
                  <p className="text-muted-foreground mb-6">
                    Click the button below to add Selora to your device
                  </p>
                  <Button size="lg" onClick={handleInstall} className="w-full max-w-xs">
                    <Download className="w-5 h-5 mr-2" />
                    Install Selora
                  </Button>
                </>
              ) : (
                <>
                  <Smartphone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Desktop Browser</h2>
                  <p className="text-muted-foreground">
                    Look for the install icon in your browser's address bar, or open this page on your mobile device to install.
                  </p>
                </>
              )}
            </div>

            <div className="bg-muted/30 rounded-2xl p-6">
              <h3 className="font-semibold mb-3">Why Install Selora?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Quick access from your home screen
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Works offline for viewing stored data
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Faster loading and native app feel
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  No app store download required
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Install;
