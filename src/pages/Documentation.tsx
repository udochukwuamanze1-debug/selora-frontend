import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Book, Code, Shield, Database, Users, Wallet } from "lucide-react";

const sections = [
  {
    icon: Book,
    title: "Getting Started",
    content: `Selora is a decentralized health platform built on Sui blockchain. To begin using Selora, you'll need a Sui-compatible wallet. We support Sui Wallet by Mysten Labs and zkLogin for passwordless authentication.`,
  },
  {
    icon: Wallet,
    title: "Wallet Connection",
    content: `Connect your wallet using the "Connect Wallet" button in the navigation bar. Once connected, your wallet address will be displayed, and you'll gain access to the portal selection screen where you can choose your role.`,
  },
  {
    icon: Shield,
    title: "Data Encryption",
    content: `All health records are encrypted client-side using AES-256 encryption before leaving your browser. Your encryption keys are derived from your wallet signature and are never transmitted or stored externally.`,
  },
  {
    icon: Database,
    title: "Walrus Storage",
    content: `Encrypted data is stored on Walrus, a decentralized storage network native to Sui. Only encrypted references (blob IDs) are stored on-chain, ensuring your actual health data remains private and secure.`,
  },
  {
    icon: Code,
    title: "Smart Contracts",
    content: `Selora uses Move smart contracts on Sui for consent management, access control, and reward distribution. All contract interactions are transparent and verifiable on the Sui blockchain explorer.`,
  },
  {
    icon: Users,
    title: "Portal System",
    content: `Selora supports five portal types: Patient, Doctor, Lab/Pharmacist, Insurer, and Researcher. Each portal provides role-specific functionality while maintaining the same privacy and security standards.`,
  },
];

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onConnectWallet={() => {}} />
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Documentation
            </h1>
            <p className="text-muted-foreground text-lg">
              Learn how to use Selora and understand our technology
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <div
                key={section.title}
                className="glass-card p-6 md:p-8 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 shrink-0">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-semibold mb-3">
                      {section.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card p-6 md:p-8 mt-8">
            <h2 className="font-heading text-xl font-semibold mb-4">
              Need Help?
            </h2>
            <p className="text-muted-foreground mb-4">
              Join our community for support and updates:
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://discord.gg/selora"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Discord Community
              </a>
              <a
                href="https://x.com/selora"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                X (Twitter)
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Documentation;
