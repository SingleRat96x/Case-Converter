'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Calendar } from 'lucide-react';

export default function RandomDateGeneratorConverter() {
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [count, setCount] = useState(10);
  const [generatedDates, setGeneratedDates] = useState<string[]>([]);

  const generateRandomDate = (): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    const randomDate = new Date(randomTime);
    
    return randomDate.toISOString().split('T')[0];
  };

  const handleGenerate = () => {
    const dates = Array.from({ length: count }, () => generateRandomDate());
    setGeneratedDates(dates);
  };

  const getResult = (): string => {
    return generatedDates.join('\n');
  };

  const handleDownload = () => {
    const result = getResult();
    const filename = `random-dates-${count}.txt`;
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
    setGeneratedDates([]);
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-50">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Count</label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Generate Random Dates
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Date Range Info</label>
          <div className="min-h-[300px] p-4 rounded-lg border bg-background">
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>Range: {startDate} to {endDate}</div>
              <div>Count: {count} dates</div>
              <div>Format: YYYY-MM-DD</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Generated Dates ({generatedDates.length})
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y font-mono text-sm"
            readOnly
            value={getResult()}
            placeholder="Generated dates will appear here..."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={generatedDates.length === 0}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={generatedDates.length === 0}
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