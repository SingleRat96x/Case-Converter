import type { Metadata } from "next";
import { AsciiArtGenerator } from "./ascii-art-generator";
import { getToolByName } from "@/lib/tools";

export async function generateMetadata(): Promise<Metadata> {
  const tool = await getToolByName("ascii-art-generator");
  
  return {
    title: tool.title,
    description: tool.long_description,
  };
}

export default async function AsciiArtGeneratorPage() {
  const tool = await getToolByName("ascii-art-generator");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{tool.title}</h1>
      <p className="text-lg mb-8">{tool.long_description}</p>
      <AsciiArtGenerator />
    </div>
  );
} 