'use client';

import { useState } from 'react';
import AdScript from '@/components/ads/AdScript';
import { TextInput } from '@/app/components/shared/ToolInputs';
import { ActionButtonGroup } from '@/app/components/shared/ToolActions';
import { TextAnalytics, generateTextStats, type TextStats } from '@/app/components/shared/TextAnalytics';

export function TitleCaseConverter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>(generateTextStats(''));

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    setStats(generateTextStats(newText));
  };

  const convertToTitleCase = (text: string) => text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  const handleDownload = () => {
    const blob = new Blob([convertToTitleCase(inputText)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'title-case-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(convertToTitleCase(inputText));
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setStats(generateTextStats(''));
  };

  const outputText = convertToTitleCase(inputText);

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
          title="Title Case Result"
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