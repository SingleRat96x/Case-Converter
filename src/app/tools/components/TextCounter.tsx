'use client';

import { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  uniqueWords: number;
  readingTime: number;
}

export default function TextCounter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    lines: 0,
    uniqueWords: 0,
    readingTime: 0,
  });

  const updateStats = (text: string) => {
    const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
    const uniqueWords = new Set(words.map(word => word.toLowerCase()));
    const avgWordsPerMinute = 200;

    setStats({
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words: words.length,
      sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      paragraphs: text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
      uniqueWords: uniqueWords.size,
      readingTime: Math.ceil(words.length / avgWordsPerMinute),
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    updateStats(newText);
  };

  const handleCopy = () => {
    const statsText = `Text Statistics:
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Unique Words: ${stats.uniqueWords}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Lines: ${stats.lines}
Reading Time: ${stats.readingTime} minute${stats.readingTime !== 1 ? 's' : ''}`;

    navigator.clipboard.writeText(statsText);
  };

  const handleClear = () => {
    setInputText('');
    updateStats('');
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-8">
      <div className="space-y-4">
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

        {/* Stats */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Text Statistics</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.characters}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Characters</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.charactersNoSpaces}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Characters (no spaces)</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.words}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Words</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.uniqueWords}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Unique Words</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.sentences}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sentences</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.paragraphs}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Paragraphs</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.lines}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Lines</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">{stats.readingTime}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Reading Time (minutes)</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Statistics
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
    </div>
  );
} 