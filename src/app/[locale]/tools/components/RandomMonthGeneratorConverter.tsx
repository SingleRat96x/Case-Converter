'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Calendar } from 'lucide-react';

export default function RandomMonthGeneratorConverter() {
  const [count, setCount] = useState(10);
  const [format, setFormat] = useState('full');
  const [generatedMonths, setGeneratedMonths] = useState<string[]>([]);

  const months = {
    full: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    short: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    number: [
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
    ],
  };

  const generateRandomMonth = (): string => {
    const monthArray = months[format as keyof typeof months];
    return monthArray[Math.floor(Math.random() * monthArray.length)];
  };

  const handleGenerate = () => {
    const monthsList = Array.from({ length: count }, () =>
      generateRandomMonth()
    );
    setGeneratedMonths(monthsList);
  };

  const getResult = (): string => {
    return generatedMonths.join('\n');
  };

  const handleDownload = () => {
    const result = getResult();
    const filename = `random-months-${count}.txt`;
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getResult());
  };

  const handleClear = () => {
    setGeneratedMonths([]);
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Count
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={e =>
                  setCount(
                    Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                  )
                }
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Format
              </label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="full">Full Name (January)</option>
                <option value="short">Short Name (Jan)</option>
                <option value="number">Number (01)</option>
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Generate Random Months
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Month Format Info
          </label>
          <div className="min-h-[300px] p-4 rounded-lg border bg-background">
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>Count: {count} months</div>
              <div>
                Format:{' '}
                {format === 'full'
                  ? 'Full Name'
                  : format === 'short'
                    ? 'Short Name'
                    : 'Number'}
              </div>
              <div>Example: {generateRandomMonth()}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Generated Months ({generatedMonths.length})
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y font-mono text-sm"
            readOnly
            value={getResult()}
            placeholder="Generated months will appear here..."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={generatedMonths.length === 0}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={generatedMonths.length === 0}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Copy className="h-4 w-4" />
          Copy
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Clear
        </button>
      </div>
    </div>
  );
}
