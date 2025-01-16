import type { Metadata } from "next";
import { JpgToPngConverter } from "./jpg-to-png-converter";
import { getToolContent } from "@/lib/tools";
import { generatePageMetadata } from "@/lib/metadata";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('jpg-to-png');
  return generatePageMetadata(
    'tool',
    'jpg-to-png',
    tool?.title || 'JPG to PNG Converter',
    tool?.short_description || 'Convert JPG images to PNG format'
  );
}

export default async function JpgToPngPage() {
  const tool = await getToolContent('jpg-to-png');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{tool?.title}</h1>
      <p className="text-lg mb-8">{tool?.long_description}</p>
      <JpgToPngConverter />
    </div>
  );
} 