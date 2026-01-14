import { ArrowLeft, Play, Clock, Target, Users, Sparkles, Shield, Database, Zap, Heart, FileText, QrCode, Bot, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DemoScript = () => {
  const navigate = useNavigate();

  const scenes = [
    {
      id: 1,
      title: "Opening Hook",
      duration: "0:00 - 0:15",
      visual: "Montage of medical data breaches, cluttered file cabinets, frustrated patients",
      script: `"Every year, 500 million health records are compromised. Patients have no control. Providers are drowning in paperwork. And your most sensitive data? Scattered across dozens of systems you don't own."`,
      notes: "Fast cuts, dramatic music, then fade to silence",
      icon: Shield,
    },
    {
      id: 2,
      title: "Introducing Selora",
      duration: "0:15 - 0:35",
      visual: "Selora logo animation, then app interface reveal",
      script: `"Meet Selora — the first decentralized health data platform that puts YOU in control. Built on IOTA's feeless blockchain, Selora encrypts your health records, stores them in your personal vault, and lets you decide exactly who sees what."`,
      notes: "Smooth transition, uplifting music begins",
      icon: Sparkles,
    },
    {
      id: 3,
      title: "Wallet Creation",
      duration: "0:35 - 1:00",
      visual: "Screen recording: Google login → wallet creation → 12-word phrase",
      script: `"Getting started takes 30 seconds. Sign in with Google, and Selora automatically creates your secure wallet. Your 12-word recovery phrase is your key — back it up once, access your data from anywhere, forever."`,
      notes: "Show actual UI flow, highlight the simplicity",
      icon: Wallet,
    },
    {
      id: 4,
      title: "Uploading Records",
      duration: "1:00 - 1:30",
      visual: "Demo: Upload PDF/image → OCR extraction → encrypted storage",
      script: `"Upload any health document — lab results, prescriptions, imaging reports. Our AI extracts the key information, encrypts everything locally on your device, and stores it on Walrus decentralized storage. Not even Selora can read your data."`,
      notes: "Show the upload animation and encryption indicator",
      icon: FileText,
    },
    {
      id: 5,
      title: "The Secure Vault",
      duration: "1:30 - 2:00",
      visual: "Vault interface tour: folders, tags, search, preview",
      script: `"Your Secure Vault organizes everything automatically. Blood work, imaging, medications — all searchable, all encrypted. Pinpoint any record in seconds instead of hunting through file cabinets or patient portals."`,
      notes: "Navigate through vault categories, show search in action",
      icon: Database,
    },
    {
      id: 6,
      title: "Sharing with QR",
      duration: "2:00 - 2:30",
      visual: "Demo: Generate QR → Doctor scans → Time-limited access",
      script: `"Sharing is revolutionary. Generate a QR code that grants your doctor temporary access — 1 hour, 1 day, or custom. They scan, they see what you've permitted, the access expires automatically. No more faxing. No more 'we'll call to verify.'"`,
      notes: "Split screen: patient generating, doctor scanning",
      icon: QrCode,
    },
    {
      id: 7,
      title: "Trusted Contacts (Guardians)",
      duration: "2:30 - 2:50",
      visual: "Guardian management screen, emergency access flow",
      script: `"Designate Trusted Guardians — family members who can access your records in an emergency. You control the permissions. They're there when you need them, invisible when you don't."`,
      notes: "Show adding a guardian, permission settings",
      icon: Users,
    },
    {
      id: 8,
      title: "Selora AI Assistant",
      duration: "2:50 - 3:20",
      visual: "AI chat demo: asking about medications, lab values",
      script: `"Your personal health assistant understands YOUR data. Ask 'What's my cholesterol trend?' or 'When's my next appointment?' Get instant, personalized answers without exposing your data to cloud AI services."`,
      notes: "Show actual AI conversation with health insights",
      icon: Bot,
    },
    {
      id: 9,
      title: "Data Monetization",
      duration: "3:20 - 3:50",
      visual: "Data Exchange interface, staking flow, rewards",
      script: `"Here's where it gets interesting. Researchers need anonymized health data. With Selora, you can stake your encrypted data to research pools — and earn rewards. Your contribution advances medicine while you maintain complete privacy."`,
      notes: "Show staking UI, reward tokens, researcher view",
      icon: Zap,
    },
    {
      id: 10,
      title: "XP & Gamification",
      duration: "3:50 - 4:10",
      visual: "XP progress, level badges, health score",
      script: `"Stay engaged with your health. Earn XP for uploading records, maintaining your profile, and hitting health milestones. Level up your health journey while building the most complete picture of your wellness."`,
      notes: "Show XP notification, level-up animation",
      icon: Heart,
    },
    {
      id: 11,
      title: "Multi-Portal Ecosystem",
      duration: "4:10 - 4:40",
      visual: "Quick glimpse of Doctor, Lab, Researcher portals",
      script: `"Selora isn't just for patients. Doctors manage care workspaces. Labs upload results directly to patient vaults. Researchers access consented, anonymized data pools. One ecosystem, connected by consent."`,
      notes: "Brief montage of other portal interfaces",
      icon: Target,
    },
    {
      id: 12,
      title: "Closing & CTA",
      duration: "4:40 - 5:00",
      visual: "Return to patient dashboard, then CTA screen",
      script: `"Your health data belongs to you. Secure it. Control it. Benefit from it. Selora — health data, reimagined. Join our waitlist today and be among the first to own your health story."`,
      notes: "End with waitlist URL and QR code",
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="font-heading font-bold text-lg">Investor Demo Script</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            5:00 runtime
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Overview */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold mb-2">Selora Patient Portal Demo</h2>
              <p className="text-muted-foreground mb-4">
                A 5-minute walkthrough designed for investor presentations, showcasing the complete patient journey from onboarding to data monetization.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span><strong>Audience:</strong> Investors, Partners, Press</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span><strong>Duration:</strong> 5 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span><strong>Tone:</strong> Professional, Inspiring, Clear</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Production Notes */}
        <div className="glass-card p-6 mb-8 border-l-4 border-l-amber-500">
          <h3 className="font-heading font-semibold mb-3">📽️ Production Notes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Screen Recording:</strong> Use 1080p, 60fps with cursor highlighting</li>
            <li>• <strong>Music:</strong> Upbeat, modern tech soundtrack (royalty-free)</li>
            <li>• <strong>Voiceover:</strong> Professional VO artist, warm and authoritative</li>
            <li>• <strong>Graphics:</strong> Add animated callouts for key features</li>
            <li>• <strong>Demo Account:</strong> Pre-populate with realistic sample health data</li>
          </ul>
        </div>

        {/* Scene Breakdown */}
        <h2 className="font-heading text-xl font-bold mb-6">Scene-by-Scene Script</h2>
        
        <div className="space-y-6">
          {scenes.map((scene) => (
            <div key={scene.id} className="glass-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <scene.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{scene.id}/12</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading font-semibold text-lg">{scene.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted font-mono">
                      {scene.duration}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Visual:</strong>
                    </p>
                    <p className="text-sm italic">{scene.visual}</p>
                  </div>
                  
                  <div className="mb-4 p-4 rounded-lg bg-muted/50 border-l-4 border-l-primary">
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Voiceover Script:</strong>
                    </p>
                    <p className="text-sm leading-relaxed">{scene.script}</p>
                  </div>
                  
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold">💡 Notes:</span>
                    <span>{scene.notes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="glass-card p-8 mt-8 text-center bg-gradient-to-br from-primary/10 to-secondary/10">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="font-heading text-2xl font-bold mb-2">Ready to Record?</h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            This script is designed for a professional video production. For live demos, 
            adjust timing based on audience engagement and questions.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate("/executive-summary")} variant="outline">
              View Executive Summary
            </Button>
            <Button onClick={() => window.print()}>
              Print Script
            </Button>
          </div>
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          header, button { display: none !important; }
          .glass-card { break-inside: avoid; box-shadow: none; border: 1px solid #e5e7eb; }
        }
      `}</style>
    </div>
  );
};

export default DemoScript;
