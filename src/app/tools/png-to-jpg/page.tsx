import type { Metadata } from "next";
import { PngToJpgConverter } from "./png-to-jpg-converter";
import { getToolContent } from '@/lib/tools';
import { generatePageMetadata } from '@/lib/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolContent('png-to-jpg');
  return generatePageMetadata(
    'tool',
    'png-to-jpg',
    tool?.title || 'PNG to JPG Converter',
    tool?.short_description || 'Convert PNG images to JPG format'
  );
}

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