import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Minus, 
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  lastRestocked: string;
  expiresAt: string;
}

const mockInventory: InventoryItem[] = [
  {
    id: "INV-001",
    name: "Amoxicillin 500mg",
    category: "Antibiotics",
    quantity: 150,
    minStock: 50,
    unit: "capsules",
    lastRestocked: "2024-01-10",
    expiresAt: "2025-06-15",
  },
  {
    id: "INV-002",
    name: "Ibuprofen 400mg",
    category: "Pain Relief",
    quantity: 320,
    minStock: 100,
    unit: "tablets",
    lastRestocked: "2024-01-12",
    expiresAt: "2025-08-20",
  },
  {
    id: "INV-003",
    name: "Omeprazole 20mg",
    category: "Gastrointestinal",
    quantity: 45,
    minStock: 60,
    unit: "capsules",
    lastRestocked: "2024-01-05",
    expiresAt: "2025-04-10",
  },
  {
    id: "INV-004",
    name: "Metformin 850mg",
    category: "Diabetes",
    quantity: 200,
    minStock: 80,
    unit: "tablets",
    lastRestocked: "2024-01-14",
    expiresAt: "2025-09-30",
  },
  {
    id: "INV-005",
    name: "Lisinopril 10mg",
    category: "Cardiovascular",
    quantity: 25,
    minStock: 40,
    unit: "tablets",
    lastRestocked: "2024-01-08",
    expiresAt: "2025-05-25",
  },
  {
    id: "INV-006",
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    quantity: 500,
    minStock: 150,
    unit: "tablets",
    lastRestocked: "2024-01-15",
    expiresAt: "2026-01-15",
  },
];

interface InventoryManagementProps {
  isNewUser?: boolean;
}

export const InventoryManagement = ({ isNewUser = false }: InventoryManagementProps) => {
  const [inventory, setInventory] = useState(mockInventory);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = inventory.filter(item => item.quantity < item.minStock);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const adjustQuantity = (id: string, delta: number) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          Inventory & Prescriptions
        </h1>
        <p className="text-muted-foreground">
          Manage medication stock and track inventory levels
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalItems.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Items</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{inventory.length}</p>
          <p className="text-sm text-muted-foreground">Products</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</p>
          <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="glass-card p-4 border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-1">Low Stock Alert</h4>
              <p className="text-sm text-muted-foreground">
                {lowStockItems.map(item => item.name).join(", ")} are below minimum stock levels.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Inventory Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Quantity</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Expires</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => {
                const isLowStock = item.quantity < item.minStock;
                return (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.id}</p>
                    </td>
                    <td className="p-4 text-muted-foreground">{item.category}</td>
                    <td className="p-4">
                      <span className={isLowStock ? "text-yellow-600 font-medium" : "text-foreground"}>
                        {item.quantity} {item.unit}
                      </span>
                      <p className="text-xs text-muted-foreground">Min: {item.minStock}</p>
                    </td>
                    <td className="p-4">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-500/10 text-yellow-600">
                          <TrendingDown className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-600">
                          <TrendingUp className="w-3 h-3" /> In Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">{item.expiresAt}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => adjustQuantity(item.id, -10)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => adjustQuantity(item.id, 10)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
