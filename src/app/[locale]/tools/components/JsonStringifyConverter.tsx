'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
  escapedCharacters: number;
}

export default function JsonStringifyConverter() {
  const [inputText, setInputText] = useState('');
  const [includeQuotes, setIncludeQuotes] = useState(true);
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
    escapedCharacters: 0,
  });

  const updateStats = (text: string) => {
    const stringified = stringifyText(text);
    const escapedCount = (stringified.match(/\\./g) || []).length;

    setStats({
      characters: text.length,
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      sentences:
        text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
      escapedCharacters: escapedCount,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    updateStats(newText);
  };

  const stringifyText = (text: string): string => {
    if (!text) return '';

    try {
      // First, escape the text using JSON.stringify
      const escaped = JSON.stringify(text);

      // If quotes are not needed, remove the surrounding quotes
      return includeQuotes ? escaped : escaped.slice(1, -1);
    } catch (error) {
      return 'Error: Failed to stringify text';
    }
  };

  const handleDownload = () => {
    const blob = new Blob([stringifyText(inputText)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stringified-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(stringifyText(inputText));
  };

  const handleClear = () => {
    setInputText('');
    updateStats('');
  };

  return (
    <div className="w-full space-y-4">
      {/* Settings */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="include-quotes"
            checked={includeQuotes}
            onChange={e => setIncludeQuotes(e.target.checked)}
            className="rounded"
          />
          <label
            htmlFor="include-quotes"
            className="text-sm text-gray-900 dark:text-gray-50"
          >
            Include surrounding quotes
          </label>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Input Text
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100 font-mono"
            placeholder="Enter text to convert to JSON string format..."
            value={inputText}
            onChange={handleInputChange}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            JSON Stringified Result
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100 font-mono"
            readOnly
            value={stringifyText(inputText)}
          />
        </div>
      </div>

      {/* Examples */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          Character Escaping Examples
        </h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Input:</span>
              <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border text-xs">
                Hello "World" Tab here Backslash \ test
              </div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Output:</span>
              <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border text-xs">
                "Hello \"World\"\nTab\there\nBackslash \\ test"
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Common escapes: \" (quote), \\ (backslash), \n (newline), \t (tab),
            \r (carriage return)
          </div>
        </div>
      </div>

      {/* Escape Character Count */}
      {stats.escapedCharacters > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
            Escape Information
          </h3>
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Escaped characters found:
            </span>
            <span className="font-semibold ml-2">
              {stats.escapedCharacters}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Result
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Result
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
        <span>Lines: {stats.lines}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Escaped Characters: {stats.escapedCharacters}</span>
      </div>
    </div>
  );
}
