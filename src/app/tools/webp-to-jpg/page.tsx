import type { Metadata } from "next";
import { WebpToJpgConverter } from "./webp-to-jpg-converter";

export const metadata: Metadata = {
  title: "WebP to JPG Converter - Free Online Tool",
  description: "Convert your WebP images to JPG format. Our free online converter helps you transform WebP images into the widely supported JPG format with customizable quality settings.",
};

export default function WebpToJpgPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">WebP to JPG Converter</h1>
      <p className="text-lg mb-8">
        Transform your WebP images into the traditional JPG format. This converter is 
        ideal when you need to use your WebP images with applications or services that 
        do not support the WebP format, ensuring broader compatibility.
      </p>
      <WebpToJpgConverter />
    </div>
  );
} 