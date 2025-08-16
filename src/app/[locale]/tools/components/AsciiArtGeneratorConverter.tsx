'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Settings } from 'lucide-react';

const ASCII_FONTS = {
  small: {
    A: [' _ ', '(_)', '/_\\'],
    B: ['┌─┐', '├─┤', '└─┘'],
    C: ['┌─┐', '│  ', '└─┘'],
    ' ': ['   ', '   ', '   '],
  },
  standard: {
    A: ['  █████  ', ' ██   ██ ', '███████ '],
    B: ['██████  ', '██   ██ ', '██████  '],
    C: ['███████ ', '██      ', '███████ '],
    ' ': ['        ', '        ', '        '],
  },
};

export default function AsciiArtGeneratorConverter() {
  const [inputText, setInputText] = useState('');
  const [font, setFont] = useState<keyof typeof ASCII_FONTS>('standard');
  const [style, setStyle] = useState<'filled' | 'outline'>('filled');

  const generateAsciiArt = (text: string): string => {
    if (!text.trim()) return '';

    const chars = text.toUpperCase().split('');
    const fontData = ASCII_FONTS[font];
    const height = Object.values(fontData)[0].length;
    const lines = Array(height)
      .fill('')
      .map(() => '');

    chars.forEach(char => {
      const charPattern =
        fontData[char as keyof typeof fontData] || fontData[' '];
      charPattern.forEach((line, index) => {
        lines[index] += line;
      });
    });

    let result = lines.join('\n').trimEnd();

    // Apply style modifications
    if (style === 'outline') {
      result = result.replace(/█/g, '▓').replace(/▓/g, '░');
    }

    return result;
  };

  const getStats = () => {
    const result = generateAsciiArt(inputText);
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
    const result = generateAsciiArt(inputText);
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateAsciiArt(inputText));
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
            ASCII Art Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Font Size
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFont('small')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  font === 'small'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Small
              </button>
              <button
                onClick={() => setFont('standard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  font === 'standard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Standard
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Style
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setStyle('filled')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  style === 'filled'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Filled
              </button>
              <button
                onClick={() => setStyle('outline')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  style === 'outline'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Outline
              </button>
            </div>
          </div>
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
            placeholder="Enter text to convert to ASCII art..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            ASCII Art Output
          </label>
          <div className="w-full min-h-[200px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 font-mono text-xs leading-tight text-gray-900 dark:text-gray-100 overflow-x-auto whitespace-pre">
            {generateAsciiArt(inputText) || 'ASCII art will appear here...'}
          </div>
        </div>
      </div>

      {/* Preview */}
      {generateAsciiArt(inputText) && (
        <div className="bg-black p-4 rounded-lg overflow-x-auto">
          <pre className="font-mono text-xs text-cyan-400 leading-tight whitespace-pre">
            {generateAsciiArt(inputText)}
          </pre>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          ASCII Art Generator
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>
            • Creates ASCII art from text using various fonts and styles
          </div>
          <div>• Perfect for terminal banners, signatures, and text art</div>
          <div>• Supports multiple font sizes and fill styles</div>
          <div>• Works best with short text (1-10 characters)</div>
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
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Font: {font}</span>
      </div>
    </div>
  );
}
