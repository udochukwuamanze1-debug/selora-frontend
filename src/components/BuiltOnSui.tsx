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
    <section className="py-24 px-6 md:px-12 lg:px-16 relative bg-background">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/3 rounded-full blur-[120px]" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          {/* Sui Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-8">
            <svg viewBox="0 0 32 32" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.5 12.5C22.5 10.0147 20.4853 8 18 8C16.6193 8 15.3807 8.55863 14.5 9.46447L14.5 9.46447C13.6193 8.55863 12.3807 8 11 8C8.51472 8 6.5 10.0147 6.5 12.5C6.5 13.5609 6.86656 14.5329 7.48259 15.3077L14.5 23L21.5174 15.3077C22.1334 14.5329 22.5 13.5609 22.5 12.5Z" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14.5" cy="16" r="12" stroke="hsl(var(--primary))" strokeWidth="2.5"/>
              <path d="M14.5 6.5V8.5M14.5 23.5V25.5M6 16H8M21 16H23M8.5 10L10 11.5M19 20.5L20.5 22M8.5 22L10 20.5M19 11.5L20.5 10" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Built on <span className="text-primary">Sui</span>
          </h2>

          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Selora is powered by the Sui ecosystem — fast, secure, and designed for composable ownership.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="group"
            >
              <div className="glass-card p-6 text-center transition-all duration-300 hover:border-primary/20 h-full">
                <div className="inline-flex p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
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
