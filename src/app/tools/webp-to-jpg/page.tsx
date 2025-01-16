import type { Metadata } from "next";
import { getToolContent } from "@/lib/tools";
import { WebpToJpgConverter } from "./webp-to-jpg-converter";
import { generatePageMetadata } from "@/lib/metadata";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('webp-to-jpg');
  return generatePageMetadata(
    'tool',
    'webp-to-jpg',
    tool?.title || 'WebP to JPG Converter',
    tool?.short_description || 'Convert WebP images to JPG format'
  );
}

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