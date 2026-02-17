import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Pill,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Shield,
  FileText,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface PrescriptionRow {
  id: string;
  doctor_address: string;
  doctor_name: string;
  patient_address: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  pharmacy_name: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  blob_id: string | null;
  tx_digest: string | null;
}

interface PrescriptionsProps {
  walletAddress?: string;
}

export const Prescriptions = ({ walletAddress }: PrescriptionsProps) => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState<string | null>(null);

  const fetchPrescriptions = async () => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_address", walletAddress)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPrescriptions(data as PrescriptionRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [walletAddress]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "paid":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "fulfilled":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "paid":
        return "Paid";
      case "fulfilled":
        return "Completed";
      default:
        return status;
    }
  };

  const getFrequencyLabel = (freq: string) => {
    const map: Record<string, string> = {
      once: "Once daily",
      twice: "Twice daily",
      three: "Three times daily",
      asneeded: "As needed",
    };
    return map[freq] || freq;
  };

  const viewPrescription = prescriptions.find((p) => p.id === viewModal);

  const pendingCount = prescriptions.filter((p) => p.status === "pending").length;
  const paidCount = prescriptions.filter((p) => p.status === "paid").length;
  const fulfilledCount = prescriptions.filter((p) => p.status === "fulfilled").length;

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading prescriptions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button variant="glass" className="gap-2" onClick={fetchPrescriptions}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-heading font-bold text-yellow-500">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-heading font-bold text-blue-500">{paidCount}</p>
          <p className="text-sm text-muted-foreground">Paid</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-heading font-bold text-green-500">{fulfilledCount}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
      </div>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-semibold text-lg">No prescriptions yet</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Once a doctor issues prescriptions to your wallet, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="glass-card p-4 hover:border-primary/20 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{rx.medication}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {rx.doctor_name} • {rx.dosage} • {getFrequencyLabel(rx.frequency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(rx.status)}
                    <span className="text-sm">{getStatusLabel(rx.status)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(rx.created_at), "MMM d, yyyy")}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setViewModal(rx.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Prescription Modal */}
      <Dialog open={!!viewModal} onOpenChange={() => setViewModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>Issued by your doctor</DialogDescription>
          </DialogHeader>
          {viewPrescription && (
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medication</span>
                  <span className="font-medium">{viewPrescription.medication}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dosage</span>
                  <span className="font-medium">{viewPrescription.dosage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frequency</span>
                  <span className="font-medium">{getFrequencyLabel(viewPrescription.frequency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{viewPrescription.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prescriber</span>
                  <span className="font-medium">{viewPrescription.doctor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={viewPrescription.status === "fulfilled" ? "default" : "outline"}>
                    {getStatusLabel(viewPrescription.status)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{format(new Date(viewPrescription.created_at), "MMM d, yyyy")}</span>
                </div>
                {viewPrescription.pharmacy_name && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pharmacy</span>
                    <span className="font-medium">{viewPrescription.pharmacy_name}</span>
                  </div>
                )}
                {viewPrescription.notes && (
                  <div>
                    <span className="text-muted-foreground text-sm">Notes</span>
                    <p className="text-sm mt-1 bg-muted/50 p-3 rounded-lg">{viewPrescription.notes}</p>
                  </div>
                )}
                {viewPrescription.tx_digest && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">On-chain TX</span>
                    <span className="font-mono text-xs">
                      {viewPrescription.tx_digest.slice(0, 8)}...{viewPrescription.tx_digest.slice(-6)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
