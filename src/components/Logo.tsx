import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo = ({ className, showText = true }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative w-10 h-10">
        {/* Outer ring with gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary opacity-20 blur-sm" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/80 to-secondary/60 p-[2px]">
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
            {/* Inner S shape */}
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 6C17 6 15 4 12 4C9 4 7 6 7 8C7 10 9 11 12 12C15 13 17 14 17 16C17 18 15 20 12 20C9 20 7 18 7 18" />
            </svg>
          </div>
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-50 animate-pulse-glow" />
      </div>
      {showText && (
        <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Selora
        </span>
      )}
    </div>
  );
};
