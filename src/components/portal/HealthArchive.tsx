import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  FileText,
  Image,
  Pill,
  Shield,
  Eye,
  Download,
  Database,
} from "lucide-react";

const mockRecords = [
  {
    id: "1",
    name: "Blood Test Results",
    type: "Lab Report",
    date: "Dec 15, 2024",
    status: "available",
    icon: FileText,
  },
  {
    id: "2",
    name: "Chest X-Ray",
    type: "Imaging",
    date: "Dec 10, 2024",
    status: "staked",
    icon: Image,
  },
  {
    id: "3",
    name: "Prescription - Antibiotics",
    type: "Prescription",
    date: "Dec 5, 2024",
    status: "shared",
    icon: Pill,
  },
  {
    id: "4",
    name: "Insurance Coverage",
    type: "Insurance",
    date: "Nov 28, 2024",
    status: "available",
    icon: Shield,
  },
  {
    id: "5",
    name: "MRI Scan Report",
    type: "Imaging",
    date: "Nov 20, 2024",
    status: "staked",
    icon: Image,
  },
  {
    id: "6",
    name: "Annual Physical",
    type: "Lab Report",
    date: "Nov 15, 2024",
    status: "available",
    icon: FileText,
  },
];

export const HealthArchive = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredRecords = mockRecords.filter((record) => {
    const matchesSearch = record.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterType || record.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "staked":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-secondary/20 text-secondary-foreground">
            Staked
          </span>
        );
      case "shared":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">
            Shared
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
            Available
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
            Health Archive
          </h1>
          <p className="text-muted-foreground">
            All your encrypted health records in one place
          </p>
        </div>
        <Button className="gap-2">
          <Database className="w-4 h-4" />
          Upload New Record
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["Lab Report", "Imaging", "Prescription", "Insurance"].map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "glass"}
                size="sm"
                onClick={() => setFilterType(filterType === type ? null : type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Record</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Type</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <record.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{record.name}</p>
                        <p className="text-sm text-muted-foreground md:hidden">
                          {record.type}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-muted-foreground">{record.type}</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-muted-foreground">{record.date}</span>
                  </td>
                  <td className="p-4">{getStatusBadge(record.status)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No records found</p>
          </div>
        )}
      </div>
    </div>
  );
};
