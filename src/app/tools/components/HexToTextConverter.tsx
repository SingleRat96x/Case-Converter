'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, ArrowUpDown } from 'lucide-react';

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  lines: number;
  hexBytes: number;
}

export default function HexToTextConverter() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [stats, setStats] = useState<TextStats>({
    characters: 0,
    words: 0,
    sentences: 0,
    lines: 0,
    hexBytes: 0,
  });

  const updateStats = (text: string, result: string) => {
    const hexByteCount = mode === 'encode' 
      ? text.length 
      : (result.startsWith('Error:') ? 0 : result.length);

    setStats({
      characters: text.length,
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
      lines: text.trim() === '' ? 0 : text.split('\n').length,
      hexBytes: hexByteCount,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    const result = processText(newText);
    updateStats(newText, result);
  };

  const textToHex = (text: string): string => {
    try {
      return Array.from(text)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ');
    } catch (error) {
      throw new Error('Failed to convert text to hex');
    }
  };

  const hexToText = (hex: string): string => {
    try {
      // Remove spaces and validate hex string
      const cleanHex = hex.replace(/\s/g, '');
      if (!/^[0-9A-Fa-f]+$/.test(cleanHex) || cleanHex.length % 2 !== 0) {
        throw new Error('Invalid hex format');
      }

      // Convert hex to text
      const bytes = cleanHex.match(/.{2}/g) || [];
      return bytes
        .map(byte => String.fromCharCode(parseInt(byte, 16)))
        .join('');
    } catch (error) {
      throw new Error('Invalid hex format. Please enter valid hexadecimal values.');
    }
  };

  const processText = (text: string): string => {
    if (!text) return '';

    try {
      if (mode === 'encode') {
        return textToHex(text);
      } else {
        return hexToText(text);
      }
    } catch (error) {
      return error instanceof Error ? `Error: ${error.message}` : 'Error: Failed to convert';
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
    const filename = mode === 'encode' ? 'hex-encoded.txt' : 'hex-decoded.txt';
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
              {mode === 'encode' ? 'Convert text to hexadecimal' : 'Convert hexadecimal to text'}
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
            {mode === 'encode' ? 'Text to Convert' : 'Hex to Convert'}
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100 font-mono"
            placeholder={
              mode === 'encode'
                ? 'Enter text to convert to hex...'
                : 'Enter hex values (e.g., 48 65 6c 6c 6f)...'
            }
            value={inputText}
            onChange={handleInputChange}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {mode === 'encode' ? 'Hexadecimal Result' : 'Decoded Text Result'}
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
              <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border text-xs">Hello</div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Hex Output:</span>
              <div className="font-mono bg-white dark:bg-gray-800 p-2 rounded border text-xs">48 65 6c 6c 6f</div>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Each character is converted to its hexadecimal ASCII value. Supports both uppercase and lowercase hex.
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
        <span>Hex Bytes: {stats.hexBytes}</span>
      </div>
    </div>
  );
} 