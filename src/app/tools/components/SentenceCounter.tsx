'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';
import { TextAnalytics, useTextStats, type TextStats } from '@/app/components/shared/TextAnalytics';

export default function SentenceCounter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
    averageWordsPerSentence: 0,
  });

  const updateStats = (text: string) => {
    const sentences = text
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0);

    const words = text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);

    const lines = text.trim() === '' ? 0 : text.split('\n').length;

    setStats({
      characters: text.length,
      words: words.length,
      sentences: sentences.length,
      lines,
      averageWordsPerSentence: words.length / Math.max(sentences.length, 1),
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    updateStats(newText);
  };

  const generateReport = () => {
    return `Text Analysis Report
===================

Total Characters: ${stats.characters}
Total Words: ${stats.words}
Total Sentences: ${stats.sentences}
Total Lines: ${stats.lines}
Average Words per Sentence: ${stats.averageWordsPerSentence?.toFixed(1) || '0.0'}

Input Text:
-----------
${inputText}`;
  };

  const handleDownload = () => {
    const blob = new Blob([generateReport()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sentence-analysis.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReport());
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

        {/* Analysis Results */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Analysis Results
          </label>
          <div className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sentences
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.sentences}
                  </p>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Words
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.words}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Characters
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.characters}
                  </p>
                </div>
                <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Lines
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.lines}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average Words per Sentence
              </p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {stats.averageWordsPerSentence?.toFixed(1) || '0.0'}
              </p>
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
          Download Report
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Report
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
      <TextAnalytics 
        stats={stats} 
        mode="inline"
        showStats={['characters', 'words', 'sentences', 'lines', 'averageWordsPerSentence']}
      />
    </div>
  );
}
