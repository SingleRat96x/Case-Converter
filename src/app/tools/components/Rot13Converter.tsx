'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';

export default function Rot13Converter() {
  const [inputText, setInputText] = useState('');

  const rot13 = (text: string): string => {
    try {
      return text.replace(/[a-zA-Z]/g, (char) => {
        const code = char.charCodeAt(0);
        const isUpperCase = code >= 65 && code <= 90;
        const base = isUpperCase ? 65 : 97;
        return String.fromCharCode(((code - base + 13) % 26) + base);
      });
    } catch (error) {
      return 'Error: Failed to process text';
    }
  };

  const processText = (text: string): string => {
    if (!text) return '';
    return rot13(text);
  };

  const handleDownload = () => {
    const result = processText(inputText);
    const filename = 'rot13-converted.txt';
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
    navigator.clipboard.writeText(processText(inputText));
  };

  const handleClear = () => {
    setInputText('');
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">ROT13 Cipher</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            ROT13 is its own inverse - encoding and decoding use the same operation
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Text to Convert
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
            placeholder="Enter text to encode/decode using ROT13..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            ROT13 Result
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100"
            readOnly
            value={processText(inputText)}
          />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">Examples</h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Input Text:</span>
              <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border text-xs">Hello World!</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">ROT13 Output:</span>
              <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border text-xs">Uryyb Jbeyq!</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            ROT13 shifts each letter 13 positions in the alphabet. Apply ROT13 twice to get back the original text.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Result
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Result
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Clear
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4">
        <span>Characters: {inputText.length}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Words: {inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Lines: {inputText.trim() === '' ? 0 : inputText.split('\n').length}</span>
      </div>
    </div>
  );
} 