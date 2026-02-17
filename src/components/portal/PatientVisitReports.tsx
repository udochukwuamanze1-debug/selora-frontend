import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileText, Search, Clock, User, Eye, RefreshCw, Stethoscope } from "lucide-react";
import { format } from "date-fns";

interface VisitReport {
  id: string;
  doctor_address: string;
  doctor_name: string;
  patient_address: string;
  patient_name: string | null;
  chief_complaint: string | null;
  diagnosis: string;
  prescription_details: string | null;
  notes: string | null;
  report_type: string;
  vital_signs: Record<string, string> | null;
  status: string;
  created_at: string;
  tx_digest: string | null;
}

interface PatientVisitReportsProps {
  walletAddress: string;
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  general_visit: "General Visit",
  follow_up: "Follow-up",
  emergency: "Emergency",
  specialist_referral: "Specialist Referral",
  lab_review: "Lab Review",
};

export const PatientVisitReports = ({ walletAddress }: PatientVisitReportsProps) => {
  const [reports, setReports] = useState<VisitReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("visit_reports")
      .select("*")
      .eq("patient_address", walletAddress)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReports(data as VisitReport[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (walletAddress) fetchReports();
  }, [walletAddress]);

  const filtered = reports.filter(
    (r) =>
      r.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.chief_complaint?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewReport = reports.find((r) => r.id === selectedReport);

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading visit reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by doctor, diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" onClick={fetchReports}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Visit Reports</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {searchQuery
              ? `No reports match "${searchQuery}".`
              : "When doctors send you visit reports, they'll appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => (
            <div key={report.id} className="glass-card p-4 hover:border-primary/20 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      Dr. {report.doctor_name || `${report.doctor_address.slice(0, 8)}...`}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{report.diagnosis}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {REPORT_TYPE_LABELS[report.report_type] || report.report_type}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(report.created_at), "MMM d, yyyy")}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedReport(report.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {reports.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{reports.length}</p>
            <p className="text-xs text-muted-foreground">Total Reports</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {new Set(reports.map((r) => r.doctor_address)).size}
            </p>
            <p className="text-xs text-muted-foreground">Doctors</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {reports.filter((r) => {
                const d = new Date(r.created_at);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Visit Report Details</DialogTitle>
            <DialogDescription>
              {viewReport && `${REPORT_TYPE_LABELS[viewReport.report_type] || viewReport.report_type} — ${format(new Date(viewReport.created_at), "MMMM d, yyyy")}`}
            </DialogDescription>
          </DialogHeader>
          {viewReport && (
            <div className="space-y-4 py-2">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-medium">Dr. {viewReport.doctor_name}</span>
                </div>
                {viewReport.chief_complaint && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chief Complaint</span>
                    <span className="font-medium text-right max-w-[60%]">{viewReport.chief_complaint}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground text-sm">Diagnosis</span>
                  <p className="text-sm mt-1 bg-muted/50 p-3 rounded-lg">{viewReport.diagnosis}</p>
                </div>
                {viewReport.prescription_details && (
                  <div>
                    <span className="text-muted-foreground text-sm">Prescription</span>
                    <p className="text-sm mt-1 bg-muted/50 p-3 rounded-lg">{viewReport.prescription_details}</p>
                  </div>
                )}
                {viewReport.notes && (
                  <div>
                    <span className="text-muted-foreground text-sm">Notes</span>
                    <p className="text-sm mt-1 bg-muted/50 p-3 rounded-lg">{viewReport.notes}</p>
                  </div>
                )}
                {viewReport.vital_signs && Object.values(viewReport.vital_signs).some(Boolean) && (
                  <div>
                    <span className="text-muted-foreground text-sm">Vital Signs</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {viewReport.vital_signs.bloodPressure && (
                        <div className="bg-muted/50 p-2 rounded-lg text-sm">
                          <span className="text-muted-foreground">BP:</span> {viewReport.vital_signs.bloodPressure}
                        </div>
                      )}
                      {viewReport.vital_signs.heartRate && (
                        <div className="bg-muted/50 p-2 rounded-lg text-sm">
                          <span className="text-muted-foreground">HR:</span> {viewReport.vital_signs.heartRate} bpm
                        </div>
                      )}
                      {viewReport.vital_signs.temperature && (
                        <div className="bg-muted/50 p-2 rounded-lg text-sm">
                          <span className="text-muted-foreground">Temp:</span> {viewReport.vital_signs.temperature}°F
                        </div>
                      )}
                      {viewReport.vital_signs.weight && (
                        <div className="bg-muted/50 p-2 rounded-lg text-sm">
                          <span className="text-muted-foreground">Weight:</span> {viewReport.vital_signs.weight} kg
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {viewReport.tx_digest && (
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                      TX: <code className="bg-muted px-1 py-0.5 rounded">{viewReport.tx_digest.slice(0, 16)}...</code>
                    </p>
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
