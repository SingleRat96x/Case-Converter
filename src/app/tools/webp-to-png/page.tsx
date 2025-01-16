import type { Metadata } from "next";
import { WebpToPngConverter } from "./webp-to-png-converter";
import { getToolContent } from "@/lib/tools";
import { generatePageMetadata } from "@/lib/metadata";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('webp-to-png');
  return generatePageMetadata(
    'tool',
    'webp-to-png',
    tool?.title || 'WebP to PNG Converter',
    tool?.short_description || 'Convert WebP images to PNG format'
  );
}

export default async function WebpToPngPage() {
  const tool = await getToolContent("webp-to-png");

  if (!tool) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{tool.title}</h1>
      <p className="text-lg mb-8">{tool.long_description}</p>
      <WebpToPngConverter />
    </div>
  );
} 