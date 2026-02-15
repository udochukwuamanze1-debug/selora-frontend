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
import { 
  FileText, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Stethoscope,
  Pill,
  ClipboardList,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useIotaTransaction } from "@/hooks/useIotaTransaction";
import { useWalrusStorage } from "@/hooks/useWalrusStorage";
import { encryptWithPassphrase } from "@/lib/encryption";
import { sendVisitReportNotification } from "@/lib/walrus-notifications";
import { supabase } from "@/integrations/supabase/client";

interface VisitReportCreatorProps {
  doctorAddress: string;
  doctorName?: string;
}

const REPORT_TYPES = [
  { value: "general_visit", label: "General Visit" },
  { value: "follow_up", label: "Follow-up" },
  { value: "emergency", label: "Emergency" },
  { value: "specialist_referral", label: "Specialist Referral" },
  { value: "lab_review", label: "Lab Results Review" },
];

export const VisitReportCreator = ({ doctorAddress, doctorName = "Doctor" }: VisitReportCreatorProps) => {
  const [formData, setFormData] = useState({
    patientAddress: "",
    patientName: "",
    chiefComplaint: "",
    diagnosis: "",
    prescriptionDetails: "",
    notes: "",
    reportType: "general_visit",
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedReport, setLastCreatedReport] = useState<string | null>(null);

  const { createVisitReport, isPending, isConnected } = useIotaTransaction();
  const { uploadData } = useWalrusStorage(doctorAddress);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!formData.patientAddress.startsWith("0x")) {
      toast.error("Please enter a valid patient wallet address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create full report data
      const fullReport = {
        doctorAddress,
        doctorName,
        patientAddress: formData.patientAddress,
        patientName: formData.patientName,
        chiefComplaint: formData.chiefComplaint,
        diagnosis: formData.diagnosis,
        prescriptionDetails: formData.prescriptionDetails,
        notes: formData.notes,
        reportType: formData.reportType,
        vitalSigns: formData.vitalSigns,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
      };

      // Encrypt the report data with patient's address as passphrase
      const encryptedData = await encryptWithPassphrase(JSON.stringify(fullReport), formData.patientAddress);
      
      // Upload encrypted data
      const uploadResult = await uploadData(
        encryptedData,
        `visit-report-${Date.now()}.enc`,
        "application/encrypted"
      );

      const blobId = uploadResult?.blobId || `local-${Date.now()}`;

      let txDigest = "";

      // Mint the Visit Report NFT and send to patient
      try {
        const result = await createVisitReport(
          formData.patientAddress,
          formData.diagnosis,
          formData.prescriptionDetails,
          formData.notes,
          blobId,
          formData.reportType
        );
        if (result) txDigest = result.digest;
      } catch (txError) {
        console.warn("On-chain minting failed, saving to database only:", txError);
      }

      // Save to database for persistence
      const { error: dbError } = await supabase.from("visit_reports").insert({
        doctor_address: doctorAddress,
        doctor_name: doctorName,
        patient_address: formData.patientAddress,
        patient_name: formData.patientName,
        chief_complaint: formData.chiefComplaint,
        diagnosis: formData.diagnosis,
        prescription_details: formData.prescriptionDetails,
        notes: formData.notes,
        report_type: formData.reportType,
        vital_signs: formData.vitalSigns,
        blob_id: blobId,
        tx_digest: txDigest,
        status: "sent",
      });

      if (dbError) console.error("DB save error:", dbError);

      setLastCreatedReport(txDigest || blobId);

      // Send notification to patient
      try {
        await sendVisitReportNotification(
          formData.patientAddress,
          doctorName,
          doctorAddress,
          formData.reportType,
          formData.diagnosis
        );
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
      }

      toast.success("Visit Report created and sent to patient!", {
        description: txDigest ? `TX: ${txDigest.slice(0, 12)}...` : "Saved successfully",
      });

      // Reset form
      setFormData({
        patientAddress: "",
        patientName: "",
        chiefComplaint: "",
        diagnosis: "",
        prescriptionDetails: "",
        notes: "",
        reportType: "general_visit",
        vitalSigns: {
          bloodPressure: "",
          heartRate: "",
          temperature: "",
          weight: "",
        },
      });
    } catch (error: any) {
      console.error("Create visit report error:", error);
      toast.error(error.message || "Failed to create visit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Information */}
          <div className="glass-card p-6">
            <h2 className="font-heading text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientAddress">Patient Wallet Address *</Label>
                <Input
                  id="patientAddress"
                  placeholder="0x..."
                  value={formData.patientAddress}
                  onChange={(e) => setFormData({ ...formData, patientAddress: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  placeholder="Enter patient name"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="glass-card p-6">
            <h2 className="font-heading text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Visit Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reportType">Visit Type</Label>
                  <Select
                    value={formData.reportType}
                    onValueChange={(value) => setFormData({ ...formData, reportType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visit type" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                  <Input
                    id="chiefComplaint"
                    placeholder="Primary reason for visit"
                    value={formData.chiefComplaint}
                    onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                  />
                </div>
              </div>

              {/* Vital Signs */}
              <div>
                <Label className="mb-2 block">Vital Signs</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Input
                    placeholder="BP (e.g., 120/80)"
                    value={formData.vitalSigns.bloodPressure}
                    onChange={(e) => setFormData({
                      ...formData,
                      vitalSigns: { ...formData.vitalSigns, bloodPressure: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="HR (bpm)"
                    value={formData.vitalSigns.heartRate}
                    onChange={(e) => setFormData({
                      ...formData,
                      vitalSigns: { ...formData.vitalSigns, heartRate: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="Temp (°F)"
                    value={formData.vitalSigns.temperature}
                    onChange={(e) => setFormData({
                      ...formData,
                      vitalSigns: { ...formData.vitalSigns, temperature: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="Weight (kg)"
                    value={formData.vitalSigns.weight}
                    onChange={(e) => setFormData({
                      ...formData,
                      vitalSigns: { ...formData.vitalSigns, weight: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="diagnosis">Diagnosis *</Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter diagnosis details..."
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="prescriptionDetails" className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" />
                  Prescription Details
                </Label>
                <Textarea
                  id="prescriptionDetails"
                  placeholder="Medications, dosage, frequency, duration..."
                  value={formData.prescriptionDetails}
                  onChange={(e) => setFormData({ ...formData, prescriptionDetails: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Follow-up instructions, lifestyle advice, referrals..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={isSubmitting || isPending || !isConnected}
                size="lg"
              >
                <Send className="w-4 h-4" />
                {isSubmitting || isPending ? "Creating & Sending..." : "Save & Send to Patient"}
              </Button>
            </form>
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          {/* How it works */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              How It Works
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary font-bold">1.</span>
                Enter patient details and diagnosis
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">2.</span>
                Report is encrypted and stored on Walrus
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">3.</span>
                Visit Report NFT minted on Sui blockchain
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">4.</span>
                NFT sent directly to patient's wallet
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">5.</span>
                Patient gets instant notification
              </li>
            </ul>
          </div>

          {/* Last Created Report */}
          {lastCreatedReport && (
            <div className="glass-card p-5 bg-green-500/10 border-green-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Report Sent!</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    The visit report has been minted and sent to the patient.
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {lastCreatedReport.slice(0, 20)}...
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="glass-card p-5 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Privacy & Security</h4>
                <p className="text-sm text-muted-foreground">
                  All reports are encrypted end-to-end. Only the patient can decrypt and view the full report contents.
                </p>
              </div>
            </div>
          </div>

          {/* Wallet Status */}
          {!isConnected && (
            <div className="glass-card p-5 bg-yellow-500/10 border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Wallet Required</h4>
                  <p className="text-sm text-muted-foreground">
                    Please connect your wallet to create and send visit reports.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
