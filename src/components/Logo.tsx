import { cn } from "@/lib/utils";

// ============================================
// SELORA LOGO CONFIGURATION
// ============================================
// To change the logo:
// 1. Replace the image in public/logo.png
// 2. Or update the src path below
// ============================================

export const LOGO_CONFIG = {
  text: "Selora",
  showGradientRing: false,
};

// Logo icon component - uses the logo from public folder
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
}

export const Logo = ({ className, showText = true, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
        <LogoIcon className={iconSizes[size]} />
      </div>
      {showText && (
        <span className={cn("font-heading font-bold tracking-tight text-primary", textSizes[size])}>
          {LOGO_CONFIG.text}
        </span>
      )}
    </div>
  );
};
