import { Button } from "@/components/ui/button";
import { Wallet, Shield, Lock, Heart } from "lucide-react";

interface HeroSectionProps {
  onConnectWallet: () => void;
}

export const HeroSection = ({ onConnectWallet }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      {/* Floating Icons */}
      <div className="absolute top-32 left-[15%] glass-card p-4 rounded-2xl animate-float opacity-60" style={{ animationDelay: "-1s" }}>
        <Shield className="w-8 h-8 text-primary" />
      </div>
      <div className="absolute top-48 right-[20%] glass-card p-4 rounded-2xl animate-float opacity-60" style={{ animationDelay: "-2s" }}>
        <Lock className="w-8 h-8 text-secondary" />
      </div>
      <div className="absolute bottom-32 left-[25%] glass-card p-4 rounded-2xl animate-float opacity-60" style={{ animationDelay: "-4s" }}>
        <Heart className="w-8 h-8 text-accent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Main Content Card */}
        <div className="glass-card p-8 md:p-12 rounded-3xl animate-fade-up">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            Your health,{" "}
            <span className="text-gradient">owned by you.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Selora is a decentralized health platform built on Sui — designed for privacy, consent, and human dignity.
          </p>

          <Button
            variant="hero"
            size="xl"
            onClick={onConnectWallet}
            className="gap-3 mb-8"
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </Button>

          {/* Trust Statement */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              No ads
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              No data brokers
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              No silent sharing
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
