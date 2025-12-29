import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, Wallet, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { AuthModal } from "@/components/AuthModal";

interface NavbarProps {
  onConnectWallet: () => void;
  walletAddress?: string;
}

export const Navbar = ({ onConnectWallet, walletAddress }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  const displayAddress = walletAddress || currentAccount?.address;

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnectClick = () => {
    if (currentAccount) {
      onConnectWallet();
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card px-6 py-4 flex items-center justify-between">
            <Logo />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              {displayAddress ? (
                <Button
                  variant="glass"
                  className="gap-2"
                  onClick={() => disconnect()}
                >
                  <Wallet className="w-4 h-4" />
                  {truncateAddress(displayAddress)}
                </Button>
              ) : (
                <Button
                  variant="hero"
                  onClick={handleConnectClick}
                  className="gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  Get Started
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-3">
              <ThemeToggle />
              <button
                className="p-2 hover:bg-muted rounded-lg transition-colors"
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
            {displayAddress ? (
              <Button
                variant="glass"
                className="w-full gap-2"
                onClick={() => disconnect()}
              >
                <Wallet className="w-4 h-4" />
                {truncateAddress(displayAddress)}
              </Button>
            ) : (
              <Button
                variant="hero"
                onClick={handleConnectClick}
                className="w-full gap-2"
              >
                <Rocket className="w-4 h-4" />
                Get Started
              </Button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={onConnectWallet}
      />
    </>
  );
};
