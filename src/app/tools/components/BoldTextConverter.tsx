'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
}

const boldTextMap: { [key: string]: string } = {
  a: '𝐚',
  b: '𝐛',
  c: '𝐜',
  d: '𝐝',
  e: '𝐞',
  f: '𝐟',
  g: '𝐠',
  h: '𝐡',
  i: '𝐢',
  j: '𝐣',
  k: '𝐤',
  l: '𝐥',
  m: '𝐦',
  n: '𝐧',
  o: '𝐨',
  p: '𝐩',
  q: '𝐪',
  r: '𝐫',
  s: '𝐬',
  t: '𝐭',
  u: '𝐮',
  v: '𝐯',
  w: '𝐰',
  x: '𝐱',
  y: '𝐲',
  z: '𝐳',
  A: '𝐀',
  B: '𝐁',
  C: '𝐂',
  D: '𝐃',
  E: '𝐄',
  F: '𝐅',
  G: '𝐆',
  H: '𝐇',
  I: '𝐈',
  J: '𝐉',
  K: '𝐊',
  L: '𝐋',
  M: '𝐌',
  N: '𝐍',
  O: '𝐎',
  P: '𝐏',
  Q: '𝐐',
  R: '𝐑',
  S: '𝐒',
  T: '𝐓',
  U: '𝐔',
  V: '𝐕',
  W: '𝐖',
  X: '𝐗',
  Y: '𝐘',
  Z: '𝐙',
  '0': '𝟎',
  '1': '𝟏',
  '2': '𝟐',
  '3': '𝟑',
  '4': '𝟒',
  '5': '𝟓',
  '6': '𝟔',
  '7': '𝟕',
  '8': '𝟖',
  '9': '𝟗',
};

export default function BoldTextConverter() {
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

  const convertToBoldText = (text: string) => {
    return text
      .split('')
      .map(char => boldTextMap[char] || char)
      .join('');
  };

  const handleDownload = () => {
    const blob = new Blob([convertToBoldText(inputText)], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bold-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(convertToBoldText(inputText));
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
            Bold Text Result
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100"
            readOnly
            value={convertToBoldText(inputText)}
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
