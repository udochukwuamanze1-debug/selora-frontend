import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileCheck, Users, Clock, CheckCircle, XCircle, Eye, Send, Plus } from "lucide-react";
import { toast } from "sonner";

interface ConsentRequest {
  id: string;
  studyName: string;
  requestedData: string[];
  targetParticipants: number;
  approvedParticipants: number;
  status: "active" | "collecting" | "complete";
  submittedDate: string;
  expiryDate: string;
}

interface ConsentManagementProps {
  isNewUser?: boolean;
  walletAddress?: string;
}

export const ConsentManagement = ({ isNewUser = false, walletAddress = "" }: ConsentManagementProps) => {
  const [consentRequests, setConsentRequests] = useState<ConsentRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load consent requests from localStorage
  useEffect(() => {
    if (walletAddress) {
      const stored = localStorage.getItem(`selora_research_consents_${walletAddress}`);
      if (stored) {
        try {
          setConsentRequests(JSON.parse(stored));
        } catch {
          setConsentRequests([]);
        }
      }
    }
  }, [walletAddress]);

  // Save consent requests to localStorage
  useEffect(() => {
    if (walletAddress && consentRequests.length > 0) {
      localStorage.setItem(`selora_research_consents_${walletAddress}`, JSON.stringify(consentRequests));
    }
  }, [consentRequests, walletAddress]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500 bg-green-500/10";
      case "collecting":
        return "text-blue-500 bg-blue-500/10";
      case "complete":
        return "text-muted-foreground bg-muted";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const handleSendReminder = (id: string) => {
    toast.success("Reminder sent to pending participants");
  };

  const createNewConsentRequest = () => {
    const today = new Date();
    const expiryDate = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);
    
    const newRequest: ConsentRequest = {
      id: `consent-${Date.now()}`,
      studyName: "New Research Study",
      requestedData: ["Demographics"],
      targetParticipants: 100,
      approvedParticipants: 0,
      status: "collecting",
      submittedDate: today.toISOString().split("T")[0],
      expiryDate: expiryDate.toISOString().split("T")[0],
    };
    setConsentRequests(prev => [...prev, newRequest]);
    toast.success("New consent request created!");
  };

  const activeConsents = consentRequests.filter(r => r.status === "active").reduce((sum, r) => sum + r.approvedParticipants, 0);
  const pendingCount = consentRequests.filter(r => r.status === "collecting").length;

  if (consentRequests.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
            Consent Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage participant consent for your research studies
          </p>
        </div>

        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileCheck className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading text-xl font-semibold mb-2 text-foreground">
            No Consent Requests Yet
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Create consent requests to collect participant approvals for your research studies.
            All consent is tracked on-chain for full auditability.
          </p>
          <Button onClick={createNewConsentRequest}>
            <Plus className="w-4 h-4 mr-2" />
            Create Consent Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          Consent Management
        </h1>
        <p className="text-muted-foreground">
          Track and manage participant consent for your research studies
        </p>
      </div>

      {/* Search & Create */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search consent requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={createNewConsentRequest}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Consent Requests */}
      <div className="glass-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-primary" />
          Consent Requests
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Study</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Data Types</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Progress</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Expiry</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {consentRequests.map((request) => (
                <tr key={request.id} className="border-b border-border/30 hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium text-foreground">{request.studyName}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {request.requestedData.slice(0, 2).map((data) => (
                        <Badge key={data} variant="outline" className="text-xs">
                          {data}
                        </Badge>
                      ))}
                      {request.requestedData.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{request.requestedData.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(request.approvedParticipants / request.targetParticipants) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {request.approvedParticipants}/{request.targetParticipants}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{request.expiryDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleSendReminder(request.id)}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 text-center">
          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{activeConsents}</p>
          <p className="text-sm text-muted-foreground">Active Consents</p>
        </div>
        <div className="glass-card p-5 text-center">
          <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">Collecting</p>
        </div>
        <div className="glass-card p-5 text-center">
          <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">0</p>
          <p className="text-sm text-muted-foreground">Withdrawn</p>
        </div>
        <div className="glass-card p-5 text-center">
          <FileCheck className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{consentRequests.length}</p>
          <p className="text-sm text-muted-foreground">Total Requests</p>
        </div>
      </div>
    </div>
  );
};
