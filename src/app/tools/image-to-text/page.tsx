import type { Metadata } from "next";
import { ImageToTextConverter } from "./image-to-text-converter";
import { getToolByName } from "@/lib/tools";
import { getToolContent } from '@/lib/tools';
import { generatePageMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('image-to-text');
  return generatePageMetadata(
    'tool',
    'image-to-text',
    tool?.title || 'Image to Text',
    tool?.short_description || 'Extract text from images using OCR'
  );
}

export default async function ImageToTextPage() {
  const tool = await getToolByName("image-to-text");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{tool.title}</h1>
      <p className="text-lg mb-8">{tool.long_description}</p>
      <ImageToTextConverter />
    </div>
  );
} 