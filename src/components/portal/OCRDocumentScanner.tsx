import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Camera,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWalrusStorage } from "@/hooks/useWalrusStorage";
import { encryptWithPassphrase } from "@/lib/encryption";

interface OCRDocumentScannerProps {
  walletAddress: string;
  onRecordSaved?: () => void;
}

interface OCRResult {
  extractedText: string;
  documentType: string;
  confidence: number;
  keyFindings: string[];
  patientInfo: { name?: string; date?: string } | null;
  suggestedTags: string[];
}

const DOCUMENT_TYPES = [
  { value: "lab_result", label: "Lab Result" },
  { value: "prescription", label: "Prescription" },
  { value: "imaging_report", label: "Imaging Report" },
  { value: "discharge_summary", label: "Discharge Summary" },
  { value: "medical_certificate", label: "Medical Certificate" },
  { value: "other", label: "Other Document" },
];

export const OCRDocumentScanner = ({ walletAddress, onRecordSaved }: OCRDocumentScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [editedText, setEditedText] = useState("");
  const [selectedType, setSelectedType] = useState("other");
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadData, isUploading } = useWalrusStorage(walletAddress);

  const resetState = () => {
    setCapturedImage(null);
    setImageFile(null);
    setOcrResult(null);
    setEditedText("");
    setSelectedType("other");
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetState();
    setIsOpen(false);
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const processWithOCR = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    try {
      // Extract base64 data
      const base64Data = capturedImage.split(",")[1];
      const mimeType = capturedImage.split(";")[0].split(":")[1];

      const { data, error } = await supabase.functions.invoke("ocr-extract", {
        body: { imageBase64: base64Data, mimeType },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setOcrResult(data);
      setEditedText(data.extractedText);
      setSelectedType(data.documentType || "other");
      toast.success("Text extracted successfully!");
    } catch (error: any) {
      console.error("OCR error:", error);
      toast.error(error.message || "Failed to extract text from image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveRecord = async () => {
    if (!editedText.trim()) {
      toast.error("Please extract text before saving");
      return;
    }

    setIsSaving(true);
    try {
      // Create self-reported record data
      const recordData = {
        type: "self-reported",
        documentType: selectedType,
        extractedText: editedText,
        originalImageRef: capturedImage ? `image-${Date.now()}` : null,
        keyFindings: ocrResult?.keyFindings || [],
        suggestedTags: ocrResult?.suggestedTags || [],
        confidence: ocrResult?.confidence || 0,
        scannedAt: new Date().toISOString(),
        walletAddress,
      };

      // Encrypt and upload the data
      const encryptedData = await encryptWithPassphrase(JSON.stringify(recordData), walletAddress);
      const result = await uploadData(
        encryptedData,
        `scanned-record-${Date.now()}.enc`,
        "application/encrypted"
      );

      if (result) {
        toast.success("Record saved to your Health Archive!", {
          description: "Marked as self-reported for verification tracking",
        });
        onRecordSaved?.();
        handleClose();
      }
    } catch (error: any) {
      console.error("Save record error:", error);
      toast.error(error.message || "Failed to save record");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="glass"
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Camera className="w-4 h-4" />
        Scan Document
      </Button>

      {/* Scanner Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Scan Paper Document
            </DialogTitle>
            <DialogDescription>
              Take a photo or upload an image of your medical document. AI will extract the text.
            </DialogDescription>
          </DialogHeader>

          {/* Hidden file inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          <div className="space-y-4">
            {/* Step 1: Capture/Upload Image */}
            {!capturedImage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-32 flex-col gap-3"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="w-8 h-8 text-primary" />
                    <span>Take Photo</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-32 flex-col gap-3"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-primary" />
                    <span>Upload Image</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Supported formats: JPG, PNG, HEIC • Max 10MB
                </p>
              </div>
            )}

            {/* Step 2: Show captured image */}
            {capturedImage && !ocrResult && (
              <div className="space-y-4">
                <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Captured document"
                    className="w-full h-full object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80"
                    onClick={resetState}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  className="w-full gap-2"
                  onClick={processWithOCR}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Extracting text with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Extract Text with AI
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 3: Review and edit extracted text */}
            {ocrResult && (
              <div className="space-y-4">
                {/* Confidence indicator */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  {ocrResult.confidence >= 80 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="text-sm">
                    Extraction confidence: {ocrResult.confidence}%
                  </span>
                </div>

                {/* Document type selector */}
                <div>
                  <Label>Document Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Key findings */}
                {ocrResult.keyFindings.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Key Findings Detected</Label>
                    <div className="flex flex-wrap gap-2">
                      {ocrResult.keyFindings.map((finding, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {finding}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Editable extracted text */}
                <div>
                  <Label htmlFor="extractedText">Extracted Text (editable)</Label>
                  <Textarea
                    id="extractedText"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                {/* Self-reported badge notice */}
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      This record will be saved as <strong>Self-Reported</strong> and marked differently from verified doctor records.
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetState} className="flex-1">
                    Scan Another
                  </Button>
                  <Button
                    onClick={handleSaveRecord}
                    disabled={isSaving || isUploading}
                    className="flex-1 gap-2"
                  >
                    {isSaving || isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save to Archive
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
