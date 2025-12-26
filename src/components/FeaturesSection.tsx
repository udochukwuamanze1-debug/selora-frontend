import {
  Shield,
  Lock,
  Coins,
  Umbrella,
  Users,
  Database,
  Wallet,
  Fingerprint,
  FileText,
  Gift,
} from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "Self-Sovereign Health",
    description:
      "Your records live under your control — encrypted, permissioned, and revocable at any time.",
  },
  {
    icon: Shield,
    title: "Built for Real Care",
    description:
      "Selora connects patients, doctors, labs, insurers, and researchers without central gatekeepers.",
  },
  {
    icon: Lock,
    title: "Privacy by Design",
    description:
      "Every action is consent-driven. Access is logged. Nothing happens silently.",
  },
  {
    icon: Wallet,
    title: "Connect Wallet / zkLogin",
    description:
      "Secure access without sacrificing usability.",
  },
  {
    icon: Users,
    title: "Selora Avatar",
    description:
      "Your on-chain identity for consent and coordination.",
  },
  {
    icon: FileText,
    title: "Encrypted Health Records",
    description:
      "Stored off-chain, referenced on-chain, owned by you.",
  },
  {
    icon: Gift,
    title: "Data Staking & Rewards",
    description:
      "Choose how your data contributes — and earn transparently.",
  },
  {
    icon: Umbrella,
    title: "Micro-Insurance Access",
    description:
      "Participate in coverage pools without surrendering control.",
  },
  {
    icon: Database,
    title: "Emergency Guardians",
    description:
      "Grant access when it matters most.",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            Everything you need for{" "}
            <span className="text-gradient">health sovereignty</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete platform designed around privacy, consent, and your control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card-hover p-6 group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
