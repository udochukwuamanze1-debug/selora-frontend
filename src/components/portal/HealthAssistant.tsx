import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles } from "lucide-react";
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

// FAQ responses for common questions
const FAQ_RESPONSES: Record<string, string> = {
  "wallet": "Your wallet address is displayed in the sidebar and at the top right of the dashboard. You can click on it to copy the full address.",
  "theme": "You can change the appearance (Light, Dim, or Dark mode) in the 'Profile & Preferences' tab under the 'Appearance' section.",
  "vault": "The Vault is your secure, encrypted storage for files, images, and documents. Everything you upload is encrypted and stored on-chain, linked to your identity.",
  "prescriptions": "The Prescriptions tab shows all your medication history and active prescriptions. You can pay for prescriptions using SUI tokens.",
  "balance": "Your SUI balance is shown in the top bar next to your wallet address. The dark box shows your current balance.",
  "upload": "To upload files, go to the Vault tab and either drag & drop files or click the upload area. Files are encrypted before being stored.",
  "privacy": "Selora uses client-side encryption — your data is encrypted before it leaves your device. Only you control the keys.",
  "avatar": "Your Selora Avatar is your on-chain identity for consent management. It's minted when you first connect to the platform.",
  "exchange": "The Data Exchange allows you to share anonymized health data with researchers in exchange for rewards.",
  "help": "I can help you navigate the app, understand features, and answer questions about your health data. Just ask me anything!",
};

const findFAQResponse = (query: string): string | null => {
  const lowerQuery = query.toLowerCase();
  for (const [keyword, response] of Object.entries(FAQ_RESPONSES)) {
    if (lowerQuery.includes(keyword)) {
      return response;
    }
  }
  return null;
};

const formatMessageDate = (date: Date): string => {
  if (isToday(date)) {
    return format(date, "EEEE"); // "Monday"
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  if (isThisWeek(date)) {
    return format(date, "EEEE"); // "Monday"
  }
  if (differenceInDays(new Date(), date) <= 7) {
    return format(date, "EEEE"); // "Monday"
  }
  return format(date, "EEEE MM/dd/yyyy"); // "Monday 01/15/2025"
};

const shouldShowDateSeparator = (current: Message, previous?: Message): boolean => {
  if (!previous) return true;
  const currentDate = format(current.timestamp, "yyyy-MM-dd");
  const previousDate = format(previous.timestamp, "yyyy-MM-dd");
  return currentDate !== previousDate;
};

export const HealthAssistant = ({ walletAddress }: HealthAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your Health Guide assistant. I can help you navigate Selora, understand features, and answer questions about managing your health data. What would you like to know?",
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

    // Check FAQ first
    const faqResponse = findFAQResponse(input);
    
    // Simulate AI response with FAQ or generic response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: faqResponse || "I understand you're asking about that. Let me help you — you can explore the sidebar menu to find different features like Health Archive, Vault, Prescriptions, and more. If you have specific questions, feel free to ask about wallet, theme, uploads, privacy, or any feature!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold">Health Guide</h2>
            <p className="text-sm text-muted-foreground">Your AI-powered assistant</p>
          </div>
        </div>

        {/* Chat Container */}
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
                  <div
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
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
              {isLoading && (
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

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center space-y-2">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Powered by Gemini 1.5
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            ⚠️ AI responses may be inaccurate. Always verify important information.
          </p>
          <p className="text-xs text-muted-foreground">
            © 2025, Selora.{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>,{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Use</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
