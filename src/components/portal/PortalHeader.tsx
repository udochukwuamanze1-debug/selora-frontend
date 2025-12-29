import { PortalSearch } from "./PortalSearch";
import { NotificationBell } from "./NotificationBell";
import { WalletAddress } from "./WalletAddress";
import { WalletBalance } from "./WalletBalance";

interface PortalHeaderProps {
  title: string;
  subtitle?: string;
  walletAddress: string;
  onSearch?: (query: string) => void;
}

export const PortalHeader = ({
  title,
  subtitle,
  walletAddress,
  onSearch,
}: PortalHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <PortalSearch 
            placeholder="Search..." 
            onSearch={onSearch}
            className="w-48 md:w-64"
          />
          <NotificationBell />
          <WalletAddress address={walletAddress} />
          <WalletBalance />
        </div>
      </div>
    </div>
  );
};
