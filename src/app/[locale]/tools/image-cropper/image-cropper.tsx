"use client";

import { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error("Canvas is empty");
      }
      resolve(blob);
    }, "image/jpeg", 1);
  });
}

export function ImageCropper() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Reset crop when new image is selected
      setCrop({
        unit: "px",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
      setCompletedCrop(null);
    }
  };

  const handleCrop = async () => {
    if (!imageRef.current || !completedCrop) return;

    try {
      const croppedBlob = await getCroppedImg(imageRef.current, completedCrop);
      const croppedUrl = URL.createObjectURL(croppedBlob);
      
      // Create download link
      const link = document.createElement("a");
      link.href = croppedUrl;
      link.download = "cropped-image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(croppedUrl);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
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

        {previewUrl && (
          <div className="space-y-4">
            <div className="max-w-full overflow-auto">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
              >
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Upload"
                  className="max-w-full"
                  style={{ maxHeight: "70vh" }}
                />
              </ReactCrop>
            </div>

            <Button
              onClick={handleCrop}
              disabled={!completedCrop}
              className="w-full"
            >
              Download Cropped Image
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
} 