import { motion, useReducedMotion } from "framer-motion";
import { IotaLogo } from "@/components/IotaLogo";
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
    description: "Built on IOTA's object-centric security model",
  },
  {
    icon: Layers,
    label: "Composable",
    description: "Modular architecture for endless possibilities",
  },
  {
    icon: Database,
    label: "IPFS Storage",
    description: "Decentralized blob storage for encrypted records",
  },
];

export const BuiltOnIota = () => {
  const reducedMotion = useReducedMotion();

  return (
    <section className="py-24 px-6 md:px-12 lg:px-16 relative bg-background">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/3 rounded-full blur-[120px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* IOTA Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-8">
            <IotaLogo size={48} />
          </div>

          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Built on <span className="text-primary">IOTA</span>
          </h2>

          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Selora is powered by the IOTA ecosystem — fast, secure, and designed for composable ownership.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              className="group"
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
