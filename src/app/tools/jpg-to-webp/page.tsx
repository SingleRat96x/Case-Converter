import type { Metadata } from "next";
import { JpgToWebpConverter } from "./jpg-to-webp-converter";
import { getToolContent } from "@/lib/tools";
import { generatePageMetadata } from "@/lib/metadata";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('jpg-to-webp');
  return generatePageMetadata(
    'tool',
    'jpg-to-webp',
    tool?.title || 'JPG to WebP Converter',
    tool?.short_description || 'Convert JPG images to WebP format'
  );
}

export default async function JpgToWebpPage() {
  const tool = await getToolContent('jpg-to-webp');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{tool?.title || 'JPG to WebP Converter'}</h1>
      <p className="text-lg mb-8">{tool?.long_description || 'Convert JPG images to WebP format'}</p>
      <JpgToWebpConverter />
    </div>
  );
} 