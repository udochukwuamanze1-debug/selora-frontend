import { BarChart3, Database, Users, FileText, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Active Studies", value: "8", icon: FileText, change: "+2 this month" },
  { label: "Data Access Grants", value: "24", icon: Database, change: "3 pending" },
  { label: "Participants", value: "12,450", icon: Users, change: "+850 enrolled" },
  { label: "Analysis Hours", value: "342h", icon: Clock, change: "This quarter" },
];

const activeStudies = [
  {
    id: "1",
    name: "Chronic Disease Prevention Study",
    status: "active",
    participants: 4200,
    completion: 67,
    deadline: "2024-06-15",
  },
  {
    id: "2",
    name: "Mental Health Intervention Analysis",
    status: "recruiting",
    participants: 1800,
    completion: 23,
    deadline: "2024-09-01",
  },
  {
    id: "3",
    name: "Preventive Care Effectiveness",
    status: "analysis",
    participants: 3200,
    completion: 89,
    deadline: "2024-03-30",
  },
  {
    id: "4",
    name: "Regional Health Disparities",
    status: "active",
    participants: 2100,
    completion: 45,
    deadline: "2024-08-20",
  },
];

export const ResearchConsole = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500 bg-green-500/10";
      case "recruiting":
        return "text-blue-500 bg-blue-500/10";
      case "analysis":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          Research Console
        </h1>
        <p className="text-muted-foreground">
          Manage your research studies and data access
        </p>
      </div>

      {/* Stats Grid */}
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

      {/* Active Studies */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Active Studies
          </h2>
          <Button variant="outline" size="sm">
            New Study
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Study Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Participants</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Progress</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Deadline</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeStudies.map((study) => (
                <tr key={study.id} className="border-b border-border/30 hover:bg-muted/30">
                  <td className="py-3 px-4 font-medium text-foreground">{study.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(study.status)}`}>
                      {study.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{study.participants.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${study.completion}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{study.completion}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{study.deadline}</td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
