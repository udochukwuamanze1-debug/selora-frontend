import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from "lucide-react";

const mockPrescriptions: {
  id: string;
  name: string;
  doctor: string;
  date: string;
  status: "pending" | "paid" | "fulfilled";
  amount: string;
}[] = [];

export const Prescriptions = () => {
  const [paymentModal, setPaymentModal] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handlePayment = async (method: "sui" | "fiat") => {
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setProcessing(false);
    setPaymentModal(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-secondary" />;
      case "paid":
        return <AlertCircle className="w-4 h-4 text-primary" />;
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

  const selectedPrescription = mockPrescriptions.find(
    (p) => p.id === paymentModal
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
            Medication & Prescriptions
          </h1>
          <p className="text-muted-foreground">
            Manage your prescriptions and payments
          </p>
        </div>
        <Button variant="glass" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Sync Prescriptions
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-heading font-bold text-secondary">
            {mockPrescriptions.filter((p) => p.status === "pending").length}
          </p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-heading font-bold text-primary">
            {mockPrescriptions.filter((p) => p.status === "paid").length}
          </p>
          <p className="text-sm text-muted-foreground">Ready</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-2xl font-heading font-bold text-green-500">
            {mockPrescriptions.filter((p) => p.status === "fulfilled").length}
          </p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
      </div>

      {/* Prescriptions List */}
      {mockPrescriptions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-semibold text-lg">No prescriptions yet</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Once a doctor issues prescriptions to your wallet, they’ll appear here.
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-heading font-semibold">All Prescriptions</h2>
          </div>
          <div className="divide-y divide-border/50">
            {mockPrescriptions.map((prescription) => (
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
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(prescription.status)}
                      <span className="text-sm">{getStatusLabel(prescription.status)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {prescription.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => setPaymentModal(prescription.id)}
                          className="gap-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pay ${prescription.amount}
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
      <Dialog
        open={!!paymentModal}
        onOpenChange={() => !processing && setPaymentModal(null)}
      >
        <DialogContent className="glass-card border-selora-glass-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Pay Prescription
            </DialogTitle>
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

              <div className="text-center">
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <p className="text-4xl font-heading font-bold">
                  ${selectedPrescription.amount}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full h-14 gap-3"
                  onClick={() => handlePayment("sui")}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                        <span className="text-xs font-bold">S</span>
                      </div>
                      Pay with Sui
                    </>
                  )}
                </Button>

                <Button
                  variant="glass"
                  className="w-full h-14 gap-3"
                  onClick={() => handlePayment("fiat")}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay with Card
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Payment is securely processed on the Sui blockchain
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
