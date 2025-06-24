'use client';

import React, { useState } from 'react';
import { Download, Copy, RefreshCw } from 'lucide-react';
import {
  TextAnalytics,
  useTextStats,
  type TextStats,
} from '@/app/components/shared/TextAnalytics';

export function CaseChangerTool() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>({});
  const { calculateStats } = useTextStats();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    setStats(calculateStats(newText));
  };

  const transformText = (
    type: 'upper' | 'lower' | 'title' | 'sentence' | 'alternate'
  ) => {
    let result = inputText;
    switch (type) {
      case 'upper':
        result = inputText.toUpperCase();
        break;
      case 'lower':
        result = inputText.toLowerCase();
        break;
      case 'title':
        result = inputText.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        break;
      case 'sentence':
        result = inputText
          .toLowerCase()
          .replace(/(^\w|\.\s+\w)/g, c => c.toUpperCase());
        break;
      case 'alternate':
        result = inputText
          .split('')
          .map((char, i) =>
            i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
          )
          .join('');
        break;
    }
    setInputText(result);
  };

  const handleDownload = () => {
    const blob = new Blob([inputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inputText);
  };

  const handleClear = () => {
    setInputText('');
    setStats({});
  };

  return (
    <div className="w-full space-y-4">
      <textarea
        className="w-full min-h-[200px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
        placeholder="Type or paste your text here..."
        value={inputText}
        onChange={handleInputChange}
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => transformText('upper')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
        >
          UPPERCASE
        </button>
        <button
          onClick={() => transformText('lower')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
        >
          lowercase
        </button>
        <button
          onClick={() => transformText('title')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
        >
          Title Case
        </button>
        <button
          onClick={() => transformText('sentence')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
        >
          Sentence case
        </button>
        <button
          onClick={() => transformText('alternate')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
        >
          aLtErNaTiNg cAsE
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Text
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy to Clipboard
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Clear
        </button>
      </div>

      <TextAnalytics
        stats={stats}
        mode="inline"
        showStats={['characters', 'words', 'sentences', 'lines']}
      />
    </div>
  );
}
