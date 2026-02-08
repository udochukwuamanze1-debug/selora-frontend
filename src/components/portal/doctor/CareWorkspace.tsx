import { useState, useEffect } from "react";
import { Activity, Users, FileText, Clock, UserPlus } from "lucide-react";
import { QRAccessRequest } from "../QRAccessRequest";

interface CareWorkspaceProps {
  isNewUser?: boolean;
  walletAddress?: string;
}

interface Patient {
  id: string;
  name: string;
  lastVisit: string;
  condition: string;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export const CareWorkspace = ({ isNewUser = false, walletAddress = "" }: CareWorkspaceProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [prescriptionsToday, setPrescriptionsToday] = useState(0);

  // Load data from localStorage
  useEffect(() => {
    if (!walletAddress) return;
    
    const storedPatients = localStorage.getItem(`selora_doctor_patients_${walletAddress}`);
    if (storedPatients) {
      setPatients(JSON.parse(storedPatients));
    }
    
    const storedActivities = localStorage.getItem(`selora_doctor_activities_${walletAddress}`);
    if (storedActivities) {
      setActivities(JSON.parse(storedActivities));
    }
    
    const storedPrescriptions = localStorage.getItem(`selora_doctor_prescriptions_${walletAddress}`);
    if (storedPrescriptions) {
      const prescriptions = JSON.parse(storedPrescriptions);
      const today = new Date().toISOString().split("T")[0];
      const todayCount = prescriptions.filter((p: any) => 
        p.date && p.date.startsWith(today)
      ).length;
      setPrescriptionsToday(todayCount);
    }
  }, [walletAddress]);

  const hasData = patients.length > 0 || activities.length > 0;

  const stats = [
    { label: "Active Patients", value: patients.length.toString(), icon: Users, change: patients.length > 0 ? `${patients.length} connected` : "No patients yet" },
    { label: "Pending Reviews", value: "0", icon: FileText, change: "No reviews pending" },
    { label: "Prescriptions Today", value: prescriptionsToday.toString(), icon: Activity, change: prescriptionsToday > 0 ? `${prescriptionsToday} created` : "No prescriptions yet" },
    { label: "Avg. Response Time", value: hasData ? "2.4h" : "--", icon: Clock, change: hasData ? "Good" : "N/A" },
  ];

  return (
    <div className="space-y-6">
      <QRAccessRequest walletAddress={walletAddress} userType="doctor" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xs text-primary mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h2 className="font-heading text-lg font-semibold mb-4 text-foreground">
          Recent Activity
        </h2>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent activity yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Patient activity will appear here once you start caring for patients.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connected Patients or Empty State */}
      {patients.length > 0 ? (
        <div className="glass-card p-6">
          <h2 className="font-heading text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Connected Patients
          </h2>
          <div className="space-y-3">
            {patients.slice(0, 5).map((patient) => (
              <div key={patient.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">{patient.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{patient.name}</p>
                  <p className="text-xs text-muted-foreground">{patient.condition || "General care"}</p>
                </div>
                <p className="text-xs text-muted-foreground">{patient.lastVisit}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="glass-card p-5 text-left hover:border-primary/20 transition-colors">
          <FileText className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-1">New Prescription</h3>
          <p className="text-sm text-muted-foreground">Create a digital prescription</p>
        </button>
        <button className="glass-card p-5 text-left hover:border-primary/20 transition-colors">
          <Users className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-1">View Patients</h3>
          <p className="text-sm text-muted-foreground">Access patient records</p>
        </button>
        <button className="glass-card p-5 text-left hover:border-primary/20 transition-colors">
          <Activity className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Analytics</h3>
          <p className="text-sm text-muted-foreground">View practice insights</p>
        </button>
      </div>
    </div>
  );
};
