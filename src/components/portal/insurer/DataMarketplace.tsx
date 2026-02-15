import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Database, Lock, Users, Calendar, ShoppingCart, Eye, Shield, Plus } from "lucide-react";
import { toast } from "sonner";

interface Dataset {
  id: string;
  name: string;
  description: string;
  dataPoints: number;
  price: string;
  contributors: number;
  lastUpdated: string;
  categories: string[];
  consentRate: number;
  createdBy: string;
}

interface DataMarketplaceProps {
  isNewUser?: boolean;
}

export const DataMarketplace = ({ isNewUser = false }: DataMarketplaceProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [purchasedDatasets, setPurchasedDatasets] = useState<string[]>([]);

  // Load user-created datasets from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("selora_marketplace_datasets");
    if (stored) {
      setDatasets(JSON.parse(stored));
    }
    
    const purchased = localStorage.getItem("selora_purchased_datasets");
    if (purchased) {
      setPurchasedDatasets(JSON.parse(purchased));
    }
  }, []);

  const filteredDatasets = datasets.filter(
    (dataset) =>
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.categories.some((cat) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handlePurchase = async (datasetId: string) => {
    setPurchasing(datasetId);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const newPurchased = [...purchasedDatasets, datasetId];
    setPurchasedDatasets(newPurchased);
    localStorage.setItem("selora_purchased_datasets", JSON.stringify(newPurchased));
    
    toast.success("Dataset access granted! Check your downloads.");
    setPurchasing(null);
  };

  const totalContributors = datasets.reduce((sum, d) => sum + d.contributors, 0);
  const totalDataPoints = datasets.reduce((sum, d) => sum + d.dataPoints, 0);

  return (
    <div className="space-y-6">

      {/* Privacy Notice */}
      <div className="glass-card p-4 bg-primary/5 border-primary/20 flex items-start gap-3">
        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-foreground mb-1">Privacy-First Data</h4>
          <p className="text-sm text-muted-foreground">
            All datasets are fully anonymized using differential privacy techniques. 
            Contributors have explicitly consented to data sharing and receive compensation.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search datasets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Dataset Grid or Empty State */}
      {filteredDatasets.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading text-xl font-semibold mb-2 text-foreground">
            No Datasets Available
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            {searchQuery 
              ? `No datasets match "${searchQuery}". Try a different search.`
              : "Datasets will appear here when researchers and patients contribute anonymized health data through their portals."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDatasets.map((dataset) => (
            <div key={dataset.id} className="glass-card p-6 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {dataset.consentRate}% Consent Rate
                </Badge>
              </div>

              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                {dataset.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                {dataset.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {dataset.categories.map((cat) => (
                  <Badge key={cat} variant="outline" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {(dataset.dataPoints / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-muted-foreground">Data Points</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{dataset.contributors}</p>
                  <p className="text-xs text-muted-foreground">Contributors</p>
                </div>
                <div className="flex flex-col items-center">
                  <Lock className="w-4 h-4 text-green-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Encrypted</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <p className="text-lg font-bold text-primary">{dataset.price}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Updated {dataset.lastUpdated}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  {purchasedDatasets.includes(dataset.id) ? (
                    <Button size="sm" variant="secondary" disabled>
                      Purchased
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handlePurchase(dataset.id)}
                      disabled={purchasing === dataset.id}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {purchasing === dataset.id ? "Processing..." : "Purchase"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalContributors || 0}</p>
          <p className="text-sm text-muted-foreground">Total Contributors</p>
        </div>
        <div className="glass-card p-5 text-center">
          <Database className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {totalDataPoints > 0 ? `${(totalDataPoints / 1000).toFixed(0)}K+` : "0"}
          </p>
          <p className="text-sm text-muted-foreground">Data Points Available</p>
        </div>
        <div className="glass-card p-5 text-center">
          <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">100%</p>
          <p className="text-sm text-muted-foreground">Consent Verified</p>
        </div>
      </div>
    </div>
  );
};
