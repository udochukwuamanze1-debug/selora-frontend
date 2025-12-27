import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Whitepaper = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onConnectWallet={() => {}} />
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 md:p-12">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
              Selora Whitepaper
            </h1>
            <p className="text-muted-foreground mb-8">Version 1.0 — December 2024</p>

            <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  Abstract
                </h2>
                <p>
                  Selora is a decentralized health data platform built on the Sui blockchain, designed to give individuals complete ownership and control over their medical records. By leveraging client-side encryption, decentralized storage via Walrus, and transparent smart contracts, Selora enables secure sharing of health data while preserving privacy and enabling ethical monetization.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  1. Introduction
                </h2>
                <p>
                  Current healthcare systems treat patient data as an asset owned by institutions rather than individuals. This creates fragmented records, privacy concerns, and excludes patients from the value their data generates. Selora addresses these issues through a human-centered, decentralized approach.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  2. Technical Architecture
                </h2>
                <h3 className="font-heading text-xl font-medium text-foreground mt-6 mb-3">
                  2.1 Client-Side Encryption
                </h3>
                <p>
                  All health records are encrypted using AES-256-GCM before leaving the user's browser. Encryption keys are derived from wallet signatures using HKDF, ensuring only the data owner can decrypt their records.
                </p>

                <h3 className="font-heading text-xl font-medium text-foreground mt-6 mb-3">
                  2.2 Walrus Storage
                </h3>
                <p>
                  Encrypted data is stored on Walrus, a decentralized blob storage network native to Sui. This provides censorship-resistant, highly available storage while keeping actual data off-chain for privacy and scalability.
                </p>

                <h3 className="font-heading text-xl font-medium text-foreground mt-6 mb-3">
                  2.3 On-Chain Consent Management
                </h3>
                <p>
                  Smart contracts written in Move manage access permissions, consent logs, and reward distribution. All consent grants and revocations are recorded on-chain for transparency and auditability.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  3. User Roles
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Patients:</strong> Primary data owners who control their health records</li>
                  <li><strong>Doctors:</strong> Healthcare providers who can request and view authorized records</li>
                  <li><strong>Labs/Pharmacists:</strong> Fulfill prescriptions and upload diagnostic results</li>
                  <li><strong>Insurers:</strong> Access anonymized data pools for risk assessment</li>
                  <li><strong>Researchers:</strong> Conduct studies using consented, anonymized data</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  4. Data Staking & Rewards
                </h2>
                <p>
                  Users can stake their anonymized health data for research and analytics. Rewards are distributed transparently via smart contracts, ensuring fair compensation for data contributions while maintaining privacy through differential privacy techniques.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  5. Roadmap
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Q1 2026:</strong> Mainnet launch with core patient features</li>
                  <li><strong>Q2 2026:</strong> Doctor and lab portal integration</li>
                  <li><strong>Q3 2026:</strong> Data staking and reward system</li>
                  <li><strong>Q4 2026:</strong> Micro-insurance pools and research marketplace</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-foreground mb-4">
                  6. Conclusion
                </h2>
                <p>
                  Selora represents a paradigm shift in health data management, putting patients at the center of their healthcare journey. By combining Sui's performance with Walrus's decentralized storage, we create a platform that is private, secure, and truly owned by users.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Whitepaper;
