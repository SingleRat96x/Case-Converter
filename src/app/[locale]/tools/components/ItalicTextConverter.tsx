'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
}

const italicTextMap: { [key: string]: string } = {
  a: '𝘢',
  b: '𝘣',
  c: '𝘤',
  d: '𝘥',
  e: '𝘦',
  f: '𝘧',
  g: '𝘨',
  h: '𝘩',
  i: '𝘪',
  j: '𝘫',
  k: '𝘬',
  l: '𝘭',
  m: '𝘮',
  n: '𝘯',
  o: '𝘰',
  p: '𝘱',
  q: '𝘲',
  r: '𝘳',
  s: '𝘴',
  t: '𝘵',
  u: '𝘶',
  v: '𝘷',
  w: '𝘸',
  x: '𝘹',
  y: '𝘺',
  z: '𝘻',
  A: '𝘈',
  B: '𝘉',
  C: '𝘊',
  D: '𝘋',
  E: '𝘌',
  F: '𝘍',
  G: '𝘎',
  H: '𝘏',
  I: '𝘐',
  J: '𝘑',
  K: '𝘒',
  L: '𝘓',
  M: '𝘔',
  N: '𝘕',
  O: '𝘖',
  P: '𝘗',
  Q: '𝘘',
  R: '𝘙',
  S: '𝘚',
  T: '𝘛',
  U: '𝘜',
  V: '𝘝',
  W: '𝘞',
  X: '𝘟',
  Y: '𝘠',
  Z: '𝘡',
};

export default function ItalicTextConverter() {
  const [inputText, setInputText] = useState('');
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

  const convertToItalicText = (text: string) => {
    return text
      .split('')
      .map(char => italicTextMap[char] || char)
      .join('');
  };

  const handleDownload = () => {
    const blob = new Blob([convertToItalicText(inputText)], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'italic-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(convertToItalicText(inputText));
  };

  const handleClear = () => {
    setInputText('');
    updateStats('');
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
            Italic Text Result
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100"
            readOnly
            value={convertToItalicText(inputText)}
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
