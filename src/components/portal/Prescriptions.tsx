import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Pill,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Eye,
  RefreshCw,
  Loader2,
  Shield,
} from "lucide-react";
import { useIotaTransaction } from "@/hooks/useIotaTransaction";
import { iotaToNanos, nanosToIota, calculatePrescriptionFee } from "@/lib/sui-contracts";
import { toast } from "sonner";
import IotaLogo from "@/assets/iota-logo.svg";

interface PrescriptionData {
  id: string;
  objectId?: string; // On-chain object ID
  name: string;
  doctor: string;
  doctorAddress: string;
  pharmacyAddress: string;
  date: string;
  status: "pending" | "paid" | "fulfilled";
  amountSui: number; // Amount in SUI
  hasInsurance: boolean;
  insuranceNftId?: string;
  insuranceCoverage?: number; // percentage
}

// Local storage key
const PRESCRIPTIONS_KEY = "selora_prescriptions";

function getStoredPrescriptions(): PrescriptionData[] {
  try {
    const stored = localStorage.getItem(PRESCRIPTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePrescriptions(prescriptions: PrescriptionData[]): void {
  localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(prescriptions));
}

interface PrescriptionsProps {
  walletAddress?: string;
}

export const Prescriptions = ({ walletAddress }: PrescriptionsProps) => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [paymentModal, setPaymentModal] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [viewModal, setViewModal] = useState<string | null>(null);
  
  const { payPrescription, isPending, isConnected } = useIotaTransaction();

  // Load prescriptions on mount
  useEffect(() => {
    setPrescriptions(getStoredPrescriptions());
  }, []);

  // Handle self-pay payment (on-chain)
  const handleSelfPay = async () => {
    if (!paymentModal) return;
    
    const prescription = prescriptions.find((p) => p.id === paymentModal);
    if (!prescription || !prescription.objectId) {
      toast.error("Prescription not found or not on-chain");
      return;
    }

    setProcessing(true);
    try {
      const amountInNanos = iotaToNanos(prescription.amountSui);
      const result = await payPrescription(prescription.objectId, amountInNanos);

      if (result) {
        // Update local state
        const updated = prescriptions.map((p) =>
          p.id === paymentModal ? { ...p, status: "paid" as const } : p
        );
        setPrescriptions(updated);
        savePrescriptions(updated);
        
        const fee = calculatePrescriptionFee(amountInNanos);
        toast.success("Payment successful!", {
          description: `Paid ${prescription.amountSui} IOTA. Platform fee: ${nanosToIota(fee).toFixed(4)} IOTA`,
        });
        setPaymentModal(null);
      }
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("Payment failed", {
        description: "Transaction was rejected or failed. Please try again.",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle insurance payment (on-chain)
  const handleInsurancePay = async () => {
    if (!paymentModal) return;
    
    const prescription = prescriptions.find((p) => p.id === paymentModal);
    if (!prescription || !prescription.objectId) {
      toast.error("Prescription not found");
      return;
    }

    if (!prescription.hasInsurance || !prescription.insuranceNftId) {
      toast.error("No active insurance found");
      return;
    }

    setProcessing(true);
    try {
      // Calculate patient portion after insurance
      const totalAmount = prescription.amountSui;
      const insuranceCoverage = prescription.insuranceCoverage || 80;
      const patientPortion = totalAmount * (1 - insuranceCoverage / 100);
      const amountInNanos = iotaToNanos(patientPortion);

      // Call on-chain payment with insurance
      const result = await payPrescription(prescription.objectId, amountInNanos);

      if (result) {
        const updated = prescriptions.map((p) =>
          p.id === paymentModal ? { ...p, status: "paid" as const } : p
        );
        setPrescriptions(updated);
        savePrescriptions(updated);
        
        toast.success("Insurance payment successful!", {
          description: `Insurance covered ${insuranceCoverage}%. You paid ${patientPortion.toFixed(2)} SUI`,
        });
        setPaymentModal(null);
      }
    } catch (error) {
      console.error("Insurance payment failed:", error);
      toast.error("Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "paid":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "fulfilled":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Awaiting Payment";
      case "paid":
        return "Ready for Pickup";
      case "fulfilled":
        return "Completed";
      default:
        return status;
    }
  };

  const selectedPrescription = prescriptions.find((p) => p.id === paymentModal);
  const viewPrescription = prescriptions.find((p) => p.id === viewModal);

  // Calculate stats
  const pendingCount = prescriptions.filter((p) => p.status === "pending").length;
  const paidCount = prescriptions.filter((p) => p.status === "paid").length;
  const fulfilledCount = prescriptions.filter((p) => p.status === "fulfilled").length;

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button 
          variant="glass" 
          className="gap-2"
          onClick={() => setPrescriptions(getStoredPrescriptions())}
        >
          <RefreshCw className="w-4 h-4" />
          Sync Prescriptions
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-heading font-bold text-yellow-500">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-heading font-bold text-blue-500">{paidCount}</p>
          <p className="text-sm text-muted-foreground">Ready</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-heading font-bold text-green-500">{fulfilledCount}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
      </div>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-semibold text-lg">No prescriptions yet</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Once a doctor issues prescriptions to your wallet, they'll appear here.
            Payments are processed securely on the Sui blockchain.
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-heading font-semibold">All Prescriptions</h2>
          </div>
          <div className="divide-y divide-border/50">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Pill className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{prescription.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {prescription.doctor} • {prescription.date}
                      </p>
                      {prescription.hasInsurance && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          {prescription.insuranceCoverage}% Covered
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(prescription.status)}
                      <span className="text-sm">{getStatusLabel(prescription.status)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setViewModal(prescription.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {prescription.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => setPaymentModal(prescription.id)}
                          disabled={!isConnected}
                          className="gap-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pay {prescription.amountSui} SUI
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <Dialog open={!!paymentModal} onOpenChange={() => !processing && setPaymentModal(null)}>
        <DialogContent className="glass-card border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Pay Prescription
            </DialogTitle>
            <DialogDescription>
              Payment is processed on the Sui blockchain with 0.5% platform fee
            </DialogDescription>
          </DialogHeader>

          {selectedPrescription && (
            <div className="py-4 space-y-6">
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Pill className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedPrescription.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPrescription.doctor}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <div className="flex items-center justify-center gap-2">
                  <img src={IotaLogo} alt="IOTA" className="w-8 h-8" />
                  <span className="text-4xl font-heading font-bold">
                    {selectedPrescription.amountSui}
                  </span>
                  <span className="text-xl text-muted-foreground">IOTA</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Platform fee: {(selectedPrescription.amountSui * 0.005).toFixed(4)} IOTA (0.5%)
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full h-14 gap-3"
                  onClick={handleSelfPay}
                  disabled={processing || isPending}
                >
                  {processing || isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <img src={IotaLogo} alt="IOTA" className="w-5 h-5" />
                      Pay with IOTA Wallet
                    </>
                  )}
                </Button>

                {selectedPrescription.hasInsurance && (
                  <Button
                    variant="glass"
                    className="w-full h-14 gap-3"
                    onClick={handleInsurancePay}
                    disabled={processing || isPending}
                  >
                    {processing || isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Pay with Insurance ({selectedPrescription.insuranceCoverage}% covered)
                      </>
                    )}
                  </Button>
                )}
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Funds transfer instantly to the pharmacy. Transaction is immutable on Sui.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Prescription Modal */}
      <Dialog open={!!viewModal} onOpenChange={() => setViewModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>
          {viewPrescription && (
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medication</span>
                  <span className="font-medium">{viewPrescription.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prescriber</span>
                  <span className="font-medium">{viewPrescription.doctor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{viewPrescription.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={viewPrescription.status === "fulfilled" ? "default" : "outline"}>
                    {getStatusLabel(viewPrescription.status)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">{viewPrescription.amountSui} SUI</span>
                </div>
                {viewPrescription.objectId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">On-chain ID</span>
                    <span className="font-mono text-xs">
                      {viewPrescription.objectId.slice(0, 8)}...{viewPrescription.objectId.slice(-6)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};