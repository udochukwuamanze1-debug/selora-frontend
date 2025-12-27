import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface HeroSectionProps {
  onConnectWallet: () => void;
}

export const HeroSection = ({ onConnectWallet }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-16 px-4 overflow-hidden bg-background">
      {/* Subtle dark cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      
      {/* Soft ambient glow - minimalistic */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="animate-fade-up">
          {/* Powered by Sui Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-8 text-sm text-muted-foreground">
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <circle cx="12" cy="12" r="10" fill="hsl(var(--primary))" />
              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">S</text>
            </svg>
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
            variant="default"
            size="xl"
            onClick={onConnectWallet}
            className="gap-3"
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </Button>

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
