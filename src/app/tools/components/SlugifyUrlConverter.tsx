'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
}

export default function SlugifyUrlConverter() {
  const [inputText, setInputText] = useState('');
  const [lowerCase, setLowerCase] = useState(true);
  const [separator, setSeparator] = useState('-');
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
      sentences:
        text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    updateStats(newText);
  };

  const slugify = (text: string): string => {
    if (!text.trim()) return '';

    try {
      // Convert to lower case if requested
      let slug = lowerCase ? text.toLowerCase() : text;

      // Replace accented characters with their non-accented equivalents
      slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      // Replace spaces and special characters with the separator
      slug = slug
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .trim() // Remove leading/trailing spaces
        .replace(/\s+/g, separator) // Replace spaces with separator
        .replace(/-+/g, separator); // Replace multiple separators with a single one

      return slug;
    } catch (error) {
      return 'Error: Failed to generate slug';
    }
  };

  const handleDownload = () => {
    const blob = new Blob([slugify(inputText)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'url-slug.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(slugify(inputText));
  };

  const handleClear = () => {
    setInputText('');
    updateStats('');
  };

  const getSeparatorDisplay = () => {
    switch (separator) {
      case '-':
        return 'Hyphen (-)';
      case '_':
        return 'Underscore (_)';
      case '.':
        return 'Dot (.)';
      default:
        return separator;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Settings */}
      <div className="grid gap-4 md:grid-cols-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Separator
          </label>
          <select
            value={separator}
            onChange={e => setSeparator(e.target.value)}
            className="w-full p-2 rounded border bg-background text-gray-900 dark:text-gray-100"
          >
            <option value="-">Hyphen (-)</option>
            <option value="_">Underscore (_)</option>
            <option value=".">Dot (.)</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="lowercase"
            checked={lowerCase}
            onChange={e => setLowerCase(e.target.checked)}
            className="rounded"
          />
          <label
            htmlFor="lowercase"
            className="text-sm text-gray-900 dark:text-gray-50"
          >
            Convert to lowercase
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
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
            placeholder="Enter text to convert to URL slug..."
            value={inputText}
            onChange={handleInputChange}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            URL Slug Result
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100 font-mono"
            readOnly
            value={slugify(inputText)}
          />
        </div>
      </div>

      {/* Examples */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          Examples
        </h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Input:</span>
              <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border text-xs">
                Hello World! This is a test.
              </div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Output:</span>
              <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border text-xs">
                hello-world-this-is-a-test
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Slug
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Slug
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
        <span>Separator: {getSeparatorDisplay()}</span>
      </div>
    </div>
  );
}
