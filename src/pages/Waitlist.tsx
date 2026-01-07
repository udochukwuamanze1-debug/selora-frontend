import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/providers/ThemeProvider";
import { motion, useReducedMotion } from "framer-motion";
import {
  Shield,
  Database,
  Lock,
  Coins,
  Smartphone,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ArrowRight,
  Twitter,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WaitlistCTA } from "@/components/WaitlistCTA";

import patientPortalDark from "@/assets/patient-portal-dark.png";
import patientPortalLight from "@/assets/patient-portal-light.png";

const features = [
  {
    icon: Lock,
    title: "Self-Sovereign Health Data",
    description: "Own your medical records as NFTs. No intermediaries, no data breaches."
  },
  {
    icon: Shield,
    title: "Military-Grade Encryption",
    description: "AES-256 encryption ensures only you control access to your health data."
  },
  {
    icon: Database,
    title: "Decentralized Storage",
    description: "Records stored on IPFS decentralized storage network - censorship-resistant and always available."
  },
  {
    icon: Coins,
    title: "Earn From Your Data",
    description: "Monetize anonymized health data for research while maintaining privacy."
  },
  {
    icon: Smartphone,
    title: "Wearable Integration",
    description: "Sync Apple Health, Google Fit data automatically to your profile."
  },
  {
    icon: Users,
    title: "Care Network",
    description: "Grant temporary access to doctors with granular permissions."
  }
];

const faqs = [
  {
    question: "What is Selora?",
    answer: "Selora is a decentralized health records platform built on the IOTA blockchain. It gives you complete ownership and control over your medical data, allowing you to securely share it with healthcare providers and even earn from anonymized research contributions."
  },
  {
    question: "How does Selora protect my data?",
    answer: "Your health records are encrypted with AES-256 encryption before being stored on the IPFS decentralized storage network. Only you hold the keys to decrypt your data, and you control exactly who can access it and for how long."
  },
  {
    question: "Do I need cryptocurrency to use Selora?",
    answer: "While Selora is built on the IOTA blockchain, we've made it easy for everyone to use. You'll need a small amount of IOTA tokens for transactions, but our onboarding process helps you get started even if you're new to crypto."
  },
  {
    question: "Can doctors really send me prescriptions directly?",
    answer: "Yes! Doctors using Selora can mint prescriptions and visit reports as NFTs that are automatically sent to your wallet. You'll receive instant notifications and can access your records immediately."
  },
  {
    question: "When will Selora launch?",
    answer: "We're currently in development and testing on IOTA Devnet. Join our waitlist to be among the first to access Selora when we launch on mainnet!"
  }
];

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const timestamp = Date.now().toString(36).slice(-3).toUpperCase();
  let random = "";
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SEL${timestamp}${random}`;
}

export default function Waitlist() {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("r") || undefined;
  
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ email: string; referralCode: string; referralCount: number } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();
  const reducedMotion = useReducedMotion();

  const sectionVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 18 },
      visible: { opacity: 1, y: 0 },
    }),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newReferralCode = generateReferralCode();

      const { data, error } = await supabase
        .from("waitlist")
        .insert({
          email,
          referral_code: newReferralCode,
          referred_by: referralCode || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // Duplicate email - fetch existing with referral count
          const { data: existing } = await supabase
            .from("waitlist")
            .select("referral_code, referral_count")
            .eq("email", email)
            .single();

          if (existing) {
            setSuccessData({ email, referralCode: existing.referral_code, referralCount: existing.referral_count || 0 });
          }
        } else {
          throw error;
        }
      } else if (data) {
        if (referralCode) {
          try {
            await (supabase.rpc as any)("increment_referral_count", { ref_code: referralCode });
          } catch {
            // Ignore
          }
        }
        setSuccessData({ email, referralCode: data.referral_code, referralCount: 0 });
      }
    } catch (error) {
      console.error("Waitlist error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReferralLink = async () => {
    if (!successData) return;
    const link = `${window.location.origin}/waitlist?r=${successData.referralCode}`;
    await navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  };

  const closeSuccess = () => {
    setSuccessData(null);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
        
        {/* Glassy diagonal primary glow - top-left */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] opacity-60" />
        
        {/* Glassy diagonal primary glow - bottom-right */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] opacity-60" />
        
        {/* Grid pattern - more visible in light mode */}
        <div 
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Animated particles/stars - bigger and visible in both modes */}
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-[3px] h-[3px] bg-primary/40 dark:bg-primary/30 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card px-6 py-4 flex items-center justify-between">
            <Link to="/">
              <Logo />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        className="relative pt-32 pb-20 px-4"
        initial={reducedMotion ? false : "hidden"}
        whileInView={reducedMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.25 }}
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-sm text-primary mb-8 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Launching Soon on IOTA Mainnet
          </div>

          <h1
            className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            Own Your Health.
            <br />
            <span className="text-primary">Control Your Future.</span>
          </h1>

          <p
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            The first decentralized health records platform where you own your data,
            control access, and earn from research contributions.
          </p>

          {/* Email Signup */}
          {!successData ? (
            <form
              onSubmit={handleSubmit}
              className="max-w-md mx-auto animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 bg-background/50 border-border/50 text-foreground"
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="gap-2 h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Joining..."
                  ) : (
                    <>
                      Join Waitlist
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Be the first to know when we launch. No spam, ever.
              </p>
            </form>
          ) : (
            <div className="max-w-md mx-auto animate-fade-up glass-card p-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">You're on the list!</h3>
              <p className="text-muted-foreground mb-4">
                Share your referral link to move up the priority list:
              </p>
              
              {/* Referral Stats */}
              <div className="glass-effect rounded-lg p-4 mb-4 text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {successData.referralCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  {successData.referralCount === 1 ? "person" : "people"} signed up with your link
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-2 rounded-lg bg-muted text-foreground font-mono text-sm truncate">
                    {window.location.origin}/waitlist?r={successData.referralCode}
                  </code>
                </div>
                <Button className="w-full gap-2" onClick={copyReferralLink}>
                  Copy Referral Link
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Your unique code: <span className="font-mono font-semibold">{successData.referralCode}</span>
              </p>
            </div>
          )}

          {/* Portal Preview Image - Hidden on mobile */}
          <div className="mt-16 animate-fade-up hidden md:block" style={{ animationDelay: "0.4s" }}>
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-xl" />
              <div className="relative glass-card p-2 rounded-2xl overflow-hidden">
                <img
                  src={resolvedTheme === "dark" ? patientPortalDark : patientPortalLight}
                  alt="Selora Patient Portal Preview"
                  className="w-full rounded-xl border border-border/50"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-20 px-4 relative"
        initial={reducedMotion ? false : "hidden"}
        whileInView={reducedMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Why <span className="text-primary">Selora</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A new paradigm for health data ownership and privacy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="glass-card p-6 group hover:border-primary/30 transition-all"
                  initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
                >
                  <div className="p-3 rounded-xl bg-primary/5 inline-block mb-4 group-hover:bg-primary/10 transition-colors">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        className="py-20 px-4 relative"
        initial={reducedMotion ? false : "hidden"}
        whileInView={reducedMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="glass-card overflow-hidden"
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-foreground pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <WaitlistCTA referralCode={referralCode} />

      {/* Social Links */}
      <motion.section
        className="py-20 px-4 relative"
        initial={reducedMotion ? false : "hidden"}
        whileInView={reducedMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8">
            Join Our <span className="text-primary">Community</span>
          </h2>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://x.com/selorahealth"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-hover px-6 py-4 flex items-center gap-3 group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  
              <span className="text-foreground group-hover:text-primary transition-colors">X (Twitter)</span>
            </a>
            <a
              href="https://discord.gg/XqZkcdhf2k"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-hover px-6 py-4 flex items-center gap-3 group"
            >
              <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                  </svg>
              <span className="text-foreground group-hover:text-primary transition-colors">Discord</span>
            </a>
            <a
              href="https://t.me/selorahealth"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-hover px-6 py-4 flex items-center gap-3 group"
            >
              <Send className="w-5 h-5 text-primary" />
              <span className="text-foreground group-hover:text-primary transition-colors">Telegram</span>
            </a>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo textClassName="text-foreground" />
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Selora. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
