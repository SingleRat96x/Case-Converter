"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import AdScript from '@/components/ads/AdScript';

const CHARACTER_SETS = {
  Standard: "@%#*+=-:. ",
  Detailed: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  Blocks: "█▓▒░ ",
  Simple: "#@$%&?* ",
  Letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  Binary: "10 "
};

export function AsciiArtGenerator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [asciiArt, setAsciiArt] = useState<string>("");
  const [characterSet, setCharacterSet] = useState<string>("Standard");
  const [width, setWidth] = useState<number>(100);
  const [invertColors, setInvertColors] = useState(false);
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setAsciiArt("");
    }
  };

  const handleWidthChange = (value: number[]) => {
    setWidth(value[0]);
  };

  const handleManualWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value >= 10 && value <= 600) {
      setWidth(value);
    }
  };

  const convertToAscii = useCallback(async () => {
    if (!selectedFile || !canvasRef.current) return;

    setIsConverting(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const img = new Image();
      img.src = URL.createObjectURL(selectedFile);
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const aspectRatio = img.height / img.width;
      const height = Math.floor(width * aspectRatio * 0.5);
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const chars = CHARACTER_SETS[characterSet as keyof typeof CHARACTER_SETS];
      let result = "";

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const brightness = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          const charIndex = invertColors
            ? Math.floor((chars.length - 1) * (brightness / 255))
            : Math.floor((chars.length - 1) * (1 - brightness / 255));
          result += chars[charIndex];
        }
        result += "\\n";
      }

      setAsciiArt(result);
    } catch (error) {
      console.error("Error converting image to ASCII:", error);
    } finally {
      setIsConverting(false);
    }
  }, [selectedFile, width, characterSet, invertColors]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(asciiArt.replace(/\\n/g, "\n"));
  };

  const downloadAsTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([asciiArt.replace(/\\n/g, "\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "ascii-art.txt";
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
          <Label>Character Set</Label>
          <Select value={characterSet} onValueChange={setCharacterSet}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(CHARACTER_SETS).map((set) => (
                <SelectItem key={set} value={set}>
                  {set}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Width (characters): {width}</Label>
          <div className="flex gap-4">
            <div className="flex-grow">
              <Slider
                value={[width]}
                min={10}
                max={600}
                step={1}
                onValueChange={handleWidthChange}
                className="relative flex w-full touch-none select-none items-center"
              />
            </div>
            <Input
              type="number"
              min={10}
              max={600}
              value={width}
              onChange={handleManualWidthChange}
              className="w-24"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="invert-colors"
            checked={invertColors}
            onCheckedChange={setInvertColors}
          />
          <Label htmlFor="invert-colors">Invert colors</Label>
        </div>

        <Button
          onClick={convertToAscii}
          disabled={!selectedFile || isConverting}
          className="w-full"
        >
          {isConverting ? "Converting..." : "Generate ASCII Art"}
        </Button>
      </Card>

      <AdScript />

      <canvas ref={canvasRef} className="hidden" />

      {asciiArt && (
        <Card className="p-6 space-y-4">
          <pre
            className={`font-mono whitespace-pre overflow-x-auto p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-900"
            }`}
          >
            {asciiArt.split("\\n").map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </pre>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button onClick={copyToClipboard} className="w-full sm:w-auto min-w-[140px]">Copy to Clipboard</Button>
            <Button onClick={downloadAsTxt} className="w-full sm:w-auto min-w-[140px]">Download as TXT</Button>
          </div>
        </Card>
      )}
    </div>
  );
} 