'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, ArrowUpDown, Settings } from 'lucide-react';

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
  processedChars: number;
}

export default function CaesarCipherConverter() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [shift, setShift] = useState(3);
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
    processedChars: 0,
  });

  const updateStats = (text: string, result: string) => {
    const processedCount = result.length - result.replace(/[a-zA-Z]/g, '').length;
    
    setStats({
      characters: text.length,
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
      processedChars: processedCount,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    const result = processText(newText);
    updateStats(newText, result);
  };

  const caesarCipher = (text: string, shift: number, decode: boolean): string => {
    shift = decode ? (26 - (shift % 26)) : (shift % 26);

    return text
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        return char;
      })
      .join('');
  };

  const processText = (text: string): string => {
    if (!text) return '';
    return caesarCipher(text, shift, mode === 'decode');
  };

  const handleModeSwitch = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  const handleDownload = () => {
    const result = processText(inputText);
    const filename = mode === 'encode' ? 'caesar-encoded.txt' : 'caesar-decoded.txt';
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
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">Mode</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {mode === 'encode' ? 'Encode text with Caesar cipher' : 'Decode Caesar cipher text'}
            </p>
          </div>
          <button
            onClick={handleModeSwitch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            {mode === 'encode' ? 'Switch to Decode' : 'Switch to Encode'}
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Shift Amount:
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="25"
              value={shift}
              onChange={(e) => setShift(Math.max(0, Math.min(25, parseInt(e.target.value) || 0)))}
              className="w-16 px-2 py-1 border rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">(0-25)</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {mode === 'encode' ? 'Text to Encode' : 'Text to Decode'}
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter text to decode...'}
            value={inputText}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {mode === 'encode' ? 'Caesar Cipher Result' : 'Decoded Text Result'}
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
              <span className="text-gray-600 dark:text-gray-400">Input Text (shift 3):</span>
              <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border text-xs">Hello World!</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Caesar Output:</span>
              <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border text-xs">Khoor Zruog!</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Caesar cipher shifts each letter by a fixed number of positions in the alphabet. Only letters are affected.
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
        <span>Characters: {stats.characters}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Words: {stats.words}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Lines: {stats.lines}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Letters Processed: {stats.processedChars}</span>
      </div>
    </div>
  );
} 