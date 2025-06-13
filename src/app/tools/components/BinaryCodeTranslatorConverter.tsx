'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, ArrowUpDown } from 'lucide-react';

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
  binaryBytes: number;
}

export default function BinaryCodeTranslatorConverter() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
    binaryBytes: 0,
  });

  const updateStats = (text: string, result: string) => {
    const byteCount = mode === 'encode' 
      ? text.length 
      : (result.length > 0 ? result.length : 0);

    setStats({
      characters: text.length,
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
      binaryBytes: byteCount,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    const result = processText(newText);
    updateStats(newText, result);
  };

  const textToBinary = (text: string): string => {
    return text
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(' ');
  };

  const binaryToText = (binary: string): string => {
    // Remove any spaces and validate binary string
    const cleanBinary = binary.replace(/\s/g, '');
    if (!/^[01]+$/.test(cleanBinary) || cleanBinary.length % 8 !== 0) {
      throw new Error('Invalid binary format');
    }

    // Convert binary to text
    const bytes = cleanBinary.match(/.{8}/g) || [];
    return bytes
      .map(byte => String.fromCharCode(parseInt(byte, 2)))
      .join('');
  };

  const processText = (text: string): string => {
    if (!text) return '';

    try {
      if (mode === 'encode') {
        return textToBinary(text);
      } else {
        return binaryToText(text);
      }
    } catch (error) {
      return mode === 'encode'
        ? 'Error: Invalid input for binary conversion'
        : 'Error: Invalid binary format. Please enter 8-bit binary numbers separated by spaces.';
    }
  };

  const handleModeSwitch = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    const result = processText(inputText);
    updateStats(inputText, result);
  };

  const handleDownload = () => {
    const result = processText(inputText);
    const filename = mode === 'encode' ? 'binary-encoded.txt' : 'binary-decoded.txt';
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
      {/* Mode Toggle */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">Mode</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {mode === 'encode' ? 'Convert text to binary code' : 'Convert binary code to text'}
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {mode === 'encode' ? 'Text to Convert' : 'Binary to Convert'}
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100 font-mono"
            placeholder={
              mode === 'encode'
                ? 'Enter text to convert to binary...'
                : 'Enter binary code (8 bits per character, space separated)...'
            }
            value={inputText}
            onChange={handleInputChange}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {mode === 'encode' ? 'Binary Code Result' : 'Decoded Text Result'}
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
              <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border text-xs">Hi</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Binary Output:</span>
              <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border text-xs">01001000 01101001</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Each character is converted to 8-bit binary representation (1 byte per character).
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

      {/* Stats */}
      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4">
        <span>Characters: {stats.characters}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Words: {stats.words}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Lines: {stats.lines}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Bytes: {stats.binaryBytes}</span>
      </div>
    </div>
  );
} 