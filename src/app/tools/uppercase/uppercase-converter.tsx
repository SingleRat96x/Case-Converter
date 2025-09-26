'use client';

import { useState } from 'react';
import AdScript from '@/components/ads/AdScript';
import { TextInput } from '@/app/components/shared/ToolInputs';
import { ActionButtonGroup } from '@/app/components/shared/ToolActions';
import { TextAnalytics, generateTextStats, type TextStats } from '@/app/components/shared/TextAnalytics';

export function UppercaseConverter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>(generateTextStats(''));

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    setStats(generateTextStats(newText));
  };

  const convertToUpperCase = (text: string) => text.toUpperCase();

  const handleDownload = () => {
    const blob = new Blob([convertToUpperCase(inputText)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uppercase-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(convertToUpperCase(inputText));
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setStats(generateTextStats(''));
  };

  const outputText = convertToUpperCase(inputText);

  return (
    <div className="max-w-[900px] mx-auto space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <TextInput
          title="Input Text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type or paste your text here..."
          minHeight="lg"
          fontFamily="sans"
          variant="default"
        />

        <TextInput
          title="UPPERCASE Result"
          value={outputText}
          readOnly
          minHeight="lg"
          fontFamily="mono"
          variant="glass"
        />
      </div>

      <ActionButtonGroup
        onDownload={handleDownload}
        onCopy={handleCopy}
        onClear={handleClear}
        copyLabel="Copy to Clipboard"
        className="justify-center"
      />

      <div className="max-w-4xl mx-auto">
        <TextAnalytics
          stats={stats}
          mode="grid"
          showStats={['characters', 'words', 'sentences', 'lines']}
        />
      </div>

      <AdScript />
    </div>
  );
}