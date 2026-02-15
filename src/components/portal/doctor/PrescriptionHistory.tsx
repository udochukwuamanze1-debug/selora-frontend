import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Clock, User, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface Prescription {
  id: string;
  patient_address: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  status: string;
  created_at: string;
}

interface PrescriptionHistoryProps {
  walletAddress: string;
}

export const PrescriptionHistory = ({ walletAddress }: PrescriptionHistoryProps) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("doctor_address", walletAddress)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPrescriptions(data as Prescription[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (walletAddress) fetchPrescriptions();
  }, [walletAddress]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600",
      dispensed: "bg-green-500/10 text-green-600",
      cancelled: "bg-red-500/10 text-red-600",
    };
    return <Badge variant="secondary" className={`text-xs ${styles[status] || ""}`}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading prescriptions...</p>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="glass-card p-8 sm:p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Pill className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No Prescriptions Yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Prescriptions you create will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchPrescriptions}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {prescriptions.map((rx) => (
        <div key={rx.id} className="glass-card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground">{rx.medication}</p>
                <p className="text-sm text-muted-foreground">{rx.dosage} · {rx.frequency} · {rx.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(rx.status)}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(rx.created_at), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
