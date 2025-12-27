import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Database, Users, Lock, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const dataPools = [
  {
    id: "1",
    name: "General Health Demographics",
    description: "Anonymized demographic and general health indicators",
    size: "45,000 records",
    contributors: 8420,
    accessLevel: "approved",
    categories: ["Demographics", "General Health"],
    qualityScore: 94,
  },
  {
    id: "2",
    name: "Chronic Conditions Registry",
    description: "Longitudinal data on chronic disease management",
    size: "28,000 records",
    contributors: 4200,
    accessLevel: "pending",
    categories: ["Chronic Disease", "Longitudinal"],
    qualityScore: 97,
  },
  {
    id: "3",
    name: "Mental Health Indicators",
    description: "Mental health screening and treatment outcomes",
    size: "15,000 records",
    contributors: 2100,
    accessLevel: "approved",
    categories: ["Mental Health", "Outcomes"],
    qualityScore: 91,
  },
  {
    id: "4",
    name: "Pediatric Health Data",
    description: "Child health metrics and development indicators",
    size: "32,000 records",
    contributors: 5600,
    accessLevel: "restricted",
    categories: ["Pediatric", "Development"],
    qualityScore: 96,
  },
];

export const DataPools = () => {
  const [searchQuery, setSearchQuery] = useState("");

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
    toast.success("Access request submitted. You'll be notified when approved.");
  };

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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search data pools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
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
            <p className="text-xl font-bold text-foreground">20,320</p>
            <p className="text-sm text-muted-foreground">Total Contributors</p>
          </div>
          <div>
            <Database className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-xl font-bold text-foreground">120K</p>
            <p className="text-sm text-muted-foreground">Total Records</p>
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
