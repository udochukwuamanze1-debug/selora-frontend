import {
  Fingerprint,
  Lock,
  Coins,
  Umbrella,
  AlertCircle,
  FlaskConical,
} from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "Self-Sovereign Identity",
    description: "Your records live under your control — encrypted, permissioned, and revocable at any time.",
  },
  {
    icon: Lock,
    title: "Encrypted Records",
    description: "All health data is encrypted client-side before storage. Only you hold the keys.",
  },
  {
    icon: Coins,
    title: "Ethical Data Monetization",
    description: "Choose to stake your anonymized data and earn transparent rewards for research contributions.",
  },
  {
    icon: Umbrella,
    title: "Micro-Insurance",
    description: "Participate in decentralized coverage pools without surrendering control of your data.",
  },
  {
    icon: AlertCircle,
    title: "Emergency Access",
    description: "Designate trusted guardians who can access your records in emergencies.",
  },
  {
    icon: FlaskConical,
    title: "Research Participation",
    description: "Contribute to medical research on your terms with full consent management.",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-muted/50">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Everything you need for{" "}
            <span className="text-primary">health sovereignty</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete platform designed around privacy, consent, and your control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="glass-card p-6 relative overflow-hidden transition-all duration-300 hover:border-primary/20 hover:bg-card/80 h-full">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
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
