'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Settings } from 'lucide-react';

const ZALGO_CHARS = {
  up: [
    '\u030d',
    '\u030e',
    '\u0304',
    '\u0305',
    '\u033f',
    '\u0311',
    '\u0306',
    '\u0310',
    '\u0352',
    '\u0357',
    '\u0351',
    '\u0307',
    '\u0308',
    '\u030a',
    '\u0342',
    '\u0343',
    '\u0344',
    '\u034a',
    '\u034b',
    '\u034c',
    '\u0303',
    '\u0302',
    '\u030c',
    '\u0350',
    '\u0300',
    '\u0301',
    '\u030b',
    '\u030f',
    '\u0312',
    '\u0313',
    '\u0314',
    '\u033d',
    '\u0309',
    '\u0363',
    '\u0364',
    '\u0365',
    '\u0366',
    '\u0367',
    '\u0368',
    '\u0369',
    '\u036a',
    '\u036b',
    '\u036c',
    '\u036d',
    '\u036e',
    '\u036f',
    '\u033e',
    '\u035b',
    '\u0346',
    '\u031a',
  ],
  middle: [
    '\u0315',
    '\u031b',
    '\u0340',
    '\u0341',
    '\u0358',
    '\u0321',
    '\u0322',
    '\u0327',
    '\u0328',
    '\u0334',
    '\u0335',
    '\u0336',
    '\u034f',
    '\u035c',
    '\u035d',
    '\u035e',
    '\u035f',
    '\u0360',
    '\u0362',
    '\u0338',
    '\u0337',
    '\u0361',
    '\u0489',
  ],
  down: [
    '\u0316',
    '\u0317',
    '\u0318',
    '\u0319',
    '\u031c',
    '\u031d',
    '\u031e',
    '\u031f',
    '\u0320',
    '\u0324',
    '\u0325',
    '\u0326',
    '\u0329',
    '\u032a',
    '\u032b',
    '\u032c',
    '\u032d',
    '\u032e',
    '\u032f',
    '\u0330',
    '\u0331',
    '\u0332',
    '\u0333',
    '\u0339',
    '\u033a',
    '\u033b',
    '\u033c',
    '\u0345',
    '\u0347',
    '\u0348',
    '\u0349',
    '\u034d',
    '\u034e',
    '\u0353',
    '\u0354',
    '\u0355',
    '\u0356',
    '\u0359',
    '\u035a',
    '\u0323',
  ],
};

export default function CursedTextConverter() {
  const [inputText, setInputText] = useState('');
  const [intensity, setIntensity] = useState(50);
  const [upChars, setUpChars] = useState(true);
  const [middleChars, setMiddleChars] = useState(true);
  const [downChars, setDownChars] = useState(true);

  const addRandomChars = (chars: string[], count: number): string => {
    let result = '';
    for (let i = 0; i < count; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  const convertToCursed = (text: string): string => {
    if (!text.trim()) return '';

    const maxChars = Math.floor(intensity / 10) + 1;

    return text
      .split('')
      .map(char => {
        if (/\s/.test(char)) return char; // Don't modify whitespace

        let cursedChar = char;

        if (upChars && Math.random() < intensity / 100) {
          const count = Math.floor(Math.random() * maxChars) + 1;
          cursedChar += addRandomChars(ZALGO_CHARS.up, count);
        }

        if (middleChars && Math.random() < intensity / 100) {
          const count = Math.floor(Math.random() * maxChars) + 1;
          cursedChar += addRandomChars(ZALGO_CHARS.middle, count);
        }

        if (downChars && Math.random() < intensity / 100) {
          const count = Math.floor(Math.random() * maxChars) + 1;
          cursedChar += addRandomChars(ZALGO_CHARS.down, count);
        }

        return cursedChar;
      })
      .join('');
  };

  const getStats = () => {
    const result = convertToCursed(inputText);
    return {
      inputChars: inputText.length,
      outputChars: result.length,
      cursedChars: result.length - inputText.length,
      words: inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length,
    };
  };

  const handleDownload = () => {
    const result = convertToCursed(inputText);
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cursed-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(convertToCursed(inputText));
  };

  const handleClear = () => {
    setInputText('');
  };

  const stats = getStats();

  return (
    <div className="w-full space-y-4">
      {/* Settings */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Cursed Text Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
                Intensity: {intensity}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={intensity}
                onChange={e => setIntensity(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Character Types
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={upChars}
                  onChange={e => setUpChars(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Above characters
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={middleChars}
                  onChange={e => setMiddleChars(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Middle characters
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={downChars}
                  onChange={e => setDownChars(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Below characters
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Normal Text
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
            placeholder="Enter text to make cursed..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Cursed Text (Zalgo)
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100 text-lg leading-relaxed"
            readOnly
            value={convertToCursed(inputText)}
            placeholder="Cursed text will appear here..."
            style={{ fontFamily: 'Arial, sans-serif' }}
          />
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          ⚠️ Usage Warning
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>
            • Cursed text uses Unicode combining characters that may cause
            display issues
          </div>
          <div>• Some platforms may not render cursed text correctly</div>
          <div>
            • Use responsibly - excessive cursed text may be hard to read
          </div>
          <div>• Also known as "Zalgo text" or "glitch text"</div>
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
        <span>Added: {stats.cursedChars}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Words: {stats.words}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Intensity: {intensity}%</span>
      </div>
    </div>
  );
}
