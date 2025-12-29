import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, differenceInDays, isThisWeek } from "date-fns";
import { toast } from "sonner";

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

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/health-assistant`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  setMessages((prev) => {
                    const last = prev[prev.length - 1];
                    if (last?.role === "assistant" && last.id !== "welcome") {
                      return prev.map((m, i) =>
                        i === prev.length - 1 ? { ...m, content: assistantContent } : m
                      );
                    }
                    return [...prev, {
                      id: (Date.now() + 1).toString(),
                      role: "assistant",
                      content: assistantContent,
                      timestamp: new Date(),
                    }];
                  });
                }
              } catch {}
            }
          }
        }
      }
    } catch (error) {
      toast.error("Failed to get response. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
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
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    )}>
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
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1"
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
            <Sparkles className="w-3 h-3" /> Powered by Gemini 2.5 Flash
          </p>
          <p className="text-xs text-muted-foreground">
            ⚠️ AI responses may be inaccurate. Always verify important information.
          </p>
          <p className="text-xs text-muted-foreground">
            © 2025, Selora. <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, <a href="/terms" className="text-primary hover:underline">Terms of Use</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
