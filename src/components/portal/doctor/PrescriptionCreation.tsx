import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const mockPharmacies = [
  { id: "1", name: "Central Pharmacy", address: "0x1a2b...3c4d" },
  { id: "2", name: "HealthFirst Drugs", address: "0x5e6f...7a8b" },
  { id: "3", name: "MediCare Plus", address: "0x9c0d...1e2f" },
];

export const PrescriptionCreation = () => {
  const [formData, setFormData] = useState({
    patientAddress: "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    notes: "",
    pharmacy: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate prescription creation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Prescription created and sent to patient");
      setFormData({
        patientAddress: "",
        medication: "",
        dosage: "",
        frequency: "",
        duration: "",
        notes: "",
        pharmacy: "",
      });
    } catch (error) {
      toast.error("Failed to create prescription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
          Prescriptions & Orders
        </h1>
        <p className="text-muted-foreground">
          Create and manage digital prescriptions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescription Form */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <h2 className="font-heading text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              New Prescription
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patientAddress">Patient Wallet Address</Label>
                <Input
                  id="patientAddress"
                  placeholder="0x..."
                  value={formData.patientAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, patientAddress: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="medication">Medication Name</Label>
                  <Input
                    id="medication"
                    placeholder="Enter medication"
                    value={formData.medication}
                    onChange={(e) =>
                      setFormData({ ...formData, medication: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 500mg"
                    value={formData.dosage}
                    onChange={(e) =>
                      setFormData({ ...formData, dosage: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once daily</SelectItem>
                      <SelectItem value="twice">Twice daily</SelectItem>
                      <SelectItem value="three">Three times daily</SelectItem>
                      <SelectItem value="asneeded">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 7 days"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pharmacy">Preferred Pharmacy</Label>
                <Select
                  value={formData.pharmacy}
                  onValueChange={(value) =>
                    setFormData({ ...formData, pharmacy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pharmacy" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPharmacies.map((pharmacy) => (
                      <SelectItem key={pharmacy.id} value={pharmacy.id}>
                        {pharmacy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                <Send className="w-4 h-4" />
                {isSubmitting ? "Creating..." : "Create Prescription"}
              </Button>
            </form>
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-foreground mb-3">How it works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">1.</span>
                Fill in prescription details
              </li>
              <li className="flex gap-2">
                <span className="text-primary">2.</span>
                Prescription is encrypted & stored on Walrus
              </li>
              <li className="flex gap-2">
                <span className="text-primary">3.</span>
                Reference recorded on Sui blockchain
              </li>
              <li className="flex gap-2">
                <span className="text-primary">4.</span>
                Patient receives notification
              </li>
              <li className="flex gap-2">
                <span className="text-primary">5.</span>
                Patient pays & pharmacy fulfills
              </li>
            </ul>
          </div>

          <div className="glass-card p-5 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Privacy Notice</h4>
                <p className="text-sm text-muted-foreground">
                  Prescriptions are encrypted end-to-end. Only the patient and designated pharmacy can decrypt the contents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
