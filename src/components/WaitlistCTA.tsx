import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, X, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WaitlistCTAProps {
  referralCode?: string;
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function WaitlistCTA({ referralCode: initialReferralCode }: WaitlistCTAProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ email: string; referralCode: string } | null>(null);
  const [countdown] = useState({ days: "00", hours: "00", mins: "00", secs: "00" });
  const reducedMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newReferralCode = generateReferralCode();

      // Insert into database
      const { data, error } = await supabase
        .from("waitlist")
        .insert({
          email,
          referral_code: newReferralCode,
          referred_by: initialReferralCode || null,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // Duplicate email - fetch existing
          const { data: existing } = await supabase
            .from("waitlist")
            .select("referral_code")
            .eq("email", email)
            .single();

          if (existing) {
            setSuccessData({ email, referralCode: existing.referral_code });
          }
        } else {
          throw error;
        }
      } else if (data) {
        // If referred by someone, increment their count
        if (initialReferralCode) {
          try {
            await (supabase.rpc as any)("increment_referral_count", { ref_code: initialReferralCode });
          } catch {
            // Ignore referral increment errors
          }
        }
        setSuccessData({ email, referralCode: data.referral_code });
      }
    } catch (error) {
      console.error("Waitlist error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccess = () => {
    setSuccessData(null);
    setEmail("");
  };

  const copyReferralLink = () => {
    if (!successData) return;
    const link = `${window.location.origin}/waitlist?r=${successData.referralCode}`;
    navigator.clipboard.writeText(link);
  };

  return (
    <motion.section
      className="py-20 px-4 relative"
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Join Waitlist */}
          <div className="glass-card p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary font-medium">Join the Movement</span>
            </div>
            <h3 className="font-heading text-2xl md:text-3xl font-bold mb-4 text-foreground">
              Be Among the First
            </h3>
            <p className="text-muted-foreground mb-6">
              Join our waitlist and get early access to Selora when we launch. Invite friends to climb the priority list.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  {isSubmitting ? "Joining..." : (
                    <>
                      Join Waitlist
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Right - Countdown */}
          <div className="glass-card p-8 flex flex-col justify-center items-center text-center">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary font-medium">Launching Soon</span>
            </div>
            <h3 className="font-heading text-2xl md:text-3xl font-bold mb-6 text-foreground">
              Countdown to Launch
            </h3>

            <div className="grid grid-cols-4 gap-4">
              {[
                { value: countdown.days, label: "Days" },
                { value: countdown.hours, label: "Hours" },
                { value: countdown.mins, label: "Mins" },
                { value: countdown.secs, label: "Secs" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="font-heading text-2xl md:text-3xl font-bold text-primary">
                      {item.value}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-2">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successData && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md animate-fade-in">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-green-500 mb-1">You're on the list! 🎉</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Share your referral code to move up the priority list:
                </p>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-1.5 rounded-lg bg-background/50 text-foreground font-mono text-sm">
                    {successData.referralCode}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyReferralLink}>
                    Copy Link
                  </Button>
                </div>
              </div>
              <button
                onClick={closeSuccess}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}