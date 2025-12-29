import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileCheck, Users, Clock, CheckCircle, XCircle, Eye, Send } from "lucide-react";
import { toast } from "sonner";

const consentRequests = [
  {
    id: "1",
    studyName: "Chronic Disease Prevention Study",
    requestedData: ["Demographics", "Medical History", "Lab Results"],
    targetParticipants: 5000,
    approvedParticipants: 4200,
    status: "active",
    submittedDate: "2024-01-05",
    expiryDate: "2025-01-05",
  },
  {
    id: "2",
    studyName: "Mental Health Intervention Analysis",
    requestedData: ["Mental Health Records", "Treatment Plans"],
    targetParticipants: 3000,
    approvedParticipants: 1800,
    status: "collecting",
    submittedDate: "2024-01-10",
    expiryDate: "2025-01-10",
  },
  {
    id: "3",
    studyName: "Preventive Care Effectiveness",
    requestedData: ["Preventive Screenings", "Outcomes Data"],
    targetParticipants: 4000,
    approvedParticipants: 3200,
    status: "complete",
    submittedDate: "2023-09-15",
    expiryDate: "2024-09-15",
  },
];

const pendingApprovals = [
  { id: "1", participantId: "P-8842", dataTypes: ["Demographics", "Lab Results"], requestDate: "2024-01-20" },
  { id: "2", participantId: "P-9123", dataTypes: ["Medical History"], requestDate: "2024-01-19" },
  { id: "3", participantId: "P-7654", dataTypes: ["Demographics", "Medical History", "Lab Results"], requestDate: "2024-01-18" },
];

interface ConsentManagementProps {
  isNewUser?: boolean;
}

export const ConsentManagement = ({ isNewUser = false }: ConsentManagementProps) => {
  const [searchQuery, setSearchQuery] = useState("");

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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search consent requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
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

      {/* Pending Approvals */}
      <div className="glass-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-500" />
          Pending Participant Approvals
        </h2>

        <div className="space-y-3">
          {pendingApprovals.map((approval) => (
            <div
              key={approval.id}
              className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{approval.participantId}</p>
                  <div className="flex gap-1 mt-1">
                    {approval.dataTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{approval.requestDate}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-green-500 hover:text-green-600">
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 text-center">
          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">9,200</p>
          <p className="text-sm text-muted-foreground">Active Consents</p>
        </div>
        <div className="glass-card p-5 text-center">
          <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">847</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="glass-card p-5 text-center">
          <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">23</p>
          <p className="text-sm text-muted-foreground">Withdrawn</p>
        </div>
        <div className="glass-card p-5 text-center">
          <FileCheck className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">98.2%</p>
          <p className="text-sm text-muted-foreground">Consent Rate</p>
        </div>
      </div>
    </div>
  );
};
