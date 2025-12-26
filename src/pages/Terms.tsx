import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onConnectWallet={() => {}} />
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 md:p-12">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">
              Terms of Service
            </h1>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="lead text-foreground">
                By using Selora, you agree to these terms. Please read them carefully.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mt-8 mb-4">
                Service Description
              </h2>
              <p>
                Selora is a decentralized health platform that enables users to store, manage, and share their health data securely using blockchain technology.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mt-8 mb-4">
                User Responsibilities
              </h2>
              <p>
                You are responsible for maintaining the security of your wallet and encryption keys. Selora cannot recover lost keys or restore access to encrypted data without your credentials.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mt-8 mb-4">
                Data Accuracy
              </h2>
              <p>
                You are responsible for the accuracy of the health information you upload. Selora does not verify the content of uploaded records.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mt-8 mb-4">
                Healthcare Disclaimer
              </h2>
              <p>
                Selora is not a healthcare provider. The platform facilitates health data management but does not provide medical advice, diagnosis, or treatment.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mt-8 mb-4">
                Smart Contracts
              </h2>
              <p>
                Interactions with smart contracts are irreversible. Please review all transactions carefully before confirming them.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mt-8 mb-4">
                Rewards and Staking
              </h2>
              <p>
                Rewards earned through data staking are subject to the terms of individual research or insurance programs. Reward values may vary.
              </p>

              <h2 className="font-heading text-xl font-semibold text-foreground mt-8 mb-4">
                Modifications
              </h2>
              <p>
                We may update these terms from time to time. Continued use of the platform constitutes acceptance of updated terms.
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

export default Terms;
