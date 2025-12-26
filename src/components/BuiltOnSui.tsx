import { Zap, Shield, Layers } from "lucide-react";

export const BuiltOnSui = () => {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8 md:p-12 rounded-3xl text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            {/* Sui Logo Placeholder */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-6">
              <svg viewBox="0 0 32 32" className="w-10 h-10">
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

            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Built on <span className="text-gradient">Sui</span>
            </h2>

            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Selora is powered by the Sui ecosystem — fast, secure, and designed for composable ownership.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">Fast</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Shield className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-muted-foreground">Secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Layers className="w-4 h-4 text-accent" />
                </div>
                <span className="text-muted-foreground">Composable</span>
              </div>
            </div>

            {/* Walrus mention */}
            <div className="mt-8 pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Decentralized storage powered by{" "}
                <span className="font-semibold text-foreground">Walrus</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
