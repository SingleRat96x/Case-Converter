"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function resizeImage(
  image: HTMLImageElement,
  width: number,
  height: number,
  maintainAspectRatio: boolean
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  let targetWidth = width;
  let targetHeight = height;

  if (maintainAspectRatio) {
    const ratio = image.width / image.height;
    if (width) {
      targetHeight = width / ratio;
    } else if (height) {
      targetWidth = height * ratio;
    }
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Use better quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error("Canvas is empty");
      }
      resolve(blob);
    }, "image/jpeg", 0.95);
  });
}

export function ImageResizer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Get original dimensions
      const img = new Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
        imageRef.current = img;
      };
      img.src = url;
    }
  };

  const handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(event.target.value) || 0;
    setWidth(newWidth);
    if (maintainAspectRatio && imageRef.current) {
      const ratio = imageRef.current.width / imageRef.current.height;
      setHeight(Math.round(newWidth / ratio));
    }
  };

  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(event.target.value) || 0;
    setHeight(newHeight);
    if (maintainAspectRatio && imageRef.current) {
      const ratio = imageRef.current.width / imageRef.current.height;
      setWidth(Math.round(newHeight * ratio));
    }
  };

  const handleResize = async () => {
    if (!imageRef.current || !selectedFile) return;

    setIsResizing(true);
    try {
      const resizedBlob = await resizeImage(
        imageRef.current,
        width,
        height,
        maintainAspectRatio
      );

      // Create download link
      const url = URL.createObjectURL(resizedBlob);
      const link = document.createElement("a");
      link.href = url;
      const extension = selectedFile.name.split(".").pop() || "jpg";
      link.download = `resized_${width}x${height}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error resizing image:", error);
    } finally {
      setIsResizing(false);
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
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full"
                style={{ maxHeight: "70vh" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={width || ""}
                  onChange={handleWidthChange}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height || ""}
                  onChange={handleHeightChange}
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="aspect-ratio"
                checked={maintainAspectRatio}
                onCheckedChange={setMaintainAspectRatio}
              />
              <Label htmlFor="aspect-ratio">Maintain Aspect Ratio</Label>
            </div>

            <Button
              onClick={handleResize}
              disabled={isResizing || !width || !height}
              className="w-full"
            >
              {isResizing ? "Resizing..." : "Download Resized Image"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
} 