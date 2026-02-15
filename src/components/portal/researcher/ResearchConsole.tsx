import { useState, useEffect } from "react";
import { BarChart3, Database, Users, FileText, Clock, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResearchConsoleProps {
  isNewUser?: boolean;
  walletAddress?: string;
}

export const ResearchConsole = ({ isNewUser = false, walletAddress = "" }: ResearchConsoleProps) => {
  const [studies, setStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newStudy, setNewStudy] = useState({ title: "", description: "", data_type: "anonymized", budget_tokens: 0 });

  const fetchStudies = async () => {
    const { data } = await supabase
      .from("research_data_requests")
      .select("*")
      .eq("researcher_address", walletAddress)
      .order("created_at", { ascending: false });
    if (data) setStudies(data);
    setLoading(false);
  };

  useEffect(() => {
    if (walletAddress) fetchStudies();
  }, [walletAddress]);

  const handleCreateStudy = async () => {
    const { error } = await supabase.from("research_data_requests").insert({
      researcher_address: walletAddress,
      title: newStudy.title,
      description: newStudy.description,
      data_type: newStudy.data_type,
      budget_tokens: newStudy.budget_tokens,
      status: "pending",
    });
    if (error) {
      toast.error("Failed to create study");
    } else {
      toast.success("Research study created!");
      setShowCreate(false);
      setNewStudy({ title: "", description: "", data_type: "anonymized", budget_tokens: 0 });
      fetchStudies();
    }
  };

  const stats = [
    { label: "Active Studies", value: studies.filter(s => s.status === "active").length.toString(), icon: FileText, change: studies.length > 0 ? `${studies.length} total` : "Start a study" },
    { label: "Data Access Grants", value: studies.reduce((s, r) => s + (r.consent_count || 0), 0).toString(), icon: Database, change: "Consented participants" },
    { label: "Participants", value: studies.reduce((s, r) => s + (r.patient_count || 0), 0).toString(), icon: Users, change: "Across all studies" },
    { label: "Analysis Hours", value: "0h", icon: Clock, change: "N/A" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xs text-primary mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Create Study Form */}
      {showCreate && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-heading text-lg font-semibold text-foreground">New Research Study</h3>
          <div>
            <Label>Title</Label>
            <Input placeholder="Study title" value={newStudy.title} onChange={(e) => setNewStudy({ ...newStudy, title: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea placeholder="Describe your research objectives..." value={newStudy.description} onChange={(e) => setNewStudy({ ...newStudy, description: e.target.value })} rows={3} />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCreateStudy} disabled={!newStudy.title}>Create Study</Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Studies List */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Research Studies
          </h2>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Study
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading studies...</p>
          </div>
        ) : studies.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2 text-foreground">No Active Studies</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Create your first research study to start collecting consented patient data.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {studies.map((study) => (
              <div key={study.id} className="p-4 rounded-lg bg-muted/30 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{study.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{study.description || "No description"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs capitalize">{study.status}</Badge>
                  <span className="text-xs text-muted-foreground">{study.patient_count || 0} participants</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <Database className="w-6 h-6 text-primary" />
          <span>Request Data Access</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          <span>Manage Participants</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          <span>Run Analysis</span>
        </Button>
      </div>
    </div>
  );
};
