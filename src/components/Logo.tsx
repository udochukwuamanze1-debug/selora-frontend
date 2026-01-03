import { cn } from "@/lib/utils";

export const LOGO_CONFIG = {
  text: "Selora",
  showGradientRing: false,
};

const LogoIcon = ({ className }: { className?: string }) => (
  <img
    src="/logo.png"
    alt="Selora logo"
    className={cn("w-6 h-6 object-contain", className)}
  />
);

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  role?: string;
  textClassName?: string;
}

export const Logo = ({ className, showText = true, size = "md", role, textClassName }: LogoProps) => {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
        <LogoIcon className={iconSizes[size]} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-heading font-bold tracking-tight text-primary leading-tight", textSizes[size], textClassName)}>
            {LOGO_CONFIG.text}
          </span>
          {role && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              {role}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
