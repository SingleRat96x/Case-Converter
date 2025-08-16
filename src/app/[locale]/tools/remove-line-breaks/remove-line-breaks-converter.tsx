'use client';

import { useState } from 'react';
import { CaseConverterButtons } from '@/components/shared/CaseConverterButtons';
import AdScript from '@/components/ads/AdScript';

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
  paragraphs: number;
}

export function RemoveLineBreaksConverter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
    paragraphs: 0,
  });

  const updateStats = (text: string) => {
    setStats({
      characters: text.length,
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
      paragraphs: text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(para => para.trim() !== '').length || 1,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    updateStats(newText);
  };

  const removeLineBreaks = (text: string) => {
    // Replace multiple consecutive line breaks with a single space
    let result = text.replace(/\n+/g, ' ');
    
    // Replace multiple consecutive spaces with a single space
    result = result.replace(/\s+/g, ' ');
    
    // Trim leading and trailing whitespace
    result = result.trim();
    
    return result;
  };

  const handleDownload = () => {
    const blob = new Blob([removeLineBreaks(inputText)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-without-line-breaks.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(removeLineBreaks(inputText));
  };

  const handleClear = () => {
    setInputText('');
    updateStats('');
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Input Text</label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
            placeholder="Type or paste your text here..."
            value={inputText}
            onChange={handleInputChange}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Text Without Line Breaks</label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100"
            readOnly
            value={removeLineBreaks(inputText)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <CaseConverterButtons
        onDownload={handleDownload}
        onCopy={handleCopy}
        onClear={handleClear}
        stats={stats}
      />

      <AdScript />
    </div>
  );
} 