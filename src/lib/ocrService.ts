// src/lib/ocrService.ts
const OCR_API_URL = import.meta.env.VITE_OCR_API_URL || 'http://localhost:3001';

export interface OCRResult {
  extractedText: string;
  documentType: 'lab_result' | 'prescription' | 'imaging_report' | 'discharge_summary' | 'medical_certificate' | 'other';
  confidence: number;
  keyFindings: string[];
  patientInfo: {
    name?: string;
    date?: string;
  } | null;
  suggestedTags: string[];
}

export async function extractTextFromImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<OCRResult> {
  const response = await fetch(`${OCR_API_URL}/api/ocr/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64,
      mimeType,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'OCR extraction failed' }));
    throw new Error(error.error || 'OCR extraction failed');
  }

  return response.json();
}

export async function uploadAndExtract(file: File): Promise<OCRResult> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${OCR_API_URL}/api/ocr/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('OCR upload failed');
  }

  return response.json();
}
