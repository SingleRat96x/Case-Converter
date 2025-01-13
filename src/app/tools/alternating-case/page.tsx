import type { Metadata } from 'next';
import { AlternatingCaseConverter } from './alternating-case-converter';

export const metadata: Metadata = {
  title: 'aLtErNaTiNg cAsE Converter - Free Online Text Case Converter',
  description: 'Convert your text to alternating case online. This free tool alternates between uppercase and lowercase letters. Perfect for creating fun, stylized text.',
};

export default function AlternatingCasePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="max-w-[900px] mx-auto space-y-4">
        <h1 className="text-3xl font-bold">aLtErNaTiNg cAsE Converter</h1>
        <p className="text-muted-foreground">
          Convert your text to alternating case online. This free tool alternates between uppercase and lowercase letters. Perfect for creating fun, stylized text.
        </p>
      </div>

      <AlternatingCaseConverter />

      <div className="max-w-[900px] mx-auto space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">How Does the aLtErNaTiNg cAsE Generator Work?</h2>
          <p className="text-muted-foreground">
            Type out or copy and paste your content into the left panel. As you do this, you should see that the right panel automatically converts your text into alternating case format. You can then copy and paste that alternating case content wherever you need to.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Features of Our aLtErNaTiNg cAsE Converter</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Alternates between uppercase and lowercase letters</li>
            <li>Maintains spacing and punctuation</li>
            <li>Real-time conversion as you type</li>
            <li>Preserves original formatting and line breaks</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 