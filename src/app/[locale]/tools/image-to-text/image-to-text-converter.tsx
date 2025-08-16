'use client';

import { useState } from 'react';
import * as Tesseract from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from 'next-themes';

// Common languages for OCR
const LANGUAGES = {
  eng: "English",
  fra: "French",
  deu: "German",
  spa: "Spanish",
  ita: "Italian",
  por: "Portuguese",
  rus: "Russian",
  chi_sim: "Chinese (Simplified)",
  jpn: "Japanese",
  kor: "Korean",
  ara: "Arabic",
};

export function ImageToTextConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");
  const [language, setLanguage] = useState<string>("eng");
  const [progress, setProgress] = useState<number>(0);
  const { theme } = useTheme();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setExtractedText("");
      setProgress(0);
    }
  };

  const performOCR = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(
        selectedFile,
        language,
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );
      
      setExtractedText(result.data.text || "No text was found in the image.");
      setProgress(100);
    } catch (error) {
      console.error("Error performing OCR:", error);
      setExtractedText("Error: Failed to extract text from the image. Please try again.");
    } finally {
      setIsConverting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
  };

  const downloadAsTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([extractedText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "extracted-text.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image-upload">Select Image</Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <Label>Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={performOCR}
          disabled={!selectedFile || isConverting}
          className="w-full relative overflow-hidden"
        >
          {isConverting ? (
            <>
              Converting... {Math.round(progress)}%
              <div
                className="absolute left-0 top-0 h-full bg-primary/20 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </>
          ) : (
            "Extract Text"
          )}
        </Button>
      </Card>

      {extractedText && (
        <Card className="p-6 space-y-4">
          <Textarea
            value={extractedText}
            readOnly
            className="min-h-[200px] font-mono"
          />
          <div className="flex gap-2">
            <Button onClick={copyToClipboard}>Copy to Clipboard</Button>
            <Button onClick={downloadAsTxt}>Download as TXT</Button>
          </div>
        </Card>
      )}
    </div>
  );
} 