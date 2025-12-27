import { cn } from "@/lib/utils";
import logoImage from "../logo.png";

// ============================================
// SELORA LOGO CONFIGURATION
// ============================================

export const LOGO_CONFIG = {
  text: "Selora",
  showGradientRing: true, // Set to false for simpler logo
  primaryColor: "hsl(var(--primary))",
  secondaryColor: "hsl(var(--secondary))",
};

// Logo icon component - replace this to change the logo icon
const LogoIcon = ({ className }: { className?: string }) => (
  <img
    src={logoImage}
    alt="Selora logo"
  />
);

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className, showText = false, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
            <LogoIcon />
          </div>
    </div>
  );
};
