import { motion, useReducedMotion } from "framer-motion";
import {
  Lock,
  Shield,
  Database,
  Coins,
  Smartphone,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Self-Sovereign Health Data",
    description: "Own your medical records as NFTs. No intermediaries, no data breaches.",
  },
  {
    icon: Shield,
    title: "Military-Grade Encryption",
    description: "AES-256 encryption ensures only you control access to your health data.",
  },
  {
    icon: Database,
    title: "Decentralized Storage",
    description: "Records stored on Walrus network - censorship-resistant and always available.",
  },
  {
    icon: Coins,
    title: "Earn From Your Data",
    description: "Monetize anonymized health data for research while maintaining privacy.",
  },
  {
    icon: Smartphone,
    title: "Wearable Integration",
    description: "Sync Apple Health, Google Fit data automatically to your profile.",
  },
  {
    icon: Users,
    title: "Care Network",
    description: "Grant temporary access to doctors with granular permissions.",
  },
];

export const FeaturesSection = () => {
  const reducedMotion = useReducedMotion();

  return (
    <section className="py-24 px-4 relative overflow-hidden bg-muted/50">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Why <span className="text-primary">Selora</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A new paradigm for health data ownership and privacy
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative"
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};