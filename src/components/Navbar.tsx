import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Menu, X, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onConnectWallet: () => void;
  walletAddress?: string;
}

export const Navbar = ({ onConnectWallet, walletAddress }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card px-6 py-4 flex items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {walletAddress ? (
              <Button variant="glass" className="gap-2">
                <Wallet className="w-4 h-4" />
                {truncateAddress(walletAddress)}
              </Button>
            ) : (
              <Button variant="hero" onClick={onConnectWallet} className="gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <div className="flex flex-col gap-1.5">
                <span className="w-6 h-0.5 bg-foreground rounded-full" />
                <span className="w-4 h-0.5 bg-foreground rounded-full" />
                <span className="w-6 h-0.5 bg-foreground rounded-full" />
              </div>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden absolute left-4 right-4 top-full mt-2 glass-card p-4 transition-all duration-300",
            isMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          )}
        >
          {walletAddress ? (
            <Button variant="glass" className="w-full gap-2">
              <Wallet className="w-4 h-4" />
              {truncateAddress(walletAddress)}
            </Button>
          ) : (
            <Button variant="hero" onClick={onConnectWallet} className="w-full gap-2">
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
