import { Logo } from "@/components/Logo";

export const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-border">|</span>
            <a
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © Selora, 2025.
          </p>
        </div>
      </div>
    </footer>
  );
};
