'use client';

import { useState, useRef } from 'react';
import {
  Copy,
  Download,
  RefreshCw,
  Upload,
  Image,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function ImageToTextConverter() {
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock OCR function - in a real app, you would use a service like Tesseract.js or Google Vision API
  const simulateOCR = (file: File): Promise<string> => {
    return new Promise(resolve => {
      // Simulate processing time
      setTimeout(() => {
        // Mock extracted text based on file name or random samples
        const sampleTexts = [
          'This is sample extracted text from your image. In a real implementation, this would be processed using OCR technology like Tesseract.js or Google Vision API.',
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          'Sample document text:\n\nTitle: Important Document\n\nThis document contains important information that has been extracted from the uploaded image using OCR technology.',
          'Receipt Example:\n\nStore Name: Sample Store\nDate: 2024-01-15\nTotal: $25.99\n\nThank you for your purchase!',
        ];

        const randomText =
          sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        resolve(randomText);
      }, 2000); // 2 second delay to simulate processing
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);
    setExtractedText('');

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Simulate OCR processing
      const text = await simulateOCR(file);
      setExtractedText(text);
    } catch (error) {
      console.error('OCR processing failed:', error);
      setExtractedText(
        'Error: Failed to extract text from image. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
    }
  };

  const handleDownload = () => {
    if (!extractedText) return;

    const content = `Extracted Text from Image
Generated on: ${new Date().toLocaleString()}
Original file: ${fileName}

${extractedText}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setExtractedText('');
    setSelectedImage(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStats = () => {
    if (!extractedText) return null;

    const words = extractedText.trim().split(/\s+/).length;
    const lines = extractedText.split('\n').length;
    const characters = extractedText.length;

    return { words, lines, characters };
  };

  const stats = getStats();

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Image className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <label className="cursor-pointer">
              <span className="text-lg font-medium text-gray-900 dark:text-gray-50">
                Upload an image to extract text
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Supported formats: JPG, PNG, GIF, WEBP • Max size: 10MB
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Choose Image
          </button>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Processing image...
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Extracting text using OCR technology
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview and Results */}
      {(selectedImage || extractedText) && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Image Preview */}
          {selectedImage && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Uploaded Image
              </label>
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <img
                  src={selectedImage}
                  alt="Uploaded"
                  className="max-w-full h-auto rounded max-h-80 object-contain mx-auto"
                />
                {fileName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    {fileName}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Extracted Text */}
          {extractedText && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Extracted Text
              </label>
              <textarea
                className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
                value={extractedText}
                onChange={e => setExtractedText(e.target.value)}
                placeholder="Extracted text will appear here..."
              />
            </div>
          )}
        </div>
      )}

      {/* Demo Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Demo Mode
            </h3>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              This is a demo version that generates sample text. In a real
              implementation, this would use OCR libraries like Tesseract.js or
              cloud services like Google Vision API to extract actual text from
              images.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {extractedText && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Text
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Text
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Clear
          </button>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4">
          <span>Characters: {stats.characters}</span>
          <span className="text-gray-400 dark:text-gray-600">|</span>
          <span>Words: {stats.words}</span>
          <span className="text-gray-400 dark:text-gray-600">|</span>
          <span>Lines: {stats.lines}</span>
        </div>
      )}

      {/* Features List */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          Supported Use Cases
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>• Extract text from screenshots and documents</div>
          <div>• Convert handwritten notes to digital text</div>
          <div>• Process receipts and invoices</div>
          <div>• Extract text from signs and street photography</div>
          <div>• Convert old scanned documents to editable text</div>
        </div>
      </div>
    </div>
  );
}
