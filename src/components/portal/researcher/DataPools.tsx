import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Database, Users, Lock, CheckCircle, Clock, Plus } from "lucide-react";
import { toast } from "sonner";

interface DataPool {
  id: string;
  name: string;
  description: string;
  size: string;
  contributors: number;
  accessLevel: "approved" | "pending" | "restricted";
  categories: string[];
  qualityScore: number;
}

interface DataPoolsProps {
  isNewUser?: boolean;
  walletAddress?: string;
}

export const DataPools = ({ isNewUser = false, walletAddress = "" }: DataPoolsProps) => {
  const [dataPools, setDataPools] = useState<DataPool[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load data pools from localStorage
  useEffect(() => {
    if (walletAddress) {
      const stored = localStorage.getItem(`selora_data_pools_${walletAddress}`);
      if (stored) {
        try {
          setDataPools(JSON.parse(stored));
        } catch {
          setDataPools([]);
        }
      }
    }
  }, [walletAddress]);

  // Save data pools to localStorage
  useEffect(() => {
    if (walletAddress && dataPools.length > 0) {
      localStorage.setItem(`selora_data_pools_${walletAddress}`, JSON.stringify(dataPools));
    }
  }, [dataPools, walletAddress]);

  const filteredPools = dataPools.filter(
    (pool) =>
      pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pool.categories.some((cat) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const getAccessIcon = (level: string) => {
    switch (level) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "restricted":
        return <Lock className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getAccessLabel = (level: string) => {
    switch (level) {
      case "approved":
        return "Access Granted";
      case "pending":
        return "Pending Approval";
      case "restricted":
        return "Request Required";
      default:
        return level;
    }
  };

  const handleRequestAccess = (poolId: string) => {
    setDataPools(prev =>
      prev.map(pool =>
        pool.id === poolId ? { ...pool, accessLevel: "pending" as const } : pool
      )
    );
    toast.success("Access request submitted. You'll be notified when approved.");
  };

  const createNewPool = () => {
    const newPool: DataPool = {
      id: `pool-${Date.now()}`,
      name: "New Data Pool",
      description: "Description of your data pool",
      size: "0 records",
      contributors: 0,
      accessLevel: "approved",
      categories: ["Custom"],
      qualityScore: 0,
    };
    setDataPools(prev => [...prev, newPool]);
    toast.success("New data pool created!");
  };

  if (dataPools.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
            Data Pools
          </h1>
          <p className="text-muted-foreground">
            Browse and request access to consented research datasets
          </p>
        </div>

        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading text-xl font-semibold mb-2 text-foreground">
            No Data Pools Available
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Data pools will appear here when patients consent to share their anonymized health data for research.
            Create your first data pool to start collecting research data.
          </p>
          <Button onClick={createNewPool}>
            <Plus className="w-4 h-4 mr-2" />
            Create Data Pool
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          Data Pools
        </h1>
        <p className="text-muted-foreground">
          Browse and request access to consented research datasets
        </p>
      </div>

      {/* Search & Create */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search data pools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={createNewPool}>
          <Plus className="w-4 h-4 mr-2" />
          Create Pool
        </Button>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPools.map((pool) => (
          <div key={pool.id} className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                {getAccessIcon(pool.accessLevel)}
                <span className="text-muted-foreground">{getAccessLabel(pool.accessLevel)}</span>
              </div>
            </div>

            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
              {pool.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {pool.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {pool.categories.map((cat) => (
                <Badge key={cat} variant="outline" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{pool.size}</p>
                <p className="text-xs text-muted-foreground">Records</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{pool.contributors.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Contributors</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{pool.qualityScore}%</p>
                <p className="text-xs text-muted-foreground">Quality Score</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border/50">
              {pool.accessLevel === "approved" ? (
                <Button className="flex-1">Access Data</Button>
              ) : pool.accessLevel === "pending" ? (
                <Button variant="outline" className="flex-1" disabled>
                  <Clock className="w-4 h-4 mr-2" />
                  Awaiting Approval
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleRequestAccess(pool.id)}
                >
                  Request Access
                </Button>
              )}
              <Button variant="ghost">Details</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="glass-card p-6">
        <h3 className="font-heading text-lg font-semibold mb-4 text-foreground">Pool Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xl font-bold text-foreground">
              {dataPools.reduce((sum, p) => sum + p.contributors, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total Contributors</p>
          </div>
          <div>
            <Database className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xl font-bold text-foreground">{dataPools.length}</p>
            <p className="text-sm text-muted-foreground">Data Pools</p>
          </div>
          <div>
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-foreground">100%</p>
            <p className="text-sm text-muted-foreground">Consent Verified</p>
          </div>
          <div>
            <Lock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xl font-bold text-foreground">AES-256</p>
            <p className="text-sm text-muted-foreground">Encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
};
