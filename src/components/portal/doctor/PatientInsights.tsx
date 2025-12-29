import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, FileText, Shield, Users } from "lucide-react";

interface PatientInsightsProps {
  isNewUser?: boolean;
}

export const PatientInsights = ({ isNewUser = false }: PatientInsightsProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          Patient Insights
        </h1>
        <p className="text-muted-foreground">
          {isNewUser ? "Patients who share records with you will appear here" : "View and manage patient records with granted access"}
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

      {isNewUser ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading text-xl font-semibold mb-2 text-foreground">
            No Patients Yet
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            When patients share their health records with you, they'll appear here. 
            You can only view records that patients have explicitly granted you access to.
          </p>
        </div>
      ) : (
        <>
          {/* Patients Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Patient ID</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Wallet</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Visit</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Records</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No patients match your search
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

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
