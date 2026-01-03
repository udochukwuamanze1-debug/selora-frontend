import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/providers/ThemeProvider";
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
  Send
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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
    description: "Records stored on Walrus network - censorship-resistant and always available."
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
    answer: "Selora is a decentralized health records platform built on the Sui blockchain. It gives you complete ownership and control over your medical data, allowing you to securely share it with healthcare providers and even earn from anonymized research contributions."
  },
  {
    question: "How does Selora protect my data?",
    answer: "Your health records are encrypted with AES-256 encryption before being stored on the Walrus decentralized storage network. Only you hold the keys to decrypt your data, and you control exactly who can access it and for how long."
  },
  {
    question: "Do I need cryptocurrency to use Selora?",
    answer: "While Selora is built on the Sui blockchain, we've made it easy for everyone to use. You'll need a small amount of SUI tokens for transactions, but our onboarding process helps you get started even if you're new to crypto."
  },
  {
    question: "Can doctors really send me prescriptions directly?",
    answer: "Yes! Doctors using Selora can mint prescriptions and visit reports as NFTs that are automatically sent to your wallet. You'll receive instant notifications and can access your records immediately."
  },
  {
    question: "When will Selora launch?",
    answer: "We're currently in development and testing on Sui Devnet. Join our waitlist to be among the first to access Selora when we launch on mainnet!"
  }
];

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call - in production, this would save to a database
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store in localStorage for now
    const waitlist = JSON.parse(localStorage.getItem("selora_waitlist") || "[]");
    if (!waitlist.includes(email)) {
      waitlist.push(email);
      localStorage.setItem("selora_waitlist", JSON.stringify(waitlist));
    }
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("You're on the list! We'll notify you when Selora launches.");
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
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Animated particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
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
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-sm text-primary mb-8 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Coming Soon on Sui Mainnet
          </div>
          
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Own Your Health.
            <br />
            <span className="text-primary">Control Your Future.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
            The first decentralized health records platform where you own your data, 
            control access, and earn from research contributions.
          </p>

          {/* Email Signup */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto animate-fade-up" style={{ animationDelay: "0.3s" }}>
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
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">You're on the list!</h3>
              <p className="text-muted-foreground">
                We'll send you an email when Selora is ready. In the meantime, follow us on social media.
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
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
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
                <div
                  key={index}
                  className="glass-card p-6 group hover:border-primary/30 transition-all animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-3 rounded-xl bg-primary/5 inline-block mb-4 group-hover:bg-primary/10 transition-colors">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="glass-card overflow-hidden animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8">
            Join Our <span className="text-primary">Community</span>
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://twitter.com/selorahealth"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-hover px-6 py-4 flex items-center gap-3 group"
            >
              <Twitter className="w-5 h-5 text-primary" />
              <span className="text-foreground group-hover:text-primary transition-colors">Twitter</span>
            </a>
            <a
              href="https://discord.gg/selora"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-hover px-6 py-4 flex items-center gap-3 group"
            >
              <MessageCircle className="w-5 h-5 text-primary" />
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
      </section>

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