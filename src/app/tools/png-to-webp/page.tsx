import type { Metadata } from "next";
import { PngToWebpConverter } from "./png-to-webp-converter";
import { getToolContent } from "@/lib/tools";
import { generatePageMetadata } from "@/lib/metadata";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('png-to-webp');
  return generatePageMetadata(
    'tool',
    'png-to-webp',
    tool?.title || 'PNG to WebP Converter',
    tool?.short_description || 'Convert PNG images to WebP format'
  );
}

export default async function PngToWebpPage() {
  const tool = await getToolContent("png-to-webp");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{tool.title}</h1>
      <p className="text-lg mb-8">{tool.long_description}</p>
      <PngToWebpConverter />
    </div>
  );
} 