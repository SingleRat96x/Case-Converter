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

export function CaseChangerTool() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
    paragraphs: 0,
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
      paragraphs: text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(para => para.trim() !== '').length || 1,
    });
  };

  const transformText = (type: 'upper' | 'lower' | 'title' | 'sentence' | 'alternate') => {
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
        result = inputText.toLowerCase().replace(/(^\w|\.\s+\w)/g, c => c.toUpperCase());
        break;
      case 'alternate':
        result = inputText.split('').map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join('');
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inputText);
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
      <textarea
        className="w-full min-h-[200px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
        placeholder="Type or paste your text here..."
        value={inputText}
        onChange={handleInputChange}
      />

      {/* Case Conversion Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <button
          onClick={() => transformText('upper')}
          className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
        >
          UPPERCASE
        </button>
        <button
          onClick={() => transformText('lower')}
          className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
        >
          lowercase
        </button>
        <button
          onClick={() => transformText('sentence')}
          className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
        >
          Sentence case
        </button>
        <button
          onClick={() => transformText('title')}
          className="px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
        >
          Title Case
        </button>
        <button
          onClick={() => transformText('alternate')}
          className="px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 col-span-2 sm:col-span-3 md:col-span-1"
        >
          aLtErNaTiNg cAsE
        </button>
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