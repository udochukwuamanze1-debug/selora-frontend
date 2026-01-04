import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Check, X, Clock, Shield, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ACCESS_DURATION_MS } from "@/config/constants";

interface AccessRequest {
  id: string;
  patientAddress: string;
  doctorName: string;
  doctorAddress: string;
  hospitalName: string;
  accessType: "general" | "full";
  requestedAt: string;
  status: "pending" | "approved" | "denied";
  expiresAt?: string;
  recordId?: string;
}

interface PatientInboxProps {
  walletAddress: string;
}

const ACCESS_REQUESTS_KEY = "selora_access_requests";

function getAccessRequests(): AccessRequest[] {
  try {
    const stored = localStorage.getItem(ACCESS_REQUESTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAccessRequests(requests: AccessRequest[]): void {
  localStorage.setItem(ACCESS_REQUESTS_KEY, JSON.stringify(requests));
}

export function PatientInbox({ walletAddress }: PatientInboxProps) {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AccessRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>("ONE_HOUR");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRequests = useCallback(() => {
    const all = getAccessRequests();
    const mine = all
      .filter((r) => r.patientAddress === walletAddress)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    setRequests(mine);
  }, [walletAddress]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    let filtered = [...requests];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.doctorName.toLowerCase().includes(query) ||
          r.hospitalName.toLowerCase().includes(query) ||
          r.doctorAddress.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchQuery]);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    const durationMs = ACCESS_DURATION_MS[selectedDuration as keyof typeof ACCESS_DURATION_MS] || ACCESS_DURATION_MS.ONE_HOUR;
    const expiresAt = new Date(Date.now() + durationMs).toISOString();

    try {
      const allRequests = getAccessRequests();
      const index = allRequests.findIndex((r) => r.id === selectedRequest.id);
      if (index >= 0) {
        allRequests[index].status = "approved";
        allRequests[index].expiresAt = expiresAt;
        saveAccessRequests(allRequests);
      }

      toast.success("Access granted!", {
        description: `Dr. ${selectedRequest.doctorName} can now view your records.`,
      });
      loadRequests();
    } catch (error) {
      toast.error("Failed to grant access");
    } finally {
      setIsProcessing(false);
      setSelectedRequest(null);
    }
  };

  const handleDeny = async () => {
    if (!selectedRequest) return;

    const allRequests = getAccessRequests();
    const index = allRequests.findIndex((r) => r.id === selectedRequest.id);
    if (index >= 0) {
      allRequests[index].status = "denied";
      saveAccessRequests(allRequests);
    }

    toast.info("Access denied");
    loadRequests();
    setSelectedRequest(null);
  };

  const getStatusBadge = (status: AccessRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-green-500 border-green-500/30">Approved</Badge>;
      case "denied":
        return <Badge variant="outline" className="text-red-500 border-red-500/30">Denied</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by doctor name or hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No access requests</h3>
          <p className="text-sm text-muted-foreground">
            {statusFilter === "all"
              ? "You haven't received any access requests yet."
              : `No ${statusFilter} requests found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="glass-card p-4 hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => request.status === "pending" && setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{request.doctorName}</h4>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {request.hospitalName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(request.requestedAt)}
                  </p>
                </div>
                {request.status === "pending" && (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                {request.status === "approved" && request.expiresAt && (
                  <div className="text-xs text-muted-foreground text-right">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Expires {formatDate(request.expiresAt)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Review Access Request
            </DialogTitle>
            <DialogDescription>
              Choose how long this provider can access your records
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Doctor</span>
                  <span className="font-medium">{selectedRequest.doctorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hospital</span>
                  <span className="font-medium">{selectedRequest.hospitalName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Access Type</span>
                  <Badge variant="outline">
                    {selectedRequest.accessType === "full" ? "Full History" : "General"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Access Duration
                </label>
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONE_HOUR">1 Hour</SelectItem>
                    <SelectItem value="TWO_HOURS">2 Hours</SelectItem>
                    <SelectItem value="TWENTY_FOUR_HOURS">24 Hours</SelectItem>
                    <SelectItem value="ONE_WEEK">1 Week</SelectItem>
                    <SelectItem value="THIRTY_DAYS">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleDeny}
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4" />
                  Deny
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}