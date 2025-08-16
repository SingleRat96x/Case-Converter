'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Type, Settings } from 'lucide-react';

export default function RandomLetterGeneratorConverter() {
  const [count, setCount] = useState(10);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [generatedLetters, setGeneratedLetters] = useState<string>('');

  const generateRandomLetter = (): string => {
    let letters = '';
    if (includeUppercase) letters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) letters += 'abcdefghijklmnopqrstuvwxyz';

    if (letters === '') return 'A';

    return letters[Math.floor(Math.random() * letters.length)];
  };

  const handleGenerate = () => {
    if (!includeUppercase && !includeLowercase) {
      setGeneratedLetters('Error: Please select at least one letter type');
      return;
    }

    const letters = Array.from({ length: count }, () => generateRandomLetter());
    setGeneratedLetters(letters.join(''));
  };

  const handleDownload = () => {
    const filename = `random-letters-${count}.txt`;
    const blob = new Blob([generatedLetters], { type: 'text/plain' });
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
    navigator.clipboard.writeText(generatedLetters);
  };

  const handleClear = () => {
    setGeneratedLetters('');
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Random Letter Generator
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Number of Letters
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={e =>
                  setCount(
                    Math.min(1000, Math.max(1, parseInt(e.target.value) || 1))
                  )
                }
                className="w-full px-3 py-2 border rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Letter Types
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={e => setIncludeUppercase(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Uppercase (A-Z)
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={e => setIncludeLowercase(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Lowercase (a-z)
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <Type className="h-4 w-4" />
              Generate Random Letters
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Generator Info
          </label>
          <div className="min-h-[300px] p-4 rounded-lg border bg-background text-gray-900 dark:text-gray-100">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Settings</h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Count: {count} letters</div>
                  <div>
                    Types:{' '}
                    {[
                      includeUppercase && 'Uppercase',
                      includeLowercase && 'Lowercase',
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Use Cases</h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>• Random initials</div>
                  <div>• Test data</div>
                  <div>• Games</div>
                  <div>• Learning</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Generated Letters ({generatedLetters.length})
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100 font-mono text-sm"
            readOnly
            value={generatedLetters}
            placeholder="Generated letters will appear here..."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={!generatedLetters}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={!generatedLetters}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Copy className="h-4 w-4" />
          Copy
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Clear
        </button>
      </div>
    </div>
  );
}
