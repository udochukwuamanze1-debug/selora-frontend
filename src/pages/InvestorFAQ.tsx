import { Link } from "react-router-dom";
import { ArrowLeft, Printer, Shield, TrendingUp, Lock, Users, Coins, Globe, Scale, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export default function InvestorFAQ() {
  const handlePrint = () => {
    window.print();
  };

  const faqs = [
    {
      category: "Technology",
      icon: Zap,
      questions: [
        {
          q: "What blockchain does Selora use and why?",
          a: "Selora is built on IOTA, chosen for its feeless transactions, energy efficiency, and enterprise-grade security. IOTA's DAG-based architecture enables micro-transactions without gas fees, making it ideal for healthcare where frequent small transactions (prescriptions, access grants) are common. This eliminates cost barriers for adoption."
        },
        {
          q: "How does Selora store health records?",
          a: "Health records are encrypted client-side using AES-256-GCM before being stored on IPFS (InterPlanetary File System) via Pinata. Only encrypted data leaves the user's device. The decryption keys are derived from the user's wallet, ensuring only they can access their data. Metadata and access permissions are stored on-chain."
        },
        {
          q: "What happens if a user loses their wallet keys?",
          a: "Users receive a 12-word BIP39 recovery phrase during onboarding. This phrase can restore their wallet and decrypt their health records on any device. We also support social recovery through trusted contacts (guardians) who can collectively help recover access without exposing sensitive data."
        },
        {
          q: "Is Selora HIPAA compliant?",
          a: "Yes. Selora's architecture inherently supports HIPAA compliance: data is encrypted at rest and in transit, access is auditable on-chain, and users have complete control over their PHI. We're pursuing formal HIPAA certification and will execute BAAs with healthcare provider partners."
        }
      ]
    },
    {
      category: "Security",
      icon: Shield,
      questions: [
        {
          q: "How do you prevent unauthorized access to health records?",
          a: "Access control is enforced at the smart contract level. Providers must request access, users must cryptographically approve it, and access tokens have configurable expiration. All access attempts are logged on-chain, creating an immutable audit trail. We also implement rate limiting and anomaly detection."
        },
        {
          q: "What if a doctor's wallet is compromised?",
          a: "Compromised provider wallets can only access records they were previously granted permission to view, and only until those permissions expire. Users can revoke access instantly. Additionally, our tiered subscription model limits the number of patients each provider can access, containing potential breach scope."
        },
        {
          q: "How do you handle key management at scale?",
          a: "We use hierarchical deterministic (HD) wallets for key derivation. Users manage a single master seed, from which all encryption keys are derived. For enterprises, we integrate with HSMs (Hardware Security Modules) and support multi-signature authentication for high-security operations."
        }
      ]
    },
    {
      category: "Market & Competition",
      icon: TrendingUp,
      questions: [
        {
          q: "What is Selora's target market size?",
          a: "Global digital health market: $550B by 2028 (CAGR 15.1%). Our addressable market includes 4.4B people with health records, 12M+ physicians worldwide, and growing healthcare data monetization ($47B by 2030). Initial focus: Africa (500M+ underserved), Middle East, and Southeast Asia."
        },
        {
          q: "Who are your main competitors?",
          a: "Traditional EHR: Epic, Cerner (legacy, centralized, no patient ownership). Blockchain health: MedRec (research-only), Patientory (limited traction). None combine user ownership + provider tools + research marketplace in a single platform. Our competitive moat is the integrated ecosystem."
        },
        {
          q: "Why will healthcare providers adopt Selora?",
          a: "Providers face record request costs ($5-20 per request), interoperability challenges, and liability concerns. Selora offers: instant access to patient history (with consent), reduced administrative burden, new revenue through on-chain prescriptions, and blockchain-verified credentials."
        }
      ]
    },
    {
      category: "Business Model",
      icon: Coins,
      questions: [
        {
          q: "How does Selora generate revenue?",
          a: "Four revenue streams: (1) Provider subscriptions: $2-10/month for patient access tiers. (2) Transaction fees: 0.5% on prescription/record transfers. (3) Research marketplace: 1% commission on anonymized data purchases. (4) Enterprise licensing: Custom pricing for hospitals/insurers."
        },
        {
          q: "What are the unit economics?",
          a: "CAC (patient): ~$2 (viral referrals). CAC (provider): ~$50 (direct sales). LTV (provider): $240+ (24-month avg retention). Gross margin: 85%+ (SaaS model). Break-even: Month 18 at current burn rate."
        },
        {
          q: "How do patients earn from their data?",
          a: "Patients opt-in to anonymized data pools categorized by condition, demographics, and metrics. Researchers purchase access via IOTA tokens. Patients receive 80% of pool revenue, distributed based on data contribution value. Smart contracts ensure automatic, transparent payments."
        }
      ]
    },
    {
      category: "Regulatory & Legal",
      icon: Scale,
      questions: [
        {
          q: "How do you navigate different healthcare regulations globally?",
          a: "Selora is data-location agnostic—records are encrypted and distributed. Users own their data, simplifying GDPR (right to data portability), HIPAA, and local regulations. We partner with regional legal counsel in target markets and design features for regulatory compliance (consent tracking, audit logs)."
        },
        {
          q: "Are blockchain prescriptions legally valid?",
          a: "Currently, on-chain prescriptions serve as verifiable records linked to provider credentials. Legal validity varies by jurisdiction. We're working with regulators in pilot markets to establish blockchain prescription frameworks. Initial use cases focus on record-keeping rather than dispensing authority."
        },
        {
          q: "What is your approach to patient consent?",
          a: "Consent is granular, on-chain, and auditable. Patients specify: what data, which provider, how long, what purpose. Smart contracts enforce these terms automatically. Consent can be revoked anytime, instantly terminating access. This exceeds most regulatory requirements."
        }
      ]
    },
    {
      category: "Traction & Roadmap",
      icon: Globe,
      questions: [
        {
          q: "What traction do you have so far?",
          a: "Currently in development on IOTA testnet. Building waitlist with viral referral mechanics. Early partnerships in discussion with 3 clinics in Africa. 15+ healthcare professionals advising. Full prototype functional with core features: wallet onboarding, record encryption, access grants."
        },
        {
          q: "What are the key milestones for the next 18 months?",
          a: "Q1 2025: Testnet launch, first 100 users. Q2 2025: Mainnet alpha, 3 clinic pilots. Q3 2025: Provider onboarding, mobile app. Q4 2025: Research marketplace beta. Q1 2026: 10K users, Series A readiness. Q2 2026: Geographic expansion, enterprise sales."
        },
        {
          q: "What is the $800K grant allocation?",
          a: "Engineering (55%): 3 full-time developers, security audits, infrastructure. Security (15%): Smart contract audits, penetration testing, compliance. Marketing (10%): Community building, provider outreach. Legal (10%): Multi-jurisdiction review, entity setup. Operations (10%): Cloud, tooling, contingency."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          .container { max-width: 100% !important; padding: 0 !important; }
          .glass-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
        }
      `}</style>

      {/* Header */}
      <header className="no-print fixed top-0 left-0 right-0 z-50 px-4 py-4 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print / PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-5xl mx-auto px-4 pt-24 pb-16">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Investor <span className="text-primary">FAQ</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Common questions about Selora's technology, security, market opportunity, and business model.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <span>Last updated: January 2025</span>
            <span>•</span>
            <span>{faqs.reduce((acc, cat) => acc + cat.questions.length, 0)} Questions</span>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="no-print glass-card p-6 mb-12">
          <h2 className="font-semibold mb-4 text-foreground">Quick Navigation</h2>
          <div className="flex flex-wrap gap-2">
            {faqs.map((category, index) => {
              const Icon = category.icon;
              return (
                <a
                  key={index}
                  href={`#${category.category.toLowerCase()}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors text-sm"
                >
                  <Icon className="w-4 h-4" />
                  {category.category}
                </a>
              );
            })}
          </div>
        </div>

        {/* FAQ Categories */}
        {faqs.map((category, catIndex) => {
          const Icon = category.icon;
          return (
            <section
              key={catIndex}
              id={category.category.toLowerCase()}
              className={`mb-12 ${catIndex > 0 ? 'print-break' : ''}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-foreground">
                  {category.category}
                </h2>
              </div>

              <div className="space-y-6">
                {category.questions.map((faq, qIndex) => (
                  <div key={qIndex} className="glass-card p-6">
                    <h3 className="font-semibold text-foreground mb-3 text-lg">
                      {faq.q}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Contact Section */}
        <section className="glass-card p-8 text-center mt-12">
          <h2 className="font-heading text-2xl font-bold mb-4 text-foreground">
            More Questions?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            We're happy to discuss any aspect of Selora in more detail. Schedule a call or reach out directly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/executive-summary">
              <Button variant="outline" className="gap-2">
                View Executive Summary
              </Button>
            </Link>
            <Link to="/demo-script">
              <Button variant="outline" className="gap-2">
                View Demo Script
              </Button>
            </Link>
            <a href="mailto:customer.selora@gmail.com">
              <Button className="gap-2">
                Contact Us
              </Button>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center mt-12 pt-8 border-t border-border">
          <Logo />
          <p className="text-sm text-muted-foreground mt-4">
            Confidential • For Investor Discussion Only
          </p>
        </footer>
      </main>
    </div>
  );
}
