'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';

interface NumberStats {
  count: number;
  duplicates: number;
  sum: number;
  average: number;
  min: number;
  max: number;
}

export default function NumberSorterConverter() {
  const [inputText, setInputText] = useState('');
  const [isDescending, setIsDescending] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [delimiter, setDelimiter] = useState('\n');
  const [stats, setStats] = useState<NumberStats>({
    count: 0,
    duplicates: 0,
    sum: 0,
    average: 0,
    min: 0,
    max: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    updateStats(newText);
  };

  const updateStats = (text: string) => {
    if (!text.trim()) {
      setStats({
        count: 0,
        duplicates: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
      });
      return;
    }

    try {
      const numbers = text
        .split(new RegExp(`[${delimiter}]+`))
        .map(n => n.trim())
        .filter(Boolean)
        .map(n => {
          const parsed = parseFloat(n);
          if (isNaN(parsed)) {
            throw new Error(`Invalid number: ${n}`);
          }
          return parsed;
        });

      const originalCount = numbers.length;
      const uniqueNumbers = Array.from(new Set(numbers));
      const duplicates = originalCount - uniqueNumbers.length;
      const sum = numbers.reduce((a, b) => a + b, 0);
      const average = sum / numbers.length;
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);

      setStats({
        count: originalCount,
        duplicates,
        sum,
        average,
        min,
        max,
      });
    } catch (error) {
      setStats({
        count: 0,
        duplicates: 0,
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
      });
    }
  };

  const sortNumbers = (text: string): string => {
    if (!text.trim()) return '';

    try {
      let numbers = text
        .split(new RegExp(`[${delimiter}]+`))
        .map(n => n.trim())
        .filter(Boolean)
        .map(n => {
          const parsed = parseFloat(n);
          if (isNaN(parsed)) {
            throw new Error(`Invalid number: ${n}`);
          }
          return parsed;
        });

      // Remove duplicates if enabled
      if (removeDuplicates) {
        numbers = Array.from(new Set(numbers));
      }

      // Sort the numbers
      numbers.sort((a, b) => (isDescending ? b - a : a - b));

      // Join the numbers back together
      return numbers.join(delimiter);
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : 'Failed to sort numbers'}`;
    }
  };

  const handleDownload = () => {
    const blob = new Blob([sortNumbers(inputText)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sorted-numbers.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sortNumbers(inputText));
  };

  const handleClear = () => {
    setInputText('');
    updateStats('');
  };

  const getDelimiterDisplay = () => {
    switch (delimiter) {
      case '\n':
        return 'New line';
      case ',':
        return 'Comma';
      case ' ':
        return 'Space';
      case ';':
        return 'Semicolon';
      default:
        return delimiter;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Settings */}
      <div className="grid gap-4 md:grid-cols-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Delimiter
          </label>
          <select
            value={delimiter}
            onChange={e => setDelimiter(e.target.value)}
            className="w-full p-2 rounded border bg-background text-gray-900 dark:text-gray-100"
          >
            <option value="\n">New line</option>
            <option value=",">Comma</option>
            <option value=" ">Space</option>
            <option value=";">Semicolon</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="descending"
            checked={isDescending}
            onChange={e => setIsDescending(e.target.checked)}
            className="rounded"
          />
          <label
            htmlFor="descending"
            className="text-sm text-gray-900 dark:text-gray-50"
          >
            Sort descending
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="remove-duplicates"
            checked={removeDuplicates}
            onChange={e => setRemoveDuplicates(e.target.checked)}
            className="rounded"
          />
          <label
            htmlFor="remove-duplicates"
            className="text-sm text-gray-900 dark:text-gray-50"
          >
            Remove duplicates
          </label>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Input Numbers
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100 font-mono"
            placeholder="Enter numbers (one per line or separated by commas)..."
            value={inputText}
            onChange={handleInputChange}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Sorted Numbers
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100 font-mono"
            readOnly
            value={sortNumbers(inputText)}
          />
        </div>
      </div>

      {/* Statistics */}
      {stats.count > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
            Number Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Count:</span>
              <div className="font-semibold">{stats.count}</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Duplicates:
              </span>
              <div className="font-semibold">{stats.duplicates}</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Sum:</span>
              <div className="font-semibold">{stats.sum}</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Average:</span>
              <div className="font-semibold">{stats.average.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Min:</span>
              <div className="font-semibold">{stats.min}</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Max:</span>
              <div className="font-semibold">{stats.max}</div>
            </div>
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
          Download Numbers
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
        <span>Numbers: {stats.count}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Duplicates: {stats.duplicates}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Delimiter: {getDelimiterDisplay()}</span>
      </div>
    </div>
  );
}
