'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, AlertTriangle } from 'lucide-react';
// @ts-ignore
import CryptoJS from 'crypto-js';

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
  hashLength: number;
}

export default function Md5HashConverter() {
  const [inputText, setInputText] = useState('');
  const [uppercase, setUppercase] = useState(false);
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
    hashLength: 0,
  });

  const updateStats = (text: string, result: string) => {
    setStats({
      characters: text.length,
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
      hashLength: result.startsWith('Error:') ? 0 : result.length,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    const result = processText(newText);
    updateStats(newText, result);
  };

  const generateMd5Hash = (text: string, uppercase: boolean): string => {
    try {
      const hash = CryptoJS.MD5(text).toString();
      return uppercase ? hash.toUpperCase() : hash.toLowerCase();
    } catch (error) {
      throw new Error('Failed to generate MD5 hash');
    }
  };

  const processText = (text: string): string => {
    if (!text) return '';

    try {
      return generateMd5Hash(text, uppercase);
    } catch (error) {
      return error instanceof Error ? `Error: ${error.message}` : 'Error: Failed to generate hash';
    }
  };

  const handleUppercaseChange = (checked: boolean) => {
    setUppercase(checked);
    const result = processText(inputText);
    updateStats(inputText, result);
  };

  const handleDownload = () => {
    const result = processText(inputText);
    const filename = 'md5-hash.txt';
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
    updateStats('', '');
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      {/* Security Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Security Notice</h3>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
              MD5 is not cryptographically secure and should not be used for passwords or sensitive data. Use for checksums only.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Text to Hash
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100 font-mono"
            placeholder="Enter text to generate MD5 hash..."
            value={inputText}
            onChange={handleInputChange}
          />
          
          {/* Settings */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="uppercase"
              checked={uppercase}
              onChange={(e) => handleUppercaseChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="uppercase" className="text-sm text-gray-600 dark:text-gray-400">
              Uppercase hash
            </label>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            MD5 Hash Result
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100 font-mono"
            readOnly
            value={processText(inputText)}
          />
        </div>
      </div>

      {/* Examples */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">Examples</h3>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Input Text:</span>
              <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border text-xs">hello</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">MD5 Hash:</span>
              <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border text-xs">5d41402abc4b2a76b9719d911017c592</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            MD5 produces a 128-bit (32 character) hash value, commonly used for checksums and data integrity verification.
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
          Download Hash
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Hash
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
        <span>Hash Length: {stats.hashLength}</span>
      </div>
    </div>
  );
} 