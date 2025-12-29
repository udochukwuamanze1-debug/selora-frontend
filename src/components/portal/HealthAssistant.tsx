import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, differenceInDays, isThisWeek } from "date-fns";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface HealthAssistantProps {
  walletAddress: string;
}

const formatMessageDate = (date: Date): string => {
  if (isToday(date)) return format(date, "EEEE");
  if (isYesterday(date)) return "Yesterday";
  if (isThisWeek(date)) return format(date, "EEEE");
  if (differenceInDays(new Date(), date) <= 7) return format(date, "EEEE");
  return format(date, "EEEE MM/dd/yyyy");
};

const shouldShowDateSeparator = (current: Message, previous?: Message): boolean => {
  if (!previous) return true;
  return format(current.timestamp, "yyyy-MM-dd") !== format(previous.timestamp, "yyyy-MM-dd");
};

// Pre-baked local knowledge base for Selora AI
const LOCAL_KNOWLEDGE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["upload", "file", "record", "health archive"],
    answer:
      "To upload a health record, go to the **Health Archive** tab and click the **Upload New Record** button. Your files are encrypted client-side with AES-256 before being stored on Walrus decentralized storage, so only you hold the keys.",
  },
  {
    keywords: ["vault", "secure", "encrypt", "storage"],
    answer:
      "The **Secure Vault** is your encrypted file storage. Drag-and-drop or browse to add files. Each file is encrypted with AES-256 before upload to Walrus. You can filter by category and toggle between grid/list views.",
  },
  {
    keywords: ["prescription", "medication", "pay"],
    answer:
      "The **Prescriptions** tab shows prescriptions issued to your wallet by doctors. You can view status (Pending, Ready, Completed) and pay directly with Sui or card. No prescriptions appear until a doctor sends one to your address.",
  },
  {
    keywords: ["data exchange", "stake", "reward", "share"],
    answer:
      "In **Data Exchange** you can stake anonymized datasets for research or insurance pools and earn Selora Points. Your rewards and staked datasets show up once you participate in an opportunity.",
  },
  {
    keywords: ["coverage", "analytics", "protection"],
    answer:
      "**Coverage & Protection** shows analytics: total uploads, transactions, active connections, storage used, and a detailed activity log of your actions across all portals.",
  },
  {
    keywords: ["care network", "doctor", "find", "nearby"],
    answer:
      "Use **Care Network** to find nearby doctors. Enable location access to filter providers within a 2-mile radius. You can search by name or specialty and request appointments directly.",
  },
  {
    keywords: ["trusted contact", "guardian", "permission", "access"],
    answer:
      "In **Trusted Contacts** you can add guardians (family, doctors) and control what they can do: view records, request access, or receive prescription updates. Permissions are stored locally and can be changed anytime.",
  },
  {
    keywords: ["wallet", "connect", "sui"],
    answer:
      "Selora uses Sui wallets for authentication. Click **Get Started** to connect via browser extension or mobile wallet. You can also sign in with Google using zkLogin (requires configuration).",
  },
  {
    keywords: ["zklogin", "google", "sign in"],
    answer:
      "zkLogin lets you sign in with Google without exposing your email. It requires setting up Google OAuth credentials and a ZK prover endpoint. Contact support or check the documentation for setup steps.",
  },
  {
    keywords: ["notification", "alert"],
    answer:
      "Notifications appear in the bell icon at the top of the dashboard. You'll receive alerts for prescription updates, access requests, and important account events. These are stored locally.",
  },
  {
    keywords: ["privacy", "security", "encrypt"],
    answer:
      "Selora encrypts your data client-side before it ever leaves your device. Keys are derived from your wallet, so only you can decrypt. We never see your plaintext files.",
  },
];

function findLocalAnswer(query: string): string {
  const q = query.toLowerCase();
  for (const entry of LOCAL_KNOWLEDGE) {
    if (entry.keywords.some((kw) => q.includes(kw))) {
      return entry.answer;
    }
  }
  return "I'm not sure about that. Try asking about uploading records, the Vault, prescriptions, data exchange, care network, trusted contacts, or security.";
}

export const HealthAssistant = ({ walletAddress }: HealthAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm Selora AI. I can help you navigate Selora, understand features, and answer questions about managing your health data. What would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate typing delay then respond with local knowledge
    await new Promise((r) => setTimeout(r, 600));

    const answer = findLocalAnswer(userMessage.content);

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      },
    ]);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full border border-border bg-muted/30 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Selora logo" className="w-5 h-5 object-contain" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">Selora AI</h2>
            <p className="text-sm text-muted-foreground">Your AI-powered assistant</p>
          </div>
        </div>

        <div className="border border-border rounded-xl overflow-hidden bg-background/50">
          <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={message.id}>
                  {shouldShowDateSeparator(message, messages[index - 1]) && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {formatMessageDate(message.timestamp)}
                      </span>
                    </div>
                  )}
                  <div className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full border border-border bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src="/logo.png" alt="Selora logo" className="w-4 h-4 object-contain" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[65%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {message.content}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex gap-3 justify-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask Selora AI..."
                className="flex-1 max-w-[520px]"
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="bg-primary">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center space-y-2">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3" /> Local knowledge base (no API required)
          </p>
          <p className="text-xs text-muted-foreground">
            © 2025, Selora. <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, <a href="/terms" className="text-primary hover:underline">Terms of Use</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
