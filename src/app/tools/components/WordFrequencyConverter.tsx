'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';

interface WordFrequency {
  word: string;
  count: number;
  percentage: number;
}

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
}

const commonWords = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me'
]);

export default function WordFrequencyConverter() {
  const [inputText, setInputText] = useState('');
  const [frequencies, setFrequencies] = useState<WordFrequency[]>([]);
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
  });
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [excludeCommon, setExcludeCommon] = useState(true);
  const [sortBy, setSortBy] = useState('frequency');
  const [minLength, setMinLength] = useState(1);
  const [minCount, setMinCount] = useState(1);

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
    analyzeText(newText);
  };

  const analyzeText = (text: string = inputText) => {
    if (!text.trim()) {
      setFrequencies([]);
      return;
    }

    // Split text into words
    const words = text.trim().split(/\s+/);
    const wordMap = new Map<string, number>();
    const totalWords = words.length;

    words.forEach(word => {
      // Remove punctuation and normalize case if needed
      word = word.replace(/[.,!?;:'"()\[\]{}]/g, '');
      if (!caseSensitive) {
        word = word.toLowerCase();
      }

      // Skip if word is too short or is a common word
      if (word.length < minLength) return;
      if (excludeCommon && commonWords.has(word.toLowerCase())) return;

      wordMap.set(word, (wordMap.get(word) || 0) + 1);
    });

    // Convert to array and filter by minimum count
    let freqArray: WordFrequency[] = Array.from(wordMap.entries())
      .filter(([_, count]) => count >= minCount)
      .map(([word, count]) => ({
        word,
        count,
        percentage: (count / totalWords) * 100
      }));

    // Sort the array
    freqArray.sort((a, b) => {
      if (sortBy === 'frequency') {
        return b.count - a.count;
      } else if (sortBy === 'word') {
        return a.word.localeCompare(b.word);
      } else { // percentage
        return b.percentage - a.percentage;
      }
    });

    setFrequencies(freqArray.slice(0, 50)); // Limit to top 50 for performance
  };

  const generateReport = () => {
    const report = `Word Frequency Analysis Report
================================

Total Characters: ${stats.characters}
Total Words: ${stats.words}
Total Sentences: ${stats.sentences}
Total Lines: ${stats.lines}

Settings:
- Case Sensitive: ${caseSensitive ? 'Yes' : 'No'}
- Exclude Common Words: ${excludeCommon ? 'Yes' : 'No'}
- Minimum Word Length: ${minLength}
- Minimum Count: ${minCount}
- Sort By: ${sortBy}

Word Frequencies:
================
${'Word'.padEnd(20)} ${'Count'.padEnd(8)} Percentage
${'----'.padEnd(20)} ${'-----'.padEnd(8)} ----------
${frequencies.map(({ word, count, percentage }) => 
  `${word.padEnd(20)} ${count.toString().padEnd(8)} ${percentage.toFixed(2)}%`
).join('\n')}

Input Text:
-----------
${inputText}`;
    return report;
  };

  const handleDownload = () => {
    const blob = new Blob([generateReport()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'word-frequency-analysis.txt';
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
    setFrequencies([]);
    updateStats('');
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      {/* Settings */}
      <div className="grid gap-4 md:grid-cols-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); analyzeText(); }}
            className="w-full p-2 rounded border bg-background text-gray-900 dark:text-gray-100"
          >
            <option value="frequency">Frequency</option>
            <option value="word">Alphabetically</option>
            <option value="percentage">Percentage</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Min Length</label>
          <input
            type="number"
            min={1}
            value={minLength}
            onChange={(e) => { setMinLength(parseInt(e.target.value) || 1); analyzeText(); }}
            className="w-full p-2 rounded border bg-background text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Min Count</label>
          <input
            type="number"
            min={1}
            value={minCount}
            onChange={(e) => { setMinCount(parseInt(e.target.value) || 1); analyzeText(); }}
            className="w-full p-2 rounded border bg-background text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="case-sensitive"
            checked={caseSensitive}
            onChange={(e) => { setCaseSensitive(e.target.checked); analyzeText(); }}
            className="rounded"
          />
          <label htmlFor="case-sensitive" className="text-sm text-gray-900 dark:text-gray-50">Case sensitive</label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="exclude-common"
            checked={excludeCommon}
            onChange={(e) => { setExcludeCommon(e.target.checked); analyzeText(); }}
            className="rounded"
          />
          <label htmlFor="exclude-common" className="text-sm text-gray-900 dark:text-gray-50">Exclude common words</label>
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

        {/* Analysis Results */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Word Frequency Analysis</label>
          <div className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-y-auto">
            {frequencies.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 font-semibold text-sm border-b pb-2">
                  <div>Word</div>
                  <div className="text-center">Count</div>
                  <div className="text-center">%</div>
                </div>
                {frequencies.map(({ word, count, percentage }) => (
                  <div key={word} className="grid grid-cols-3 text-sm py-1 border-b">
                    <div className="font-mono">{word}</div>
                    <div className="text-center">{count}</div>
                    <div className="text-center">{percentage.toFixed(2)}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Enter text to see word frequency analysis
              </div>
            )}
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
      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4">
        <span>Characters: {stats.characters}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Words: {stats.words}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Unique Words: {frequencies.length}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Lines: {stats.lines}</span>
      </div>
    </div>
  );
} 