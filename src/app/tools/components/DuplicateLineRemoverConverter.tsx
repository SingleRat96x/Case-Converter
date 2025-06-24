'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';
import {
  TextAnalytics,
  useTextStats,
  type TextStats,
} from '@/app/components/shared/TextAnalytics';

export default function DuplicateLineRemoverConverter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>({});
  const { calculateStats } = useTextStats();

  const updateStats = (text: string, removedDuplicates: string) => {
    const inputLines = text.trim() === '' ? [] : text.split('\n');
    const outputLines =
      removedDuplicates.trim() === '' ? [] : removedDuplicates.split('\n');

    const baseStats = calculateStats(text);
    setStats({
      ...baseStats,
      duplicateLines: inputLines.length - outputLines.length,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const result = removeDuplicateLines(newText);
    setInputText(newText);
    updateStats(newText, result);
  };

  const removeDuplicateLines = (text: string): string => {
    if (!text.trim()) return '';
    const lines = text.split('\n');
    const uniqueLines = Array.from(new Set(lines));
    return uniqueLines.join('\n');
  };

  const handleDownload = () => {
    const blob = new Blob([removeDuplicateLines(inputText)], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-without-duplicates.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(removeDuplicateLines(inputText));
  };

  const handleClear = () => {
    setInputText('');
    updateStats('', '');
  };

  return (
    <div className="w-full space-y-4">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Input Text
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
            placeholder="Type or paste your text here..."
            value={inputText}
            onChange={handleInputChange}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Text Without Duplicates
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100"
            readOnly
            value={removeDuplicateLines(inputText)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Text
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy to Clipboard
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Clear
        </button>
      </div>

      {/* Stats */}
      <TextAnalytics
        stats={stats}
        mode="inline"
        showStats={['characters', 'words', 'lines', 'duplicateLines']}
      />
    </div>
  );
}
