import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, FileText, Shield } from "lucide-react";

const mockPatients = [
  {
    id: "1842",
    address: "0x7a3b...9c4d",
    lastVisit: "2024-01-15",
    recordCount: 12,
    sharedRecords: 8,
    status: "active",
  },
  {
    id: "2391",
    address: "0x8b4c...2e5f",
    lastVisit: "2024-01-14",
    recordCount: 7,
    sharedRecords: 5,
    status: "pending",
  },
  {
    id: "1567",
    address: "0x9c5d...3f6a",
    lastVisit: "2024-01-13",
    recordCount: 23,
    sharedRecords: 15,
    status: "active",
  },
  {
    id: "3102",
    address: "0x2d6e...4a7b",
    lastVisit: "2024-01-12",
    recordCount: 4,
    sharedRecords: 4,
    status: "active",
  },
  {
    id: "2845",
    address: "0x3e7f...5b8c",
    lastVisit: "2024-01-10",
    recordCount: 16,
    sharedRecords: 10,
    status: "inactive",
  },
];

export const PatientInsights = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const filteredPatients = mockPatients.filter(
    (p) =>
      p.id.includes(searchQuery) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          Patient Insights
        </h1>
        <p className="text-muted-foreground">
          View and manage patient records with granted access
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient ID or wallet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Patient ID
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Wallet
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Last Visit
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Records
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4 font-medium text-foreground">#{patient.id}</td>
                  <td className="p-4 text-muted-foreground font-mono text-sm">
                    {patient.address}
                  </td>
                  <td className="p-4 text-muted-foreground">{patient.lastVisit}</td>
                  <td className="p-4">
                    <span className="text-foreground">{patient.sharedRecords}</span>
                    <span className="text-muted-foreground">/{patient.recordCount}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        patient.status === "active"
                          ? "bg-green-500/10 text-green-600"
                          : patient.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Shield className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Access Notice */}
      <div className="glass-card p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <Shield className="w-4 h-4 inline mr-2 text-primary" />
          You can only view records that patients have explicitly shared with you. All access is logged and auditable.
        </p>
      </div>
    </div>
  );
};
