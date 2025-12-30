import { useState } from "react";
import { QrCode, Camera, Clock, Shield, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ACCESS_DURATIONS } from "@/config/constants";
import { addLocalNotification } from "@/lib/wallet-keyphrase";

interface AccessRequest {
  id: string;
  doctorName: string;
  doctorAddress: string;
  hospitalName: string;
  accessType: "general" | "full";
  requestedAt: string;
  status: "pending" | "approved" | "denied";
  expiresAt?: string;
}

interface QRAccessRequestProps {
  walletAddress: string;
  userType: "patient" | "doctor";
}

// Storage key for access requests
const ACCESS_REQUESTS_KEY = "selora_access_requests";

function getAccessRequests(): AccessRequest[] {
  try {
    const stored = localStorage.getItem(ACCESS_REQUESTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAccessRequests(requests: AccessRequest[]): void {
  localStorage.setItem(ACCESS_REQUESTS_KEY, JSON.stringify(requests));
}

export function QRAccessRequest({ walletAddress, userType }: QRAccessRequestProps) {
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<AccessRequest | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>("one_hour");
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate QR code data for patient
  const generateQRData = () => {
    return JSON.stringify({
      type: "selora_access_request",
      patientAddress: walletAddress,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).slice(2, 11),
    });
  };

  // Simulate scanning QR code (doctor side)
  const handleScanQR = () => {
    setIsProcessing(true);
    // Simulate QR scan
    setTimeout(() => {
      const mockPatientAddress = "0x" + Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");

      // Create access request
      const request: AccessRequest = {
        id: `req_${Date.now()}`,
        doctorName: "Dr. Current User",
        doctorAddress: walletAddress,
        hospitalName: "Selora Clinic",
        accessType: "general",
        requestedAt: new Date().toISOString(),
        status: "pending",
      };

      const requests = getAccessRequests();
      requests.unshift(request);
      saveAccessRequests(requests);

      // Notify patient (simulated)
      addLocalNotification({
        type: "access",
        title: "Access Request",
        message: `Dr. ${request.doctorName} at ${request.hospitalName} requests access to your health history.`,
        data: { requestId: request.id, doctorAddress: walletAddress },
      });

      setIsProcessing(false);
      setShowScanner(false);
      toast.success("Access request sent!", {
        description: "Waiting for patient approval...",
      });
    }, 2000);
  };

  // Handle incoming access request (patient side)
  const handleApproveRequest = async () => {
    if (!pendingRequest) return;
    
    setIsProcessing(true);
    
    // Calculate expiration based on selected duration
    const durationMs = ACCESS_DURATIONS[selectedDuration.toUpperCase() as keyof typeof ACCESS_DURATIONS] || ACCESS_DURATIONS.ONE_HOUR;
    const expiresAt = new Date(Date.now() + durationMs).toISOString();

    // Update request status
    const requests = getAccessRequests();
    const index = requests.findIndex((r) => r.id === pendingRequest.id);
    if (index >= 0) {
      requests[index].status = "approved";
      requests[index].expiresAt = expiresAt;
      saveAccessRequests(requests);
    }

    // In a real implementation, this would call the smart contract
    // await buildGrantAccessTx(recordId, pendingRequest.doctorAddress, expiration);

    setIsProcessing(false);
    setShowRequestModal(false);
    setPendingRequest(null);

    toast.success("Access granted!", {
      description: `Dr. ${pendingRequest.doctorName} can now view your records.`,
    });

    // Add notification about granted access
    addLocalNotification({
      type: "access",
      title: "Access Granted",
      message: `You granted ${selectedDuration.replace("_", " ")} access to Dr. ${pendingRequest.doctorName}.`,
    });
  };

  const handleDenyRequest = () => {
    if (!pendingRequest) return;

    const requests = getAccessRequests();
    const index = requests.findIndex((r) => r.id === pendingRequest.id);
    if (index >= 0) {
      requests[index].status = "denied";
      saveAccessRequests(requests);
    }

    setShowRequestModal(false);
    setPendingRequest(null);
    toast.info("Access denied");
  };

  // Demo: Simulate receiving a request (for testing)
  const simulateIncomingRequest = () => {
    const request: AccessRequest = {
      id: `req_${Date.now()}`,
      doctorName: "Dr. Adegoke",
      doctorAddress: "0x1234...5678",
      hospitalName: "Lagos General Hospital",
      accessType: "general",
      requestedAt: new Date().toISOString(),
      status: "pending",
    };
    setPendingRequest(request);
    setShowRequestModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Patient View: Show QR Code */}
      {userType === "patient" && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold">Share Access</h3>
              <p className="text-sm text-muted-foreground">
                Let doctors scan your QR code to request access
              </p>
            </div>
            <Button onClick={() => setShowQR(true)} className="gap-2">
              <QrCode className="w-4 h-4" />
              Show QR Code
            </Button>
          </div>

          {/* Demo button for testing */}
          <Button
            variant="outline"
            size="sm"
            onClick={simulateIncomingRequest}
            className="text-xs"
          >
            Demo: Simulate Access Request
          </Button>
        </div>
      )}

      {/* Doctor View: Scan QR Code */}
      {userType === "doctor" && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-semibold">Request Patient Access</h3>
              <p className="text-sm text-muted-foreground">
                Scan patient's QR code to request medical history access
              </p>
            </div>
            <Button onClick={() => setShowScanner(true)} className="gap-2">
              <Camera className="w-4 h-4" />
              Scan QR Code
            </Button>
          </div>
        </div>
      )}

      {/* QR Code Display Modal (Patient) */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Your Access QR Code
            </DialogTitle>
            <DialogDescription>
              Show this to your doctor to grant temporary access
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center py-6">
            {/* Placeholder QR code visualization */}
            <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center border-4 border-primary/20">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-sm ${
                      Math.random() > 0.5 ? "bg-foreground" : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              QR code expires in 5 minutes
            </p>
            <Badge variant="outline" className="mt-2">
              {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </Badge>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal (Doctor) */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Scan Patient QR Code
            </DialogTitle>
            <DialogDescription>
              Point your camera at the patient's QR code
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center py-6">
            <div className="w-64 h-64 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/50">
              {isProcessing ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-2">Processing...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Camera preview would appear here
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={handleScanQR}
              disabled={isProcessing}
              className="mt-4 gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isProcessing ? "Sending Request..." : "Simulate Scan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Access Request Approval Modal (Patient) */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Access Request
            </DialogTitle>
            <DialogDescription>
              A healthcare provider is requesting access to your records
            </DialogDescription>
          </DialogHeader>

          {pendingRequest && (
            <div className="space-y-4 py-4">
              <div className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Doctor</span>
                  <span className="font-medium">{pendingRequest.doctorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hospital</span>
                  <span className="font-medium">{pendingRequest.hospitalName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Access Type</span>
                  <Badge variant="outline">
                    {pendingRequest.accessType === "full"
                      ? "Full History"
                      : "General History"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Access Duration
                </label>
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One-Time Access</SelectItem>
                    <SelectItem value="one_hour">1 Hour</SelectItem>
                    <SelectItem value="two_hours">2 Hours</SelectItem>
                    <SelectItem value="twenty_four_hours">24 Hours</SelectItem>
                    <SelectItem value="one_week">1 Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleDenyRequest}
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4" />
                  Deny
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleApproveRequest}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Approve
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Access will be verified with biometric authentication
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
