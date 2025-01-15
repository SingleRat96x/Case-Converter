import type { Metadata } from "next";
import { PngToWebpConverter } from "./png-to-webp-converter";
import { getToolByName } from "@/lib/tools";

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolByName("png-to-webp");
  
  return {
    title: tool.title,
    description: tool.long_description,
  };
}

export default async function PngToWebpPage() {
  const tool = await getToolByName("png-to-webp");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{tool.title}</h1>
      <p className="text-lg mb-8">{tool.long_description}</p>
      <PngToWebpConverter />
    </div>
  );
} 