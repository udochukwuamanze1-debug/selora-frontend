import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { UserCountDisplay } from "@/components/UserCountDisplay";

interface HeroSectionProps {
  onConnectWallet: () => void;
}

export const HeroSection = ({ onConnectWallet }: HeroSectionProps) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Get user count from localStorage (simulating on-chain user count)
    const storedCount = localStorage.getItem("selora_user_count");
    if (storedCount) {
      setUserCount(parseInt(storedCount, 10));
    } else {
      // Initialize with a starting count
      const initialCount = 47; // Starting users
      localStorage.setItem("selora_user_count", initialCount.toString());
      setUserCount(initialCount);
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-16 px-4 overflow-hidden bg-background">
      {/* Subtle dark cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      
      {/* Grid pattern - more visible in light mode */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Animated particles/stars - bigger and visible in both modes */}
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-[3px] h-[3px] bg-primary/40 dark:bg-primary/30 rounded-full animate-pulse"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
      
      {/* Glassy diagonal primary glow - top-left */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] opacity-60" />
      
      {/* Glassy diagonal primary glow - bottom-right */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] opacity-60" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="animate-fade-up">
          {/* Powered by Sui Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-8 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>Powered by Sui</span>
          </div>

          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-foreground">
            Your health. Your data.{" "}
            <span className="text-primary">Your terms.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Selora is a decentralized health platform built on Sui — private, secure, and human-centered.
          </p>

          <Button
            variant="hero"
            size="xl"
            onClick={() => setAuthModalOpen(true)}
            className="gap-3 group"
          >
            Get Started
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>

          {/* User count display */}
          <div className="flex justify-center">
            <UserCountDisplay count={userCount} />
          </div>

          <AuthModal
            open={authModalOpen}
            onOpenChange={setAuthModalOpen}
            onSuccess={onConnectWallet}
          />

          {/* Trust Statement - calm and minimal */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              No ads
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              No data brokers
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              No silent sharing
            </span>
          </div>
        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-muted/50 to-transparent" />
    </section>
  );
};
