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
    <section className="py-24 px-6 md:px-12 lg:px-16 relative bg-background">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-foreground">
            How <span className="text-primary">Selora</span> Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A simple, secure process to take control of your health data
          </p>
        </div>

        <div className="space-y-12 md:space-y-20">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-8 md:gap-12 items-center`}
            >
              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-3 mb-4">
                  <span className="text-3xl font-heading font-bold text-primary/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-heading text-2xl md:text-3xl font-bold mb-4 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                  {step.description}
                </p>
              </div>

              {/* Illustration */}
              <div className="flex-1 flex justify-center">
                <div className="glass-card p-10 md:p-14 rounded-2xl transition-colors hover:border-primary/20">
                  <step.icon className="w-16 h-16 md:w-20 md:h-20 text-primary/80" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
