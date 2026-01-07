import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { extractTextFromImage } from '@/lib/ocrService';
import { useIotaTransaction } from '@/hooks/useIotaTransaction';

export function ScanOldRecord() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { uploadScannedRecord } = useIotaTransaction();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result?.toString().split(',')[1];
        if (!base64) throw new Error('Failed to read file');

        // Call OCR API
        const ocrResult = await extractTextFromImage(base64, file.type);
        
        setResult(ocrResult);
        toast.success('Document scanned successfully!');

        // Upload to blockchain
        await uploadScannedRecord(
          ocrResult.documentType,
          ocrResult.extractedText,
          'walrus://placeholder', // Replace with actual Walrus upload
          ocrResult.suggestedTags.join(',')
        );

        toast.success('Uploaded to blockchain!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan document');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Scan Old Medical Record</h2>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="mb-4"
        disabled={isScanning}
      />

      {isScanning && <p>Scanning document...</p>}

      {result && (
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="font-semibold">Extracted Text:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-64">
              {result.extractedText}
            </pre>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Document Type</p>
              <p className="font-semibold">{result.documentType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Confidence</p>
              <p className="font-semibold">{result.confidence}%</p>
            </div>
          </div>

          {result.keyFindings.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Key Findings:</h4>
              <ul className="list-disc pl-5">
                {result.keyFindings.map((finding: string, i: number) => (
                  <li key={i}>{finding}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600">Suggested Tags</p>
            <div className="flex gap-2 mt-2">
              {result.suggestedTags.map((tag: string, i: number) => (
                <span key={i} className="bg-blue-100 px-2 py-1 rounded text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
