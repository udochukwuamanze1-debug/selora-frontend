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
    <section className="py-24 px-4 relative overflow-hidden bg-muted">
      {/* Light background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted via-muted to-muted" />

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
              className="group relative cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Neon glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="glass-card p-6 relative overflow-hidden transition-all duration-300 group-hover:border-primary/40 group-hover:scale-[1.02]">
                {/* Subtle neon border glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                  style={{
                    boxShadow: 'inset 0 0 20px hsl(var(--primary) / 0.1)'
                  }}
                />
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors shrink-0">
                    <feature.icon className="w-6 h-6 text-primary group-hover:text-primary transition-colors" />
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
