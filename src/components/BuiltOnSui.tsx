import { Zap, Shield, Layers, Database } from "lucide-react";

const features = [
  {
    icon: Zap,
    label: "Fast",
    description: "Sub-second finality for seamless interactions",
  },
  {
    icon: Shield,
    label: "Secure",
    description: "Built on Sui's object-centric security model",
  },
  {
    icon: Layers,
    label: "Composable",
    description: "Modular architecture for endless possibilities",
  },
  {
    icon: Database,
    label: "Walrus Storage",
    description: "Decentralized blob storage for encrypted records",
  },
];

export const BuiltOnSui = () => {
  return (
    <section className="py-24 px-4 relative bg-background">
      {/* Dark background with subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          {/* Sui Logo */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-8 relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <svg viewBox="0 0 32 32" className="w-12 h-12 relative z-10">
              <defs>
                <linearGradient id="sui-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(227, 100%, 69%)" />
                  <stop offset="100%" stopColor="hsl(32, 100%, 75%)" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="14" fill="url(#sui-gradient)" />
              <text x="16" y="21" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Bricolage Grotesque, sans-serif">
                S
              </text>
            </svg>
          </div>

          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
            Built on <span className="text-gradient">Sui</span>
          </h2>

          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Selora is powered by the Sui ecosystem — fast, secure, and designed for composable ownership.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.label}
              className="group relative cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Neon glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="glass-card p-6 text-center relative overflow-hidden transition-all duration-300 group-hover:border-primary/40 group-hover:scale-[1.02] h-full">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {feature.label}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
