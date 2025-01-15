import type { Metadata } from "next";
import { PngToJpgConverter } from "./png-to-jpg-converter";

export const metadata: Metadata = {
  title: "PNG to JPG Converter - Free Online Tool",
  description: "Convert your PNG images to JPG format. Our free online converter helps you convert PNG images to the widely supported JPG format with customizable quality settings.",
};

export default function PngToJpgPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">PNG to JPG Converter</h1>
      <p className="text-lg mb-8">
        Convert your PNG images to JPG/JPEG format. This tool helps you convert PNG 
        images to the widely supported JPG format, perfect for when you need smaller 
        file sizes or compatibility with systems that require JPG images.
      </p>
      <PngToJpgConverter />
    </div>
  );
} 