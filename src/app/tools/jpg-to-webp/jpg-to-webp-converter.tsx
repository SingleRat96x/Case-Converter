"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function JpgToWebpConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [quality, setQuality] = useState(80);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/jpg")) {
      setSelectedFile(file);
    } else {
      alert("Please select a valid JPG/JPEG file");
      event.target.value = "";
    }
  };

  const convertToWebp = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    try {
      // Create a canvas element to draw the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      // Create an image element to load the file
      const img = new Image();
      img.src = URL.createObjectURL(selectedFile);
      
      await new Promise((resolve) => {
        img.onload = () => {
          // Set canvas dimensions to match the image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw the image onto the canvas
          ctx?.drawImage(img, 0, 0);
          
          // Convert to WebP and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = selectedFile.name.replace(/\.(jpg|jpeg)$/i, ".webp");
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
            resolve(null);
          }, "image/webp", quality / 100);
        };
      });
    } catch (error) {
      console.error("Error converting image:", error);
      alert("Error converting image. Please try again.");
    } finally {
      setIsConverting(false);
      setSelectedFile(null);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) input.value = "";
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="image-input">Select JPG/JPEG Image</Label>
          <Input
            id="image-input"
            type="file"
            accept=".jpg,.jpeg"
            onChange={handleFileChange}
            disabled={isConverting}
          />
        </div>
        <div className="space-y-2">
          <Label>Quality: {quality}%</Label>
          <Slider
            value={[quality]}
            onValueChange={(value: number[]) => setQuality(value[0])}
            min={1}
            max={100}
            step={1}
            disabled={isConverting}
          />
        </div>
        <Button
          onClick={convertToWebp}
          disabled={!selectedFile || isConverting}
          className="w-full"
        >
          {isConverting ? "Converting..." : "Convert to WebP"}
        </Button>
      </div>
    </Card>
  );
} 