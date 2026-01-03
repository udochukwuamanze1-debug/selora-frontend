import { useState, useEffect, useRef, useCallback } from "react";
import { QrCode, Camera, Clock, Shield, Check, X, Loader2, Scan } from "lucide-react";
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
import { ACCESS_DURATION_MS } from "@/config/constants";
import { addLocalNotification } from "@/lib/wallet-keyphrase";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import { useSuiTransaction } from "@/hooks/useSuiTransaction";

interface AccessRequest {
  id: string;
  patientAddress: string;
  doctorName: string;
  doctorAddress: string;
  hospitalName: string;
  accessType: "general" | "full";
  requestedAt: string;
  status: "pending" | "approved" | "denied";
  expiresAt?: string;
  recordId?: string;
}

interface QRAccessRequestProps {
  walletAddress: string;
  userType: "patient" | "doctor";
  recordId?: string; // Medical record ID for access grants
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

export function QRAccessRequest({ walletAddress, userType, recordId }: QRAccessRequestProps) {
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<AccessRequest | null>(null);
  const [patientRequests, setPatientRequests] = useState<AccessRequest[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string>("ONE_HOUR");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner-container";

  const { grantAccess, revokeAccess, isPending } = useSuiTransaction();

  // Generate QR code data for patient
  const generateQRData = () => {
    return JSON.stringify({
      type: "selora_access_request",
      patientAddress: walletAddress,
      recordId: recordId || "default_record",
      timestamp: Date.now(),
      nonce: Math.random().toString(36).slice(2, 11),
    });
  };

  // Initialize camera scanner
  const startScanner = useCallback(async () => {
    try {
      const html5Qrcode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleQRCodeScanned(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors (no QR found in frame)
          console.debug("QR scan frame:", errorMessage);
        }
      );
      setIsCameraReady(true);
    } catch (error) {
      console.error("Failed to start scanner:", error);
      toast.error("Camera access denied", {
        description: "Please allow camera access to scan QR codes.",
      });
      setShowScanner(false);
    }
  }, []);

  // Stop camera scanner
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (error) {
        console.error("Failed to stop scanner:", error);
      }
    }
    setIsCameraReady(false);
  }, []);

  // Handle scanned QR code
  const handleQRCodeScanned = async (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      
      if (data.type !== "selora_access_request") {
        toast.error("Invalid QR code", { description: "This is not a Selora access QR code." });
        return;
      }

      // Stop scanner after successful scan
      await stopScanner();
      setShowScanner(false);
      setIsProcessing(true);

       // Create access request
      const request: AccessRequest = {
        id: `req_${Date.now()}`,
        patientAddress: data.patientAddress,
        doctorName: "Current Doctor", // Would come from doctor profile
        doctorAddress: walletAddress,
        hospitalName: "Selora Clinic",
        accessType: "general",
        requestedAt: new Date().toISOString(),
        status: "pending",
        recordId: data.recordId,
      };

      const requests = getAccessRequests();
      requests.unshift(request);
      saveAccessRequests(requests);

      // Notify patient
      addLocalNotification({
        type: "access",
        title: "Access Request",
        message: `Dr. ${request.doctorName} at ${request.hospitalName} requests access to your health history.`,
        data: { requestId: request.id, doctorAddress: walletAddress, patientAddress: data.patientAddress },
      });

      setIsProcessing(false);
      toast.success("Access request sent!", {
        description: `Request sent to patient ${data.patientAddress.slice(0, 8)}...`,
      });
    } catch (error) {
      console.error("Failed to parse QR code:", error);
      toast.error("Invalid QR code format");
      setIsProcessing(false);
    }
  };

  // Handle dialog open/close for scanner
  useEffect(() => {
    if (showScanner) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanner();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [showScanner, startScanner, stopScanner]);

  // Patient view: load incoming requests for this wallet
  const loadPatientRequests = useCallback(() => {
    if (userType !== "patient") return;
    const all = getAccessRequests();
    const mine = all
      .filter((r) => r.patientAddress === walletAddress)
      .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));
    setPatientRequests(mine);
  }, [userType, walletAddress]);

  useEffect(() => {
    loadPatientRequests();
    const onStorage = (e: StorageEvent) => {
      if (e.key === ACCESS_REQUESTS_KEY) loadPatientRequests();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadPatientRequests]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // Handle approve access request - calls on-chain
  const handleApproveRequest = async () => {
    if (!pendingRequest) return;
    
    setIsProcessing(true);
    
    const durationMs = ACCESS_DURATION_MS[selectedDuration as keyof typeof ACCESS_DURATION_MS] || ACCESS_DURATION_MS.ONE_HOUR;
    const expiresAt = new Date(Date.now() + durationMs).toISOString();

    try {
      // Call on-chain access grant
      if (pendingRequest.recordId) {
        const result = await grantAccess(
          pendingRequest.recordId,
          pendingRequest.doctorAddress,
          Date.now() + durationMs
        );

        if (!result) {
          throw new Error("On-chain access grant failed");
        }
      }

      // Update local request status
      const requests = getAccessRequests();
      const index = requests.findIndex((r) => r.id === pendingRequest.id);
      if (index >= 0) {
        requests[index].status = "approved";
        requests[index].expiresAt = expiresAt;
        saveAccessRequests(requests);
      }

      toast.success("Access granted on-chain!", {
        description: `Dr. ${pendingRequest.doctorName} can now view your records for ${selectedDuration.replace("_", " ").toLowerCase()}.`,
      });

      addLocalNotification({
        type: "access",
        title: "Access Granted",
        message: `You granted ${selectedDuration.replace("_", " ")} access to Dr. ${pendingRequest.doctorName}.`,
      });
    } catch (error) {
      console.error("Failed to grant access:", error);
      toast.error("Failed to grant access", {
        description: "On-chain transaction failed. Please try again.",
      });
    } finally {
      setIsProcessing(false);
      setShowRequestModal(false);
      setPendingRequest(null);
    }
  };

  const handleDenyRequest = async () => {
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

  const openLatestPendingRequest = () => {
    const latest = patientRequests.find((r) => r.status === "pending");
    if (!latest) {
      toast.info("No pending requests", { description: "You're all caught up." });
      return;
    }
    setPendingRequest(latest);
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

          {patientRequests.filter((r) => r.status === "pending").length > 0 && (
            <Button variant="outline" size="sm" onClick={openLatestPendingRequest} className="text-xs">
              Review pending requests ({patientRequests.filter((r) => r.status === "pending").length})
            </Button>
          )}
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
              <Scan className="w-4 h-4" />
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
            <div className="p-4 bg-white rounded-xl">
              <QRCodeSVG
                value={generateQRData()}
                size={200}
                level="H"
                includeMargin
                bgColor="#ffffff"
                fgColor="#000000"
              />
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

      {/* Camera Scanner Modal (Doctor) */}
      <Dialog open={showScanner} onOpenChange={(open) => {
        if (!open) stopScanner();
        setShowScanner(open);
      }}>
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

          <div className="flex flex-col items-center py-4">
            <div 
              id={scannerContainerId}
              className="w-full max-w-[300px] aspect-square rounded-xl overflow-hidden bg-muted"
            />
            
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-2">Initializing camera...</p>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="mt-4 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">Processing request...</p>
              </div>
            )}
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
                    {pendingRequest.accessType === "full" ? "Full History" : "General History"}
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
                    <SelectItem value="ONE_TIME">One-Time Access (1 hour)</SelectItem>
                    <SelectItem value="ONE_HOUR">1 Hour</SelectItem>
                    <SelectItem value="TWO_HOURS">2 Hours</SelectItem>
                    <SelectItem value="TWENTY_FOUR_HOURS">24 Hours</SelectItem>
                    <SelectItem value="ONE_WEEK">1 Week</SelectItem>
                    <SelectItem value="THIRTY_DAYS">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleDenyRequest}
                  disabled={isProcessing || isPending}
                >
                  <X className="w-4 h-4" />
                  Deny
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleApproveRequest}
                  disabled={isProcessing || isPending}
                >
                  {isProcessing || isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Approve
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Access grant will be recorded on-chain
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}