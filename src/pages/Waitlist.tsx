import { useMemo, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, CheckCircle, ArrowRight, Sun, Moon, Send } from "lucide-react";

// ─── CUSTOM THEME TOGGLE ─────────────────────────────────────────────────────
function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle theme"
      className="relative w-10 h-10 rounded-full flex items-center justify-center border border-border/50 bg-background/60 backdrop-blur-sm hover:border-primary/40 transition-all duration-200 group"
    >
      {dark ? (
        <Sun className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      ) : (
        <Moon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      )}
    </button>
  );
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link
      to="/"
      className="font-serif text-xl font-semibold tracking-wide text-foreground hover:opacity-80 transition-opacity"
    >
      Sel<span className="text-primary">o</span>ra
    </Link>
  );
}

// ─── WAITLIST FORM HOOK (no Supabase) ────────────────────────────────────────
function useWaitlistForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error === "already_registered") {
          setSuccess(true);
        } else {
          throw new Error("Something went wrong. Please try again.");
        }
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { email, setEmail, isSubmitting, success, error, submit };
}

// ─── WAITLIST INPUT BLOCK ─────────────────────────────────────────────────────
function WaitlistInput({ id = "email" }: { id?: string }) {
  const { email, setEmail, isSubmitting, success, error, submit } = useWaitlistForm();

  if (success) {
    return (
      <div className="max-w-md mx-auto border border-border/40 rounded-xl p-8 text-center bg-background animate-fade-up">
        <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">You're on the list.</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          We'll reach out before public launch with your early access details and 6 months of Premium free. Check your inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto animate-fade-up">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id={id}
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          className="flex-1 h-12 px-4 rounded-md bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 px-6 rounded-md bg-primary text-primary-foreground font-bold text-xs tracking-wider uppercase flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 whitespace-nowrap"
        >
          {isSubmitting ? "Joining…" : (<>Reserve My Spot <ArrowRight className="w-4 h-4" /></>)}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      <p className="text-xs text-muted-foreground/50 mt-3">No spam. Unsubscribe anytime.</p>
    </form>
  );
}

// ─── WAITLIST CTA SECTION ────────────────────────────────────────────────────
export function WaitlistCTA() {
  return (
    <section className="relative py-28 px-6 overflow-hidden text-center" id="waitlist-cta">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(var(--primary-rgb, 200 169 110) / 0.07) 0%, transparent 70%)",
        }}
      />
      <div className="relative max-w-2xl mx-auto">
        <div className="section-label justify-center mb-6">Limited early access</div>
        <h2 className="font-serif text-4xl md:text-6xl font-light leading-tight mb-6">
          Be among the first<br />to own your health{" "}
          <em className="text-primary not-italic">completely.</em>
        </h2>
        <p className="text-muted-foreground text-lg mb-12 max-w-lg mx-auto leading-relaxed">
          Early access members get <strong className="text-foreground">6 months of Premium free</strong>, priority onboarding, and a guaranteed spot before public launch.
        </p>
        <WaitlistInput id="cta-email" />
        <div className="mt-8 flex flex-wrap justify-center gap-6 font-mono text-xs tracking-wider text-muted-foreground/40">
          <span>No spam. Ever.</span>
          <span>Unsubscribe anytime.</span>
          <span>Early access = 6 months Premium free.</span>
        </div>
      </div>
    </section>
  );
}

// ─── LIVE COUNTER ─────────────────────────────────────────────────────────────
function LiveCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = 4200;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 1800 / steps);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.6) setCount((c) => c + Math.floor(Math.random() * 3) + 1);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  return <span className="text-primary font-semibold">{count.toLocaleString()}+</span>;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const problems = [
  {
    num: "01",
    title: "Your records are hostage",
    text: "Hospitals own your records. Not you. Requesting them requires bureaucracy, waiting, and sometimes legal intervention. You are the patient — yet you have the least access.",
    accent: false,
  },
  {
    num: "02",
    title: "Crossing a border resets you to zero",
    text: "Nigerian professional in London. Ghanaian executive in Dubai. Each time you see a new doctor in a new country, you start from scratch. Medical history evaporates at every border.",
    accent: true,
  },
  {
    num: "03",
    title: "Your data earns billions — for others",
    text: "Pharmaceutical companies pay billions for health datasets. The patients who generate that data receive nothing. The data economy profits from you without your knowledge or consent.",
    accent: true,
  },
  {
    num: "04",
    title: "Privacy is a marketing claim, not a fact",
    text: "Centralised health apps store your data on their servers in a form they can read. You trust a company policy, not mathematics. When they are breached — and they are breached — your most intimate data is exposed.",
    accent: false,
  },
];

const steps = [
  {
    num: "01",
    icon: "📱",
    title: "Store your records",
    text: "Upload lab results, prescriptions, scans, vaccination history. Your device encrypts everything before it leaves your hands. Selora staff cannot read your records. Mathematically impossible.",
  },
  {
    num: "02",
    icon: "⚡",
    title: "Build your health profile",
    text: "A personalised health score. Trend analysis. Medication reminders. Family vault. Plain-language insights that explain what your lab results actually mean — in your language.",
  },
  {
    num: "03",
    icon: "🔑",
    title: "Share with one QR code",
    text: "Show your QR to any doctor, anywhere in the world. Choose what they see, and for how long. One tap revokes access instantly. Every access event is recorded on the blockchain — visible to you, tamper-proof.",
  },
  {
    num: "04",
    icon: "💰",
    title: "Earn from research",
    text: "Opt in to anonymised research studies. Researchers pay; you earn — directly to your mobile wallet in your local currency. Your data, your income. Cancel anytime.",
  },
];

const stats = [
  { num: "4.5B", label: "People with no portable medical records" },
  { num: "$80B", label: "Paid annually for health research data — none to patients" },
  { num: "$1B", label: "Nigeria spends yearly on medical tourism — Selora's beachhead" },
  { num: "28%", label: "Annual growth of African digital health market" },
];

const testimonials = [
  {
    quote:
      "I've been living between Lagos and London for six years. Every time I see a specialist in the UK I start from zero. The moment Selora launches, this will finally be solved. I signed up the second I heard about it — this is exactly what I've been waiting for.",
    name: "Tunde A.",
    role: "Finance Director · Lagos / London",
  },
  {
    quote:
      "I once had a severe allergic reaction abroad and had no way to communicate my medical history to the ER team. The idea of showing a doctor my complete allergy history via one QR code, in seconds — I cannot wait for this to exist. Selora needs to launch yesterday.",
    name: "Fatima O.",
    role: "Consultant · Abuja / Dubai",
  },
  {
    quote:
      "I had no idea my health data was being monetised without my consent. The fact that Selora will actually pay me for opting into research — and be transparent about it on-chain — is revolutionary. I've already referred five colleagues. We need this.",
    name: "Emeka N.",
    role: "Software Engineer · Port Harcourt",
  },
];

const faqs = [
  {
    question: "What is Selora?",
    answer:
      "Selora is a decentralised health records platform built on the IOTA blockchain. It gives you complete ownership and control over your medical data, allowing you to securely share it with healthcare providers anywhere in the world — and earn from anonymised research contributions.",
  },
  {
    question: "How does Selora protect my data?",
    answer:
      "Your health records are encrypted with AES-256-GCM on your device before they ever leave your hands. Only you hold the decryption keys. Selora staff are architecturally incapable of reading your records — it is a mathematical guarantee, not a policy promise.",
  },
  {
    question: "Do I need cryptocurrency to use Selora?",
    answer:
      "No. While Selora is built on IOTA, we've abstracted all crypto complexity away. Research earnings are automatically converted and paid to your mobile wallet (OPay, MTN MoMo, bank transfer, etc.) in your local currency. No crypto wallet required.",
  },
  {
    question: "How does the research earnings model work?",
    answer:
      "You opt in to specific, IRB-verified research studies. A smart contract on the IOTA blockchain handles transparent, tamper-proof payments. 75% of study fees go directly to participating patients. You can cancel participation from any study at any time.",
  },
  {
    question: "Who is Selora built for?",
    answer:
      "Selora is built for mobile, globally-connected people — professionals who travel, expats managing care across borders, and anyone frustrated by fragmented medical records. It is also designed for hospitals, researchers, and insurers who need verified, consented health data.",
  },
  {
    question: "When will Selora launch?",
    answer:
      "We are currently in the foundation phase — building the core app, encryption engine, and IOTA smart contracts. Public launch in Nigeria and the UK is targeted for Q3 2026. Join the waitlist for early access and 6 months of Premium completely free.",
  },
];

const roadmapPhases = [
  {
    tag: "▶ Now building",
    tagColor: "text-primary",
    title: "Phase 0 — Foundation",
    current: true,
    items: [
      "Core patient app & onboarding",
      "Client-side encryption engine",
      "IOTA consent smart contracts",
      "Hospital portal (browser-based)",
      "Private beta — 500 invitees",
      "Security audit (external)",
    ],
  },
  {
    tag: "Q3 2026",
    tagColor: "text-teal-400",
    title: "Phase 1 — Launch",
    current: false,
    items: [
      "Public launch: Nigeria + UK",
      "Research marketplace beta",
      "IOTA → Naira payout pipeline",
      "Family vault",
      "Physical NFC card",
      "NDPR compliance certification",
    ],
  },
  {
    tag: "2027",
    tagColor: "text-blue-400",
    title: "Phase 2 — Expansion",
    current: false,
    items: [
      "Kenya, Ghana, UAE, India",
      "Insurer analytics product",
      "Wearable integrations",
      "HL7 FHIR hospital integration",
      "GDPR certification",
      "Multi-currency earnings",
    ],
  },
  {
    tag: "2028+",
    tagColor: "text-muted-foreground",
    title: "Phase 3 — Platform",
    current: false,
    items: [
      "Open developer API",
      "South Africa, Egypt",
      "AI health insights (on-device)",
      "Ministry of Health partnerships",
      "5M+ patients milestone",
    ],
  },
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Waitlist() {
  const reducedMotion = useReducedMotion();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fade = useMemo(
    () => ({ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }),
    []
  );

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── GLOBAL STYLES ──────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=JetBrains+Mono:wght@300;400&display=swap');

        .font-serif { font-family: 'Cormorant Garamond', Georgia, serif !important; }
        .font-mono-custom { font-family: 'JetBrains Mono', monospace !important; }

        .section-label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: hsl(var(--primary));
        }
        .section-label::before {
          content: '';
          flex: 0 0 28px;
          height: 1px;
          background: hsl(var(--primary));
          opacity: 0.5;
        }

        @keyframes selora-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: selora-fade-up 0.7s ease both; }

        @keyframes selora-spin { to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes selora-spin-rev { to { transform: translate(-50%,-50%) rotate(-360deg); } }
        .orbit-1 {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 480px; height: 480px;
          border: 1px solid rgba(var(--primary-rgb, 200 169 110) / 0.06);
          border-radius: 50%;
          animation: selora-spin 30s linear infinite;
        }
        .orbit-2 {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 750px; height: 750px;
          border: 1px solid rgba(62 207 178 / 0.04);
          border-radius: 50%;
          animation: selora-spin-rev 50s linear infinite;
        }
      `}</style>

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border/40" : ""
        }`}
      >
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="#waitlist-cta"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold tracking-wider uppercase hover:opacity-90 transition-opacity"
          >
            Join Waitlist
          </a>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(ellipse, rgba(var(--primary-rgb,200 169 110)/0.07) 0%, transparent 70%)" }} />
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-teal-500/4 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/4 rounded-full blur-[100px]" />
          <div className="orbit-1 hidden md:block" />
          <div className="orbit-2 hidden md:block" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 bg-primary/8 mb-10 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="font-mono-custom text-xs tracking-widest uppercase text-primary">Now accepting early access</span>
          </div>

          <h1
            className="font-serif text-5xl md:text-7xl lg:text-[90px] font-light leading-[0.95] tracking-tight mb-6 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            Own your health.<br />
            <span
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)), #E8D5A8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Get paid
            </span>{" "}
            for it.
          </h1>

          <p
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Your encrypted medical records. One QR code. Every doctor, every country.
            Plus a research marketplace that pays <em>you</em> — not pharmaceutical companies — for your data.
          </p>

          <div style={{ animationDelay: "0.3s" }}>
            <WaitlistInput id="hero-email" />
          </div>

          {/* Trust badges */}
          <div
            className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            {["End-to-end encrypted", "You hold your keys", "Built on IOTA blockchain", "Free to start"].map((t) => (
              <span key={t} className="font-mono-custom text-xs text-muted-foreground/50 flex items-center gap-1.5">
                <span className="text-teal-400 text-[10px]">✓</span> {t}
              </span>
            ))}
          </div>

          {/* Live counter — no specific number, just momentum */}
          <p
            className="mt-8 font-mono-custom text-sm text-muted-foreground/55 animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            Join a growing movement — <LiveCounter /> professionals already on the waitlist
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-up" style={{ animationDelay: "0.9s" }}>
          <div className="w-px h-12 bg-gradient-to-b from-primary/60 to-transparent animate-pulse mx-auto" />
        </div>
      </section>

      {/* ── PROBLEM ────────────────────────────────────────────────────────── */}
      <motion.section
        className="py-24 px-6 bg-muted/20"
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fade}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="section-label mb-5">The Problem</div>
          <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-5">
            Medicine without memory<br />is medicine with{" "}
            <em className="text-primary not-italic">blindfolds.</em>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed mb-16">
            Every year, millions of intelligent, mobile, globally-connected people arrive at foreign hospitals with no medical history. Doctors guess. Tests are repeated. Allergies go unrecorded. This is not a developing world problem — it is a world problem.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/40 border border-border/40 rounded-xl overflow-hidden">
            {problems.map((p) => (
              <div key={p.num} className={`p-10 ${p.accent ? "bg-muted/30" : "bg-background"}`}>
                <div className="font-serif text-6xl font-light text-primary/25 leading-none mb-5">{p.num}</div>
                <div className="text-base font-semibold text-foreground mb-3">{p.title}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{p.text}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <motion.section
        className="py-24 px-6"
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fade}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="section-label mb-5">How Selora Works</div>
          <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-5">
            Radically simple.<br />
            <em className="text-primary not-italic">Mathematically</em> private.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed mb-16">
            Selora combines blockchain consent tracking with distributed encrypted storage. You hold your keys. We hold nothing readable.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/40 border border-border/40 rounded-xl overflow-hidden">
            {steps.map((s) => (
              <div
                key={s.num}
                className="p-8 bg-muted/10 hover:bg-muted/20 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono-custom text-xs tracking-widest text-primary">{s.num}</span>
                  <div className="flex-1 h-px bg-primary/20 group-hover:bg-primary/40 transition-colors" />
                </div>
                <div className="text-3xl mb-4">{s.icon}</div>
                <div className="text-sm font-semibold text-foreground mb-3">{s.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section className="border-y border-border/40 bg-muted/10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border/40">
          {stats.map((s) => (
            <div key={s.num} className="p-10 text-center">
              <div className="font-serif text-4xl md:text-5xl font-light text-primary mb-3">{s.num}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRIVACY ────────────────────────────────────────────────────────── */}
      <motion.section
        className="py-24 px-6"
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fade}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="border border-border/40 rounded-2xl p-10 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-center bg-muted/10">
            {/* Animated rings */}
            <div className="relative h-64 flex items-center justify-center">
              <div className="absolute w-48 h-48 rounded-full border border-primary/20 animate-[spin_8s_linear_infinite]" />
              <div className="absolute w-64 h-64 rounded-full border border-teal-400/10 animate-[spin_12s_linear_infinite_reverse]" />
              <div className="absolute w-36 h-36 rounded-full border border-blue-400/15 animate-[spin_6s_linear_infinite]" />
              <div className="relative z-10 w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-3xl">
                🔐
              </div>
            </div>

            <div>
              <div className="section-label mb-4">Privacy Architecture</div>
              <h3 className="font-serif text-3xl md:text-4xl font-light mb-5">
                Not a policy.<br />A{" "}
                <em className="text-primary not-italic">mathematical</em> guarantee.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Selora staff cannot read your medical records. This is not because we promise not to — it is because we are architecturally incapable of doing so. Your records are encrypted on your device before they leave it. We hold the envelope, not the contents.
              </p>
              <ul className="space-y-0">
                {[
                  "AES-256-GCM encryption — military grade, your keys only",
                  "Blockchain audit trail — every access is immutable and patient-visible",
                  "Distributed encrypted storage — no single server holds your complete record",
                  "Social recovery — lose your phone, not your history",
                  "Right to erasure — delete your data, permanently, at any time",
                  "NDPR, GDPR, and HIPAA compatible by architecture",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-muted-foreground border-b border-border/30 py-3 last:border-0"
                  >
                    <span className="shrink-0">🔒</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── EARNINGS ───────────────────────────────────────────────────────── */}
      <motion.section
        className="py-24 px-6 bg-muted/20"
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fade}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="section-label mb-5">Research Earnings</div>
          <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-5">
            Your data has always<br />been{" "}
            <em className="text-teal-400 not-italic">worth money.</em>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed mb-16">
            For the first time, that value flows to you — not to data brokers, not to pharmaceutical companies, not to tech giants. Directly to your wallet, monthly, in your local currency.
          </p>

          <div className="border border-border/40 rounded-2xl p-10 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-14 bg-background items-center">
            <div>
              <div className="font-serif text-6xl font-light text-teal-400 leading-none mb-1">₦7,400</div>
              <div className="text-sm text-muted-foreground mb-8">estimated monthly · based on complete profile</div>

              {[
                { label: "Profile completeness", val: "72%", pct: 72, grad: "from-teal-400 to-blue-400" },
                { label: "Active studies", val: "3 of 8 eligible", pct: 37, grad: "from-primary to-primary/60" },
              ].map((b) => (
                <div key={b.label} className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{b.label}</span><span>{b.val}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${b.grad}`}
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="mt-6 border border-teal-400/20 bg-teal-400/5 rounded-xl p-5 space-y-3">
                {[
                  { name: "Lagos Hypertension Study · UCH", amt: "₦3,200/mo" },
                  { name: "West Africa Genomics · Oxford", amt: "₦2,800/mo" },
                  { name: "Sickle Cell Prevalence · NIMR", amt: "₦1,400/mo" },
                ].map((study) => (
                  <div
                    key={study.name}
                    className="flex justify-between items-center text-sm border-b border-border/20 pb-3 last:border-0"
                  >
                    <span className="text-foreground">{study.name}</span>
                    <span className="font-mono-custom text-teal-400 text-xs">{study.amt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-serif text-3xl font-light mb-5">
                Paid to <em className="text-teal-400 not-italic">your wallet.</em><br />In your currency.
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Research earnings are calculated by a smart contract on the IOTA blockchain — transparent, verifiable, tamper-proof. Funds are converted and delivered to your mobile wallet monthly.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                No crypto knowledge required. More data = more eligible studies = higher monthly income.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["₦ NGN", "KES", "GHS", "£ GBP", "$ USD", "AED", "ZAR"].map((c) => (
                  <span
                    key={c}
                    className="px-3 py-1.5 rounded font-mono-custom text-xs text-teal-400 bg-teal-400/10 border border-teal-400/20"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/50">
                Paid via OPay, MTN MoMo, Airtel Money, bank transfer, or Flutterwave. No crypto wallet needed.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <motion.section
        className="py-24 px-6"
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fade}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="section-label mb-5">From the Waitlist</div>
          <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-16">
            What our early<br /><em className="text-primary not-italic">community</em> is saying.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="border border-border/40 rounded-xl p-8 hover:border-border/70 transition-colors bg-background"
              >
                <p className="font-serif italic text-lg text-foreground/85 leading-relaxed mb-8">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── ROADMAP ────────────────────────────────────────────────────────── */}
      <motion.section
        className="py-24 px-6 bg-muted/20"
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fade}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="section-label mb-5">Roadmap</div>
          <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-16">
            Where we are.<br /><em className="text-primary not-italic">Where we're going.</em>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/40 border border-border/40 rounded-xl overflow-hidden">
            {roadmapPhases.map((phase) => (
              <div
                key={phase.title}
                className={`p-8 ${
                  phase.current
                    ? "bg-background border-b-2 border-primary"
                    : "bg-muted/10"
                }`}
              >
                <div className={`font-mono-custom text-xs tracking-widest uppercase mb-4 ${phase.tagColor}`}>
                  {phase.tag}
                </div>
                <div className="text-sm font-semibold text-foreground mb-5">{phase.title}</div>
                <ul className="space-y-0">
                  {phase.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-muted-foreground border-b border-border/20 py-2 last:border-0"
                    >
                      <span className="text-primary text-base leading-none shrink-0">·</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── SURVEY SECTION ─────────────────────────────────────────────────── */}
      <motion.section
        className="py-24 px-6"
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fade}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="section-label justify-center mb-5">Shape the Future</div>
          <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-6">
            We cannot build this<br />
            <em className="text-primary not-italic">without you.</em>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-4">
            We refuse to be another tech company assuming we know what's best for your health. Before we finalise a single feature, we want to hear your story.
          </p>
          <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed mb-10">
            Tell us about your worst healthcare experiences. Tell us what "trust" means to you. Help us build a platform that actually solves the pain — not just papers over it.
          </p>
          <a
            href="https://forms.gle/5aPWX1jJiKuKJcK96"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold text-xs tracking-wider uppercase hover:opacity-90 transition-opacity"
          >
            Take the 5-Minute Survey <ArrowRight className="w-4 h-4" />
          </a>
          <p className="mt-4 text-xs text-muted-foreground/40 font-mono-custom tracking-wider">
            Anonymous · Takes under 5 minutes · Shapes what we build first
          </p>
        </div>
      </motion.section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <motion.section
        className="py-24 px-6 bg-muted/20"
        initial={reducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={fade}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="section-label mb-5">FAQs</div>
          <h2 className="font-serif text-4xl md:text-5xl font-light leading-tight mb-16">
            Frequently asked<br /><em className="text-primary not-italic">questions.</em>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border/40 rounded-xl overflow-hidden bg-background">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-muted/10 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">{faq.question}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── WAITLIST CTA ───────────────────────────────────────────────────── */}
      <WaitlistCTA />

      {/* ── SOCIAL LINKS ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-light mb-10">
            Join the <span className="text-primary">Selora</span> community.
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://x.com/selorahealth"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-4 border border-border/40 rounded-xl bg-muted/10 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <svg className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">X / Twitter</span>
            </a>
            <a
              href="https://discord.gg/XqZkcdhf2k"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-4 border border-border/40 rounded-xl bg-muted/10 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">Discord</span>
            </a>
            <a
              href="https://t.me/selorahealth"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-4 border border-border/40 rounded-xl bg-muted/10 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <Send className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">Telegram</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          <p className="text-muted-foreground text-sm">
            Built on IOTA · Encrypted by design · © {new Date().getFullYear()} Selora Health Technologies
          </p>
          <div className="flex flex-wrap gap-5 text-xs text-muted-foreground/55">
            <a href="mailto:selorahealth@gmail.com" className="hover:text-primary transition-colors">selorahealth@gmail.com</a>
            <a href="mailto:customer.selora@gmail.com" className="hover:text-primary transition-colors">customer.selora@gmail.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
