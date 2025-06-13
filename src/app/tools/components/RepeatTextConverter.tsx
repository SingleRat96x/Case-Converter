'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
}

export default function RepeatTextConverter() {
  const [inputText, setInputText] = useState('');
  const [count, setCount] = useState(2);
  const [separator, setSeparator] = useState('newline');
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

  const repeatText = (text: string) => {
    if (!text || count < 1) return '';

    let sep = '';
    switch (separator) {
      case 'newline':
        sep = '\n';
        break;
      case 'space':
        sep = ' ';
        break;
      case 'comma':
        sep = ', ';
        break;
      case 'semicolon':
        sep = '; ';
        break;
      default:
        sep = '\n';
    }

    return Array(count).fill(text).join(sep);
  };

  const handleDownload = () => {
    const blob = new Blob([repeatText(inputText)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repeated-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(repeatText(inputText));
  };

  const handleClear = () => {
    setInputText('');
    setCount(2);
    setSeparator('newline');
    updateStats('');
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      {/* Controls */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Number of repetitions</label>
          <input
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Separator</label>
          <select
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
          >
            <option value="newline">New Line</option>
            <option value="space">Space</option>
            <option value="comma">Comma</option>
            <option value="semicolon">Semicolon</option>
          </select>
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
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Repeated Text Result</label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100"
            readOnly
            value={repeatText(inputText)}
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
        <span>Character Count: {stats.characters}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Word Count: {stats.words}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Sentence Count: {stats.sentences}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Line Count: {stats.lines}</span>
      </div>
    </div>
  );
} 