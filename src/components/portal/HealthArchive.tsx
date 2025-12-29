import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  FileText,
  Image,
  Pill,
  Shield,
  Eye,
  Download,
  Database,
  Upload,
} from "lucide-react";
import { useWalrusStorage } from "@/hooks/useWalrusStorage";
import { toast } from "sonner";

interface HealthArchiveProps {
  walletAddress: string;
  onRecordUploaded?: () => void;
}

export const HealthArchive = ({ walletAddress, onRecordUploaded }: HealthArchiveProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { records, isUploading, uploadFile, downloadFile, loadRecords } = useWalrusStorage(walletAddress);

  useEffect(() => {
    loadRecords();
  }, [walletAddress]);

  const getRecordType = (mimeType: string): string => {
    if (mimeType.startsWith("image/")) return "Imaging";
    if (mimeType.includes("pdf")) return "Lab Report";
    return "Document";
  };

  const getRecordIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return Image;
    if (mimeType.includes("pdf")) return FileText;
    return FileText;
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch = record.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const recordType = getRecordType(record.mimeType);
    const matchesFilter = !filterType || recordType === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const result = await uploadFile(file);
      if (result) {
        onRecordUploaded?.();
      }
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (record: typeof records[0]) => {
    const blob = await downloadFile(record);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = record.originalName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("File downloaded");
    }
  };

  const handleView = async (record: typeof records[0]) => {
    const blob = await downloadFile(record);
    if (blob) {
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*,.pdf,.doc,.docx"
      />

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
        <Button 
          className="gap-2" 
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Upload className="w-4 h-4 animate-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <Database className="w-4 h-4" />
              Upload New Record
            </>
          )}
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
            {["Lab Report", "Imaging", "Document"].map((type) => (
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
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Size</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => {
                const RecordIcon = getRecordIcon(record.mimeType);
                return (
                  <tr
                    key={record.id}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <RecordIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{record.originalName}</p>
                          <p className="text-sm text-muted-foreground md:hidden">
                            {getRecordType(record.mimeType)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-muted-foreground">{getRecordType(record.mimeType)}</span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-muted-foreground">{formatFileSize(record.size)}</span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-muted-foreground">
                        {new Date(record.uploadedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(record)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(record)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {records.length === 0 ? "No records yet. Upload your first health record!" : "No records found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
