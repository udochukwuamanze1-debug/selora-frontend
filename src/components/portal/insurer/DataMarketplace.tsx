import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Database, Lock, Users, Calendar, ShoppingCart, Eye, Shield } from "lucide-react";
import { toast } from "sonner";

const datasets = [
  {
    id: "1",
    name: "Chronic Disease Patterns 2024",
    description: "Anonymized dataset of chronic disease trends across 50,000+ patients",
    dataPoints: 125000,
    price: "2,500 SUI",
    contributors: 842,
    lastUpdated: "2024-01-15",
    categories: ["Chronic", "Trends", "Demographics"],
    consentRate: 94,
  },
  {
    id: "2",
    name: "Preventive Care Outcomes",
    description: "Effectiveness analysis of preventive care interventions",
    dataPoints: 78000,
    price: "1,800 SUI",
    contributors: 521,
    lastUpdated: "2024-01-12",
    categories: ["Preventive", "Outcomes", "Interventions"],
    consentRate: 98,
  },
  {
    id: "3",
    name: "Mental Health Demographics",
    description: "Regional mental health service utilization patterns",
    dataPoints: 45000,
    price: "1,200 SUI",
    contributors: 334,
    lastUpdated: "2024-01-10",
    categories: ["Mental Health", "Regional", "Utilization"],
    consentRate: 91,
  },
  {
    id: "4",
    name: "Emergency Response Times",
    description: "Analysis of emergency service response and outcome correlation",
    dataPoints: 92000,
    price: "3,200 SUI",
    contributors: 1205,
    lastUpdated: "2024-01-08",
    categories: ["Emergency", "Response", "Outcomes"],
    consentRate: 87,
  },
];

export const DataMarketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const filteredDatasets = datasets.filter(
    (dataset) =>
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.categories.some((cat) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handlePurchase = async (datasetId: string) => {
    setPurchasing(datasetId);
    // Simulate purchase
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("Dataset access granted! Check your downloads.");
    setPurchasing(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          Data Marketplace
        </h1>
        <p className="text-muted-foreground">
          Access anonymized, consent-verified health datasets for risk analysis
        </p>
      </div>

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

      {/* Dataset Grid */}
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
                <Button
                  size="sm"
                  onClick={() => handlePurchase(dataset.id)}
                  disabled={purchasing === dataset.id}
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {purchasing === dataset.id ? "Processing..." : "Purchase"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 text-center">
          <Users className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">2,902</p>
          <p className="text-sm text-muted-foreground">Total Contributors</p>
        </div>
        <div className="glass-card p-5 text-center">
          <Database className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">340K+</p>
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
