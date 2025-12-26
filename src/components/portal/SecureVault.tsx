import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Lock,
  Cloud,
  HardDrive,
  Shield,
  Users,
  Settings,
  Check,
} from "lucide-react";

export const SecureVault = () => {
  const [uploading, setUploading] = useState(false);

  const storageStats = {
    used: 2.4,
    total: 10,
    walrus: 1.8,
    local: 0.6,
  };

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => setUploading(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
            Secure Vault
          </h1>
          <p className="text-muted-foreground">
            Encrypted storage for your most sensitive health data
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="glass-card p-8">
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            uploading
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
        >
          {uploading ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <p className="font-medium">Encrypting and uploading...</p>
              <Progress value={66} className="max-w-xs mx-auto" />
            </div>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">
                Upload & Encrypt
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your files are encrypted client-side before being stored on Walrus decentralized storage
              </p>
              <Button onClick={handleUpload} className="gap-2">
                <Upload className="w-4 h-4" />
                Select Files
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Storage Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <HardDrive className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-heading text-xl font-semibold">Storage Usage</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Used</span>
                <span className="font-medium">
                  {storageStats.used} GB / {storageStats.total} GB
                </span>
              </div>
              <Progress value={(storageStats.used / storageStats.total) * 100} />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Cloud className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{storageStats.walrus} GB</p>
                  <p className="text-xs text-muted-foreground">Walrus</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-sm font-medium">{storageStats.local} GB</p>
                  <p className="text-xs text-muted-foreground">Local Backup</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Shield className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="font-heading text-xl font-semibold">Security Status</h2>
          </div>

          <div className="space-y-4">
            {[
              { label: "Client-side encryption", status: "active" },
              { label: "AES-256 encryption", status: "active" },
              { label: "Decentralized storage", status: "active" },
              { label: "Emergency access configured", status: "pending" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <span className="text-sm">{item.label}</span>
                {item.status === "active" ? (
                  <div className="flex items-center gap-1 text-primary">
                    <Check className="w-4 h-4" />
                    <span className="text-xs">Active</span>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm">
                    Configure
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Access Management */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-heading text-xl font-semibold">Access Management</h2>
          </div>
          <Button variant="glass" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Manage Access
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-3xl font-heading font-bold text-primary">3</p>
            <p className="text-sm text-muted-foreground">Active Permissions</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-3xl font-heading font-bold text-secondary">2</p>
            <p className="text-sm text-muted-foreground">Emergency Guardians</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-3xl font-heading font-bold text-accent">1</p>
            <p className="text-sm text-muted-foreground">Pending Request</p>
          </div>
        </div>
      </div>
    </div>
  );
};
