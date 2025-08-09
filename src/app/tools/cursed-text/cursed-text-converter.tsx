'use client';

import { useState } from 'react';
import { CaseConverterButtons } from '@/lib/shared/CaseConverterButtons';
import type { TextStats } from '@/app/components/shared/TextAnalytics';
import AdScript from '@/components/ads/AdScript';

const cursedTextMap: { [key: string]: string } = {
  'a': 'ą', 'b': 'ҍ', 'c': 'ç', 'd': 'ժ', 'e': 'ҽ', 'f': 'ƒ', 'g': 'ց', 'h': 'հ', 'i': 'ì',
  'j': 'ʝ', 'k': 'ҟ', 'l': 'Ӏ', 'm': 'ʍ', 'n': 'ղ', 'o': 'օ', 'p': 'ք', 'q': 'զ', 'r': 'ɾ',
  's': 'ʂ', 't': 'է', 'u': 'մ', 'v': 'ѵ', 'w': 'ա', 'x': '×', 'y': 'վ', 'z': 'Հ',
  'A': 'Ⱥ', 'B': 'β', 'C': 'Ç', 'D': 'Ꭰ', 'E': 'Ɛ', 'F': 'Ƒ', 'G': 'Ɠ', 'H': 'Ħ', 'I': 'Ī',
  'J': 'Ĵ', 'K': 'Ҡ', 'L': 'Ł', 'M': 'Μ', 'N': 'Ν', 'O': 'Ø', 'P': 'Ρ', 'Q': 'Ԛ', 'R': 'Ɍ',
  'S': 'Ϛ', 'T': 'Ͳ', 'U': 'Ʊ', 'V': 'Ѵ', 'W': 'Ш', 'X': 'Χ', 'Y': 'Ƴ', 'Z': 'Ż',
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
};

export function CursedTextConverter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    updateStats(newText);
  };

  const updateStats = (text: string) => {
    setStats({
      characters: text.length,
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
    });
  };

  const convertToCursedText = (text: string) => {
    return text.split('').map(char => cursedTextMap[char] || char).join('');
  };

  const handleDownload = () => {
    const blob = new Blob([convertToCursedText(inputText)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cursed-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(convertToCursedText(inputText));
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    updateStats('');
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
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
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Cursed Text Result</label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100"
            readOnly
            value={convertToCursedText(inputText)}
          />
        </div>
      </div>

      <AdScript />

      <CaseConverterButtons
        onDownload={handleDownload}
        onCopy={handleCopy}
        onClear={handleClear}
        stats={stats}
      />
    </div>
  );
} 