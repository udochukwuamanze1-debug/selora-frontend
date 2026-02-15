import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Clock, CheckCircle2, User, Eye, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface SentReport {
  id: string;
  doctor_address: string;
  doctor_name: string;
  patient_address: string;
  patient_name: string;
  diagnosis: string;
  report_type: string;
  status: string;
  created_at: string;
  tx_digest: string;
}

interface SentReportsHistoryProps {
  walletAddress: string;
}

export const SentReportsHistory = ({ walletAddress }: SentReportsHistoryProps) => {
  const [reports, setReports] = useState<SentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("visit_reports")
      .select("*")
      .eq("doctor_address", walletAddress)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReports(data as SentReport[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (walletAddress) fetchReports();
  }, [walletAddress]);

  const filtered = reports.filter(
    (r) =>
      r.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patient_address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      general_visit: "General Visit",
      follow_up: "Follow-up",
      emergency: "Emergency",
      specialist_referral: "Specialist Referral",
      lab_review: "Lab Review",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">Sent</Badge>;
      case "viewed":
        return <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-600">Viewed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <RefreshCw className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading reports...</p>
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
            placeholder="Search by patient, diagnosis..."
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
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No Sent Reports</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {searchQuery
              ? `No reports match "${searchQuery}".`
              : "Reports you send to patients will appear here. Go to Visit Report to create one."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => (
            <div key={report.id} className="glass-card p-4 hover:border-primary/20 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {report.patient_name || `${report.patient_address.slice(0, 8)}...${report.patient_address.slice(-4)}`}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{report.diagnosis}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="text-xs">{getTypeLabel(report.report_type)}</Badge>
                  {getStatusBadge(report.status)}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(report.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              {report.tx_digest && (
                <div className="mt-2 pt-2 border-t border-border/30">
                  <p className="text-xs text-muted-foreground">
                    TX: <code className="bg-muted px-1 py-0.5 rounded">{report.tx_digest.slice(0, 16)}...</code>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {reports.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{reports.length}</p>
            <p className="text-xs text-muted-foreground">Total Reports</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {reports.filter((r) => r.status === "sent").length}
            </p>
            <p className="text-xs text-muted-foreground">Sent</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {new Set(reports.map((r) => r.patient_address)).size}
            </p>
            <p className="text-xs text-muted-foreground">Unique Patients</p>
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
    </div>
  );
};
