'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';

export default function PigLatinConverter() {
  const [inputText, setInputText] = useState('');

  const convertToPigLatin = (text: string): string => {
    if (!text.trim()) return '';

    const vowels = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];

    return text
      .split(/\b/)
      .map(word => {
        // Skip non-word characters
        if (!/^[a-zA-Z]+$/.test(word)) {
          return word;
        }

        // Handle words that start with vowels
        if (vowels.includes(word[0])) {
          return word + 'way';
        }

        // Handle words that start with consonants
        let consonantCluster = '';
        let i = 0;

        while (i < word.length && !vowels.includes(word[i])) {
          consonantCluster += word[i];
          i++;
        }

        // Preserve capitalization
        const restOfWord = word.slice(i);
        const isCapitalized = word[0] === word[0].toUpperCase();
        let result = restOfWord + consonantCluster + 'ay';

        if (isCapitalized && restOfWord.length > 0) {
          result =
            result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
        }

        return result;
      })
      .join('');
  };

  const getStats = () => {
    const result = convertToPigLatin(inputText);
    return {
      inputChars: inputText.length,
      outputChars: result.length,
      words: inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length,
      sentences:
        inputText.trim() === ''
          ? 0
          : inputText.split(/[.!?]+/).filter(Boolean).length,
    };
  };

  const handleDownload = () => {
    const result = convertToPigLatin(inputText);
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pig-latin.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(convertToPigLatin(inputText));
  };

  const handleClear = () => {
    setInputText('');
  };

  const stats = getStats();

  return (
    <div className="w-full space-y-4">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            English Text
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
            placeholder="Type or paste your English text here..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Pig Latin Result
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100"
            readOnly
            value={convertToPigLatin(inputText)}
            placeholder="Pig Latin translation will appear here..."
          />
        </div>
      </div>

      {/* Rules */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          Pig Latin Rules
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>
            • Words starting with vowels: Add "way" to the end (apple →
            appleway)
          </div>
          <div>
            • Words starting with consonants: Move consonant cluster to end and
            add "ay" (hello → ellohay)
          </div>
          <div>• Capitalization is preserved</div>
          <div>• Non-alphabetic characters remain unchanged</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={!inputText.trim()}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={!inputText.trim()}
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

      {/* Stats */}
      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4">
        <span>
          Characters: {stats.inputChars} → {stats.outputChars}
        </span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Words: {stats.words}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Sentences: {stats.sentences}</span>
      </div>
    </div>
  );
}
