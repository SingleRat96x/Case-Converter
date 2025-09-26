'use client';

import { useState } from 'react';
import AdScript from '@/components/ads/AdScript';
import { TextInput } from '@/app/components/shared/ToolInputs';
import { ActionButtonGroup } from '@/app/components/shared/ToolActions';
import { TextAnalytics, generateTextStats, type TextStats } from '@/app/components/shared/TextAnalytics';

export function RemoveTextFormattingConverter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>(generateTextStats(''));

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    setStats(generateTextStats(newText));
  };

  const removeTextFormatting = (text: string) => {
    let plainText = text.replace(/<[^>]*>/g, '');
    plainText = plainText.replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&lsquo;/g, "'")
      .replace(/&rsquo;/g, "'")
      .replace(/&mdash;/g, '-')
      .replace(/&ndash;/g, '-')
      .replace(/&hellip;/g, '...');
    plainText = plainText.replace(/&[^;]+;/g, '');
    plainText = plainText
      .replace(/["\u201C\u201D]/g, '"')
      .replace(/[\'\u2018\u2019]/g, "'")
      .replace(/[‒–—―]/g, '-');
    plainText = plainText.replace(/[\u200B-\u200D\uFEFF]/g, '');
    plainText = plainText.replace(/\s+/g, ' ').trim();
    return plainText;
  };

  const handleDownload = () => {
    const blob = new Blob([removeTextFormatting(inputText)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unformatted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(removeTextFormatting(inputText));
  };

  const handleClear = () => {
    setInputText('');
    setStats(generateTextStats(''));
  };

  const outputText = removeTextFormatting(inputText);

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
          title="Unformatted Text Result"
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