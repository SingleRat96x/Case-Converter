import { CategoryPage } from '@/components/pages/CategoryPage';
import { generateToolMetadata } from '@/lib/metadata/metadataGenerator';
import type { Metadata } from 'next';

// Define the tools in this category with proper icons and descriptions
const analysisCounterTools = [
  {
    id: 'text-counter',
    title: 'Text Counter',
    description: 'Comprehensive character, word, and line counter with detailed statistics and formatting analysis',
    icon: '📊',
    href: '/tools/text-counter'
  },
  {
    id: 'word-frequency',
    title: 'Word Frequency Analyzer',
    description: 'Advanced word frequency analysis tool to identify patterns, repetition, and keyword density',
    icon: '📈',
    href: '/tools/word-frequency'
  },
  {
    id: 'sentence-counter',
    title: 'Sentence Counter',
    description: 'Professional sentence counting tool with structure analysis and readability metrics',
    icon: '📝',
    href: '/tools/sentence-counter'
  },
  {
    id: 'extract-numbers',
    title: 'Extract Numbers from Text',
    description: 'Extract all numbers from text with advanced options for decimals, currency, percentages, and statistics',
    icon: '🔢',
    href: '/tools/extract-numbers'
  },
  {
    id: 'reading-time-estimator',
    title: 'Reading Time Estimator',
    description: 'Estimate reading time for text, articles, and JSON data with customizable reading speeds',
    icon: '⏱️',
    href: '/tools/reading-time-estimator'
  }
];

// Generate metadata using the modular system
export async function generateMetadata(): Promise<Metadata> {
  return await generateToolMetadata('analysis-counter-tools', {
    locale: 'en',
    pathname: '/category/analysis-counter-tools'
  });
}

export default function AnalysisCounterToolsCategory() {
  return (
    <CategoryPage
      categorySlug="analysis-counter-tools"
      tools={analysisCounterTools}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'All Tools', href: '/tools' },
        { label: 'Text Analysis & Counter Tools' }
      ]}
    />
  );
}