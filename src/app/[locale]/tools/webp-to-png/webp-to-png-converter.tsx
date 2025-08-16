"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WebpToPngConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "image/webp") {
      setSelectedFile(file);
    } else {
      alert("Please select a valid WebP file");
      event.target.value = "";
    }
  };

  const convertToPng = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    try {
      // Create a canvas element to draw the image
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      // Create an image element to load the file
      const img = new Image();
      img.src = URL.createObjectURL(selectedFile);
      
      await new Promise((resolve) => {
        img.onload = () => {
          // Set canvas dimensions to match the image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw the image onto the canvas
          ctx.drawImage(img, 0, 0);
          
          // Convert to PNG and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = selectedFile.name.replace(/\.webp$/i, ".png");
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
            resolve(null);
          }, "image/png");
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
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image-input">Select WebP Image</Label>
          <Input
            id="image-input"
            type="file"
            accept=".webp"
            onChange={handleFileChange}
            disabled={isConverting}
          />
        </div>
        <Button
          onClick={convertToPng}
          disabled={!selectedFile || isConverting}
          className="w-full"
        >
          {isConverting ? "Converting..." : "Convert to PNG"}
        </Button>
      </div>
    </Card>
  );
} 