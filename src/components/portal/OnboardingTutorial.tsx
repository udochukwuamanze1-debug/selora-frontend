import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Home,
  Archive,
  Lock,
  Shield,
  Users,
  ArrowLeftRight,
  UserCheck,
  Pill,
  Bot,
  Settings,
  Wallet,
  Sun,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingTutorialProps {
  walletAddress: string;
  onComplete: () => void;
}

const tutorialSteps = [
  {
    title: "Welcome to Selora! 🎉",
    description: "Let's take a quick tour to help you get the most out of your health data platform.",
    icon: Sparkles,
    content: "Selora puts you in control of your health data. Everything is encrypted, stored on-chain, and accessible only by you.",
  },
  {
    title: "Your Dashboard",
    description: "The Home tab gives you an overview of your health portal.",
    icon: Home,
    content: "See recent activity, quick stats, and navigate to any feature from here. This is your command center.",
  },
  {
    title: "Health Archive",
    description: "Store and manage all your health records securely.",
    icon: Archive,
    content: "Upload medical records, test results, and documents. Everything is encrypted before leaving your device.",
  },
  {
    title: "Secure Vault",
    description: "Your personal encrypted storage for sensitive files.",
    icon: Lock,
    content: "Upload any file — images, documents, anything. Organize with categories. All stored encrypted on Walrus.",
  },
  {
    title: "Prescriptions",
    description: "View and manage your medications.",
    icon: Pill,
    content: "See all your prescriptions, refill history, and pay for medications using SUI tokens.",
  },
  {
    title: "Data Exchange",
    description: "Share anonymized data and earn rewards.",
    icon: ArrowLeftRight,
    content: "Contribute to research by sharing anonymized health data. You control what's shared and earn rewards.",
  },
  {
    title: "Health Guide",
    description: "Your AI-powered assistant.",
    icon: Bot,
    content: "Ask questions, get help navigating the app, and learn about features. Powered by Gemini 1.5.",
  },
  {
    title: "Profile & Preferences",
    description: "Customize your experience.",
    icon: Settings,
    content: "Change your profile picture, name, location settings, and switch between Light, Dim, and Dark themes.",
  },
  {
    title: "Your Wallet",
    description: "Find your wallet info easily.",
    icon: Wallet,
    content: "Your wallet address is in the sidebar and top bar. Your SUI balance is shown in the dark box next to it.",
  },
  {
    title: "Theme Settings",
    description: "Choose your preferred appearance.",
    icon: Sun,
    content: "Go to Profile & Preferences → Appearance to switch between Light, Dim, and Dark modes.",
  },
];

export const OnboardingTutorial = ({ walletAddress, onComplete }: OnboardingTutorialProps) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen the tutorial
    const hasSeenTutorial = localStorage.getItem(`selora_tutorial_${walletAddress}`);
    if (!hasSeenTutorial) {
      setOpen(true);
    }
  }, [walletAddress]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`selora_tutorial_${walletAddress}`, "true");
    setOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(`selora_tutorial_${walletAddress}`, "true");
    setOpen(false);
  };

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-card border-border/50 max-w-lg">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="font-heading text-2xl">{step.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <p className="text-center text-foreground leading-relaxed">
            {step.content}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentStep
                  ? "w-6 bg-primary"
                  : index < currentStep
                  ? "bg-primary/50"
                  : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Skip Tutorial
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrev}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === tutorialSteps.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Button to manually trigger the tutorial
export const TutorialButton = ({ onClick }: { onClick: () => void }) => (
  <Button variant="outline" size="sm" onClick={onClick} className="gap-2">
    <Sparkles className="w-4 h-4" />
    View Tutorial
  </Button>
);
