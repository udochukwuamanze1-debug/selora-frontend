import { useState, useCallback, useEffect } from "react";
import {
  Upload,
  File,
  Image,
  FileText,
  Video,
  Music,
  Download,
  Trash2,
  Lock,
  Filter,
  Grid,
  List,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWalrusStorage, type StoredRecord } from "@/hooks/useWalrusStorage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VaultProps {
  walletAddress: string;
}

type FileCategory = "all" | "images" | "documents" | "videos" | "audio" | "other";
type ViewMode = "grid" | "list";

interface VaultFile {
  id: string;
  name: string;
  type: string;
  size: number;
  category: FileCategory;
  uploadedAt: Date;
  blobId?: string;
  iv: string;
  encrypted: boolean;
}

const getCategoryFromType = (type: string): FileCategory => {
  if (type.startsWith("image/")) return "images";
  if (type.startsWith("video/")) return "videos";
  if (type.startsWith("audio/")) return "audio";
  if (type.includes("pdf") || type.includes("document") || type.includes("text"))
    return "documents";
  return "other";
};

const getFileIcon = (category: FileCategory) => {
  switch (category) {
    case "images":
      return Image;
    case "documents":
      return FileText;
    case "videos":
      return Video;
    case "audio":
      return Music;
    default:
      return File;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function recordToVaultFile(r: StoredRecord): VaultFile {
  return {
    id: r.id,
    name: r.originalName,
    type: r.mimeType,
    size: r.size,
    category: getCategoryFromType(r.mimeType),
    uploadedAt: new Date(r.uploadedAt),
    blobId: r.blobId,
    iv: r.iv,
    encrypted: true,
  };
}

export const Vault = ({ walletAddress }: VaultProps) => {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isDragging, setIsDragging] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { records, uploadFile, downloadFile, isUploading, isDownloading, loadRecords, deleteRecord } =
    useWalrusStorage(walletAddress);

  // Hydrate files from persisted records on mount
  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    setFiles(records.map(recordToVaultFile));
  }, [records]);

  const handleFileUpload = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      for (const file of Array.from(fileList)) {
        try {
          await uploadFile(file);
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    },
    [uploadFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDownload = async (file: VaultFile) => {
    const record = records.find((r) => r.id === file.id);
    if (!record) {
      toast.error("Record not found");
      return;
    }
    setDownloadingId(file.id);
    try {
      const blob = await downloadFile(record);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("File downloaded");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteRecord(id);
    toast.success("File removed from vault");
  };

  const filteredFiles =
    selectedCategory === "all" ? files : files.filter((f) => f.category === selectedCategory);

  const categories: { value: FileCategory; label: string; count: number }[] = [
    { value: "all", label: "All Files", count: files.length },
    { value: "images", label: "Images", count: files.filter((f) => f.category === "images").length },
    { value: "documents", label: "Documents", count: files.filter((f) => f.category === "documents").length },
    { value: "videos", label: "Videos", count: files.filter((f) => f.category === "videos").length },
    { value: "audio", label: "Audio", count: files.filter((f) => f.category === "audio").length },
    { value: "other", label: "Other", count: files.filter((f) => f.category === "other").length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Secure Vault
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Your encrypted files stored on-chain with AES-256 encryption
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as FileCategory)}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label} ({cat.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all",
          isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
        )}
      >
        <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-foreground font-medium mb-2">Drag and drop files here, or</p>
        <label>
          <Input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
            disabled={isUploading}
          />
          <Button variant="outline" disabled={isUploading} asChild>
            <span className="cursor-pointer">
              {isUploading ? "Encrypting & Uploading..." : "Browse Files"}
            </span>
          </Button>
        </label>
        <p className="text-xs text-muted-foreground mt-3">
          Files are encrypted with AES-256 before being stored on Walrus
        </p>
      </div>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No files yet</h3>
          <p className="text-muted-foreground text-sm">
            Upload files to store them securely in your encrypted vault
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => {
            const Icon = getFileIcon(file.category);
            const loading = downloadingId === file.id || isDownloading;
            return (
              <div key={file.id} className="glass-card p-4 group hover:border-primary/30">
                <div className="aspect-square rounded-lg bg-muted/50 flex items-center justify-center mb-3">
                  <Icon className="w-12 h-12 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleDownload(file)}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <Lock className="w-3 h-3 text-primary ml-auto" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card divide-y divide-border/50">
          {filteredFiles.map((file) => {
            const Icon = getFileIcon(file.category);
            const loading = downloadingId === file.id || isDownloading;
            return (
              <div key={file.id} className="flex items-center gap-4 p-4 hover:bg-muted/30">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                  </p>
                </div>
                <Lock className="w-4 h-4 text-primary" />
                <Button variant="ghost" size="icon" onClick={() => handleDownload(file)} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDelete(file.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
