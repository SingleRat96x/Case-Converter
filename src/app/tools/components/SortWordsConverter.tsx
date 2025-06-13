'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
}

export default function SortWordsConverter() {
  const [inputText, setInputText] = useState('');
  const [sortMode, setSortMode] = useState('words');
  const [sortOrder, setSortOrder] = useState('asc');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
  });

  const updateStats = (text: string) => {
    setStats({
      characters: text.length,
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    updateStats(newText);
  };

  const sortText = (text: string): string => {
    if (!text.trim()) return '';

    let items: string[];
    if (sortMode === 'words') {
      items = text.trim().split(/\s+/);
    } else {
      items = text.trim().split('\n');
    }

    // Remove empty items
    items = items.filter(item => item.trim().length > 0);

    // Remove duplicates if enabled
    if (removeDuplicates) {
      items = Array.from(new Set(items));
    }

    // Sort items
    items.sort((a, b) => {
      let compareA = a;
      let compareB = b;
      
      if (!caseSensitive) {
        compareA = a.toLowerCase();
        compareB = b.toLowerCase();
      }
      
      return sortOrder === 'asc' ? compareA.localeCompare(compareB) : compareB.localeCompare(compareA);
    });

    // Join items back together
    const separator = sortMode === 'words' ? ' ' : '\n';
    return items.join(separator);
  };

  const handleDownload = () => {
    const blob = new Blob([sortText(inputText)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sorted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sortText(inputText));
  };

  const handleClear = () => {
    setInputText('');
    updateStats('');
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      {/* Settings */}
      <div className="grid gap-4 md:grid-cols-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Sort by</label>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
            className="w-full p-2 rounded border bg-background text-gray-900 dark:text-gray-100"
          >
            <option value="words">Words</option>
            <option value="lines">Lines</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Sort order</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full p-2 rounded border bg-background text-gray-900 dark:text-gray-100"
          >
            <option value="asc">Ascending (A to Z)</option>
            <option value="desc">Descending (Z to A)</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="case-sensitive"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="case-sensitive" className="text-sm text-gray-900 dark:text-gray-50">Case sensitive</label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="remove-duplicates"
            checked={removeDuplicates}
            onChange={(e) => setRemoveDuplicates(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="remove-duplicates" className="text-sm text-gray-900 dark:text-gray-50">Remove duplicates</label>
        </div>
      </div>

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
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Sorted Text Result</label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100"
            readOnly
            value={sortText(inputText)}
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
      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4">
        <span>Characters: {stats.characters}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Words: {stats.words}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Sentences: {stats.sentences}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Lines: {stats.lines}</span>
      </div>
    </div>
  );
} 