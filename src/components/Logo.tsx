‎‎import { cn } from "@/lib/utils";
‎
‎// ============================================
‎// SELORA LOGO CONFIGURATION
‎// ============================================
‎// To change the logo:
‎// 1. Replace the SVG in LogoIcon component below
‎// 2. Or import an image: import logoImage from "@/assets/logo.png"
‎// 3. Or use any icon from lucide-react
‎// ============================================
‎
‎export const LOGO_CONFIG = {
‎  text: "Selora",
‎  showGradientRing: false, // Set to false for simpler logo
‎  primaryColor: "hsl(var(--primary))",
‎  secondaryColor: "hsl(var(--secondary))",
‎};
‎
‎// Logo icon component - replace this to change the logo icon
‎const LogoIcon = ({ className }: { className?: string }) => (
‎  <img
‎    src="/logo.png"
‎    alt="Selora logo"
‎    className={cn("w-5 h-5 object-contain", className)}
‎  />
‎);
‎
‎interface LogoProps {
‎@@ -37,43 +26,19 @@
‎  size?: "sm" | "md" | "lg";
‎}
‎
‎export const Logo = ({ className, showText = true, size = "md" }: LogoProps) => {
‎  const sizeClasses = {
‎    sm: "w-8 h-8",
‎    md: "w-10 h-10",
‎    lg: "w-12 h-12",
‎  };
‎
‎  const textSizes = {
‎    sm: "text-xl",
‎    md: "text-2xl",
‎    lg: "text-3xl",
‎  };
‎
‎  return (
‎    <div className={cn("flex items-center gap-2", className)}>
‎      <div className={cn("relative", sizeClasses[size])}>
‎        {LOGO_CONFIG.showGradientRing ? (
‎          <>
‎            {/* Gradient ring */}
‎            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/80 to-secondary/60 p-[2px]">
‎              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
‎                <LogoIcon />
‎              </div>
‎            </div>
‎          </>
‎        ) : (
‎          /* Simple version */
‎          <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
‎        )}
‎      </div>
‎      {showText && (
‎        <span className={cn("font-heading font-bold tracking-tight text-primary", textSizes[size])}>
‎          {LOGO_CONFIG.text}
‎        </span>
‎      )}
‎    </div>
‎  );
‎};
