import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ExecutiveSummary = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - hidden in print */}
      <header className="print:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={handlePrint}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </header>

      {/* Executive Summary Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl print:max-w-none print:p-0">
        <div className="bg-card rounded-2xl border border-border/50 p-8 print:border-none print:shadow-none print:p-12 space-y-8">
          
          {/* Header Section */}
          <div className="text-center border-b border-border/50 pb-8 print:pb-6">
            <h1 className="text-4xl font-heading font-bold text-primary mb-2">SELORA</h1>
            <p className="text-xl text-muted-foreground">Own Your Health Data. Earn From It.</p>
            <p className="text-sm text-muted-foreground mt-2">Executive Summary | Q1 2026</p>
          </div>

          {/* The Problem */}
          <section>
            <h2 className="text-2xl font-heading font-bold mb-4 text-primary">The Problem</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-3xl font-bold text-destructive">$11B+</p>
                <p className="text-sm text-muted-foreground">Annual healthcare data breaches globally</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-3xl font-bold text-destructive">$0</p>
                <p className="text-sm text-muted-foreground">What patients earn from their own health data</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>• Patients have zero ownership of their health records</li>
              <li>• Data is siloed across 30+ providers per person</li>
              <li>• Pharma pays $2.1B/year for third-party health data — patients see nothing</li>
            </ul>
          </section>

          {/* The Solution */}
          <section>
            <h2 className="text-2xl font-heading font-bold mb-4 text-primary">Our Solution</h2>
            <p className="text-muted-foreground mb-4">
              Selora is a <strong>self-sovereign health data wallet</strong> built on IOTA blockchain that gives patients complete control over their medical records while enabling them to earn from anonymized data sharing.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-primary/10 rounded-xl p-4 text-center">
                <p className="font-semibold">Encrypted Storage</p>
                <p className="text-sm text-muted-foreground">End-to-end encrypted on IOTA + IPFS</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-4 text-center">
                <p className="font-semibold">Consent-Based Monetization</p>
                <p className="text-sm text-muted-foreground">Earn when researchers use your data</p>
              </div>
              <div className="bg-primary/10 rounded-xl p-4 text-center">
                <p className="font-semibold">One-Click Sharing</p>
                <p className="text-sm text-muted-foreground">QR code access for doctor visits</p>
              </div>
            </div>
          </section>

          {/* Market Opportunity */}
          <section>
            <h2 className="text-2xl font-heading font-bold mb-4 text-primary">Market Opportunity</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium">Market Segment</th>
                    <th className="text-right py-2 font-medium">TAM (2025)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Global Digital Health Records</td>
                    <td className="text-right">$47B</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Health Data Analytics</td>
                    <td className="text-right">$41B</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Patient Engagement Solutions</td>
                    <td className="text-right">$25B</td>
                  </tr>
                  <tr className="font-bold">
                    <td className="py-2">Total Addressable Market</td>
                    <td className="text-right text-primary">$113B</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Business Model */}
          <section>
            <h2 className="text-2xl font-heading font-bold mb-4 text-primary">Business Model</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="font-semibold">Data Licensing</p>
                <p className="text-sm text-muted-foreground">15% platform fee on patient → researcher transactions</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="font-semibold">B2B API Access</p>
                <p className="text-sm text-muted-foreground">$10K–$100K/year for hospitals & clinics</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="font-semibold">Premium Storage</p>
                <p className="text-sm text-muted-foreground">$5/month for enhanced vault features</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="font-semibold">Enterprise Dashboards</p>
                <p className="text-sm text-muted-foreground">Custom pricing for compliance tools</p>
              </div>
            </div>
          </section>

          {/* Traction & Milestones */}
          <section>
            <h2 className="text-2xl font-heading font-bold mb-4 text-primary">Traction & Roadmap</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-green-500">✓</span>
                <span>MVP launched with IOTA blockchain integration</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-500">✓</span>
                <span>zkLogin for Web2-simple onboarding (Google, Apple)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-500">✓</span>
                <span>IPFS/Walrus encrypted storage implementation</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-500">✓</span>
                <span>Real BIP-39 wallet generation with recovery phrases</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>📍</span>
                <span>Q1 2026: Pilot with 2 clinics in EU</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>📍</span>
                <span>Q2 2026: Researcher marketplace beta launch</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>📍</span>
                <span>Q4 2026: 10,000 patient wallets milestone</span>
              </div>
            </div>
          </section>

          {/* Funding Ask */}
          <section>
            <h2 className="text-2xl font-heading font-bold mb-4 text-primary">The Ask: $800K Grant</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium">Category</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                    <th className="text-right py-2 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Engineering (4 devs × 18 months)</td>
                    <td className="text-right">$400K</td>
                    <td className="text-right">50%</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Security Audits & Compliance</td>
                    <td className="text-right">$120K</td>
                    <td className="text-right">15%</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Marketing & Community</td>
                    <td className="text-right">$100K</td>
                    <td className="text-right">12.5%</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Legal & HIPAA/GDPR Prep</td>
                    <td className="text-right">$80K</td>
                    <td className="text-right">10%</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Infrastructure (IPFS, servers)</td>
                    <td className="text-right">$60K</td>
                    <td className="text-right">7.5%</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Operations & Contingency</td>
                    <td className="text-right">$40K</td>
                    <td className="text-right">5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Competitive Advantage */}
          <section>
            <h2 className="text-2xl font-heading font-bold mb-4 text-primary">Why Selora Wins</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold mb-2">vs. Apple Health</p>
                <p className="text-sm text-muted-foreground">No blockchain, no monetization for users</p>
              </div>
              <div>
                <p className="font-semibold mb-2">vs. Patientory</p>
                <p className="text-sm text-muted-foreground">High Ethereum fees, no zkLogin</p>
              </div>
              <div>
                <p className="font-semibold mb-2">vs. Solve.Care</p>
                <p className="text-sm text-muted-foreground">B2B focused, not patient-centric</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Selora Advantage</p>
                <p className="text-sm text-primary">IOTA L1, zkLogin, patient-owned, revenue share</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="text-center border-t border-border/50 pt-8 print:pt-6">
            <h2 className="text-2xl font-heading font-bold mb-4">Let's Talk</h2>
            <p className="text-muted-foreground mb-4">
              Ready to revolutionize health data ownership?
            </p>
            <div className="flex flex-col items-center gap-2">
              <p className="font-mono">contact@selora.health</p>
              <p className="text-sm text-muted-foreground">selora.health</p>
            </div>
          </section>
        </div>
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:p-12 { padding: 3rem !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:max-w-none { max-width: none !important; }
          .print\\:pb-6 { padding-bottom: 1.5rem !important; }
          .print\\:pt-6 { padding-top: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
};

export default ExecutiveSummary;
