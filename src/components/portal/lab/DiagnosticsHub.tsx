import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Clock, 
  FileText,
  FlaskConical,
} from "lucide-react";

interface DiagnosticsHubProps {
  isNewUser?: boolean;
  walletAddress?: string;
}

export const DiagnosticsHub = ({ isNewUser = false, walletAddress = "" }: DiagnosticsHubProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const stats = isNewUser
    ? {
        pending: 0,
        processing: 0,
        ready: 0,
        completed: 0,
      }
    : {
        pending: 0,
        processing: 0,
        ready: 0,
        completed: 0,
      };

  return (
    <div className="space-y-6">

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

      {isNewUser ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FlaskConical className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading text-xl font-semibold mb-2 text-foreground">
            No Prescriptions Yet
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            When doctors create prescriptions for patients, they'll appear here for fulfillment.
            You'll be able to process, prepare, and complete prescription orders.
          </p>
        </div>
      ) : (
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
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No prescriptions to display
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
