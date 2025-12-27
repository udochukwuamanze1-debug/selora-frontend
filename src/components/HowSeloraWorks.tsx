import { Wallet, Upload, Settings, User, Gift } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Connect Wallet / zkLogin",
    description: "Secure access to your health portal using your Sui wallet or zkLogin for a seamless experience.",
  },
  {
    icon: Upload,
    title: "Upload & Encrypt Records",
    description: "Your health records are encrypted client-side before being stored on decentralized Walrus storage.",
  },
  {
    icon: Settings,
    title: "Choose How Data is Used",
    description: "Full control over who can access your data. Grant or revoke permissions anytime.",
  },
  {
    icon: User,
    title: "Mint Selora Avatar",
    description: "Your on-chain identity for consent management and coordination across the platform.",
  },
  {
    icon: Gift,
    title: "Earn Rewards",
    description: "Stake your anonymized data for research and earn transparent rewards for contributions.",
  },
];

export const HowSeloraWorks = () => {
  return (
    <section className="py-24 px-4 relative bg-background">
      {/* Dark background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            How <span className="text-gradient">Selora</span> Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A simple, secure process to take control of your health data
          </p>
        </div>

        <div className="space-y-16 md:space-y-24">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-8 md:gap-16 items-center`}
            >
              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-3 mb-4">
                  <span className="text-4xl font-heading font-bold text-primary/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-heading text-2xl md:text-3xl font-bold mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                  {step.description}
                </p>
              </div>

              {/* Illustration */}
              <div className="flex-1 flex justify-center">
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Glass card with icon */}
                  <div className="glass-card p-12 md:p-16 rounded-3xl relative overflow-hidden group-hover:border-primary/30 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                    <step.icon className="w-20 h-20 md:w-24 md:h-24 text-primary relative z-10" />
                    
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 animate-pulse" />
                    <div className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-secondary/10 animate-pulse" style={{ animationDelay: "1s" }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
