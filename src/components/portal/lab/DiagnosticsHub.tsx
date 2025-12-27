import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Check, 
  X, 
  Clock, 
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

type PrescriptionStatus = "pending" | "processing" | "ready" | "completed" | "rejected";

interface Prescription {
  id: string;
  patientAddress: string;
  doctorAddress: string;
  medication: string;
  dosage: string;
  frequency: string;
  status: PrescriptionStatus;
  createdAt: string;
  paid: boolean;
}

const mockPrescriptions: Prescription[] = [
  {
    id: "RX-001",
    patientAddress: "0x7a3b...9c4d",
    doctorAddress: "0x1234...5678",
    medication: "Amoxicillin",
    dosage: "500mg",
    frequency: "Three times daily",
    status: "pending",
    createdAt: "2024-01-15 10:30",
    paid: true,
  },
  {
    id: "RX-002",
    patientAddress: "0x8b4c...2e5f",
    doctorAddress: "0x1234...5678",
    medication: "Ibuprofen",
    dosage: "400mg",
    frequency: "As needed",
    status: "processing",
    createdAt: "2024-01-15 09:15",
    paid: true,
  },
  {
    id: "RX-003",
    patientAddress: "0x9c5d...3f6a",
    doctorAddress: "0x5678...9abc",
    medication: "Omeprazole",
    dosage: "20mg",
    frequency: "Once daily",
    status: "ready",
    createdAt: "2024-01-14 16:45",
    paid: true,
  },
  {
    id: "RX-004",
    patientAddress: "0x2d6e...4a7b",
    doctorAddress: "0x1234...5678",
    medication: "Metformin",
    dosage: "850mg",
    frequency: "Twice daily",
    status: "pending",
    createdAt: "2024-01-15 11:00",
    paid: false,
  },
  {
    id: "RX-005",
    patientAddress: "0x3e7f...5b8c",
    doctorAddress: "0x9abc...def0",
    medication: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    status: "completed",
    createdAt: "2024-01-13 14:20",
    paid: true,
  },
];

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-500/10 text-blue-600", icon: Clock },
  ready: { label: "Ready", color: "bg-green-500/10 text-green-600", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-muted text-muted-foreground", icon: Check },
  rejected: { label: "Rejected", color: "bg-red-500/10 text-red-600", icon: X },
};

export const DiagnosticsHub = () => {
  const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<PrescriptionStatus | "all">("all");

  const filteredPrescriptions = prescriptions.filter((p) => {
    const matchesSearch = 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.medication.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = (id: string, newStatus: PrescriptionStatus) => {
    setPrescriptions(prev => 
      prev.map(p => p.id === id ? { ...p, status: newStatus } : p)
    );
  };

  const stats = {
    pending: prescriptions.filter(p => p.status === "pending").length,
    processing: prescriptions.filter(p => p.status === "processing").length,
    ready: prescriptions.filter(p => p.status === "ready").length,
    completed: prescriptions.filter(p => p.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          Diagnostics Hub
        </h1>
        <p className="text-muted-foreground">
          Manage prescription fulfillment and diagnostics
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
          <p className="text-sm text-muted-foreground">Processing</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
          <p className="text-sm text-muted-foreground">Ready</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-muted-foreground">{stats.completed}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "processing", "ready", "completed"] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Medication</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Patient</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Payment</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.map((rx) => {
                const StatusIcon = statusConfig[rx.status].icon;
                return (
                  <tr key={rx.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium text-foreground font-mono">{rx.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{rx.medication}</p>
                        <p className="text-xs text-muted-foreground">{rx.dosage} • {rx.frequency}</p>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground font-mono text-sm">{rx.patientAddress}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full ${statusConfig[rx.status].color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[rx.status].label}
                      </span>
                    </td>
                    <td className="p-4">
                      {rx.paid ? (
                        <span className="text-green-600 text-sm flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Paid
                        </span>
                      ) : (
                        <span className="text-yellow-600 text-sm flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {rx.status === "pending" && rx.paid && (
                          <Button size="sm" onClick={() => handleStatusChange(rx.id, "processing")}>
                            Start
                          </Button>
                        )}
                        {rx.status === "processing" && (
                          <Button size="sm" onClick={() => handleStatusChange(rx.id, "ready")}>
                            Ready
                          </Button>
                        )}
                        {rx.status === "ready" && (
                          <Button size="sm" onClick={() => handleStatusChange(rx.id, "completed")}>
                            Complete
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <FileText className="w-4 h-4" />
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
