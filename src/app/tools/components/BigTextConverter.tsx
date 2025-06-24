'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Settings } from 'lucide-react';

const BIG_TEXT_FONTS = {
  block: {
    A: ['  ██  ', ' ████ ', '██  ██', '██████', '██  ██', '██  ██', '      '],
    B: ['██████', '██  ██', '██████', '██████', '██  ██', '██████', '      '],
    C: [' █████', '██    ', '██    ', '██    ', '██    ', ' █████', '      '],
    D: ['██████', '██  ██', '██  ██', '██  ██', '██  ██', '██████', '      '],
    E: ['██████', '██    ', '█████ ', '█████ ', '██    ', '██████', '      '],
    F: ['██████', '██    ', '█████ ', '█████ ', '██    ', '██    ', '      '],
    G: [' █████', '██    ', '██ ███', '██  ██', '██  ██', ' █████', '      '],
    H: ['██  ██', '██  ██', '██████', '██████', '██  ██', '██  ██', '      '],
    I: ['██████', '  ██  ', '  ██  ', '  ██  ', '  ██  ', '██████', '      '],
    J: ['██████', '    ██', '    ██', '    ██', '██  ██', ' █████', '      '],
    K: ['██  ██', '██ ██ ', '████  ', '████  ', '██ ██ ', '██  ██', '      '],
    L: ['██    ', '██    ', '██    ', '██    ', '██    ', '██████', '      '],
    M: ['██  ██', '██████', '██████', '██  ██', '██  ██', '██  ██', '      '],
    N: ['██  ██', '███ ██', '██████', '██ ███', '██  ██', '██  ██', '      '],
    O: [' █████', '██  ██', '██  ██', '██  ██', '██  ██', ' █████', '      '],
    P: ['██████', '██  ██', '██████', '██    ', '██    ', '██    ', '      '],
    Q: [' █████', '██  ██', '██  ██', '██ ███', '██  ██', ' ██████', '     █'],
    R: ['██████', '██  ██', '██████', '██ ██ ', '██  ██', '██  ██', '      '],
    S: [' █████', '██    ', ' ████ ', '    ██', '    ██', '█████ ', '      '],
    T: ['██████', '  ██  ', '  ██  ', '  ██  ', '  ██  ', '  ██  ', '      '],
    U: ['██  ██', '██  ██', '██  ██', '██  ██', '██  ██', ' █████', '      '],
    V: ['██  ██', '██  ██', '██  ██', '██  ██', ' ████ ', '  ██  ', '      '],
    W: ['██  ██', '██  ██', '██  ██', '██████', '██████', '██  ██', '      '],
    X: ['██  ██', ' ████ ', '  ██  ', '  ██  ', ' ████ ', '██  ██', '      '],
    Y: ['██  ██', '██  ██', ' ████ ', '  ██  ', '  ██  ', '  ██  ', '      '],
    Z: ['██████', '    ██', '   ██ ', '  ██  ', ' ██   ', '██████', '      '],
    ' ': ['      ', '      ', '      ', '      ', '      ', '      ', '      '],
  },
};

export default function BigTextConverter() {
  const [inputText, setInputText] = useState('');
  const [font, setFont] = useState<keyof typeof BIG_TEXT_FONTS>('block');

  const convertToBigText = (text: string): string => {
    if (!text.trim()) return '';

    const chars = text.toUpperCase().split('');
    const lines = Array(7)
      .fill('')
      .map(() => '');

    chars.forEach(char => {
      const charPattern =
        BIG_TEXT_FONTS[font][char as keyof typeof BIG_TEXT_FONTS.block] ||
        BIG_TEXT_FONTS[font][' '];
      charPattern.forEach((line, index) => {
        lines[index] += line;
      });
    });

    return lines.join('\n').trimEnd();
  };

  const getStats = () => {
    const result = convertToBigText(inputText);
    return {
      inputChars: inputText.length,
      outputChars: result.length,
      lines: result ? result.split('\n').length : 0,
      width: result
        ? Math.max(...result.split('\n').map(line => line.length))
        : 0,
    };
  };

  const handleDownload = () => {
    const result = convertToBigText(inputText);
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'big-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(convertToBigText(inputText));
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
            Font Style
          </h3>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFont('block')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              font === 'block'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Block
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Text Input
          </label>
          <textarea
            className="w-full min-h-[200px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
            placeholder="Enter text to convert to big ASCII art..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Big Text Output
          </label>
          <div className="w-full min-h-[200px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 font-mono text-xs leading-tight text-gray-900 dark:text-gray-100 overflow-x-auto whitespace-pre">
            {convertToBigText(inputText) || 'Big text will appear here...'}
          </div>
        </div>
      </div>

      {/* Preview */}
      {convertToBigText(inputText) && (
        <div className="bg-black p-4 rounded-lg overflow-x-auto">
          <pre className="font-mono text-xs text-green-400 leading-tight whitespace-pre">
            {convertToBigText(inputText)}
          </pre>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          Big Text Info
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>• Converts regular text into large ASCII art letters</div>
          <div>• Great for banners, headers, and eye-catching text</div>
          <div>• Only supports uppercase letters A-Z and spaces</div>
          <div>• Perfect for terminal displays and text-based art</div>
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
        <span>Input: {stats.inputChars} chars</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Output: {stats.outputChars} chars</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>
          Size: {stats.width} × {stats.lines}
        </span>
      </div>
    </div>
  );
}
