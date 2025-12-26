import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onConnectWallet={() => {}} />
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 md:p-12">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">
              Privacy Policy
            </h1>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="lead text-foreground">
                At Selora, your privacy is our fundamental commitment. This policy explains how we handle your data.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mt-8 mb-4">
                Data Ownership
              </h2>
              <p>
                You own your health data. Selora provides the infrastructure for you to store, manage, and share your data on your terms. We never sell your data to third parties.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mt-8 mb-4">
                Encryption
              </h2>
              <p>
                All health records are encrypted client-side using AES-256 encryption before being stored. Your encryption keys are stored only on your device and are never transmitted to our servers.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mt-8 mb-4">
                Decentralized Storage
              </h2>
              <p>
                Your encrypted data is stored on Walrus, a decentralized storage network on the Sui blockchain. Only encrypted references are stored on-chain, ensuring your data remains private.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mt-8 mb-4">
                Access Control
              </h2>
              <p>
                You control who can access your data. All access permissions are managed through smart contracts, and every access is logged for transparency.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mt-8 mb-4">
                Data Sharing
              </h2>
              <p>
                When you choose to stake or share your data, it is always anonymized and requires your explicit consent. You can revoke access at any time.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mt-8 mb-4">
                Contact
              </h2>
              <p>
                For privacy-related inquiries, please contact us at privacy@selora.app.
              </p>

              <p className="text-sm text-muted-foreground mt-8">
                Last updated: December 2024
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
