'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw } from 'lucide-react';

const FONT_STYLES = {
  bold: {
    name: 'Bold',
    transform: (text: string) => text.replace(/[A-Za-z0-9]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code + 119743); // A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code + 119737); // a-z
      if (code >= 48 && code <= 57) return String.fromCharCode(code + 120734); // 0-9
      return char;
    })
  },
  italic: {
    name: 'Italic',
    transform: (text: string) => text.replace(/[A-Za-z]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code + 119795); // A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code + 119789); // a-z
      return char;
    })
  },
  boldItalic: {
    name: 'Bold Italic',
    transform: (text: string) => text.replace(/[A-Za-z]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code + 119847); // A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code + 119841); // a-z
      return char;
    })
  },
  monospace: {
    name: 'Monospace',
    transform: (text: string) => text.replace(/[A-Za-z0-9]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code + 120211); // A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code + 120205); // a-z
      if (code >= 48 && code <= 57) return String.fromCharCode(code + 120774); // 0-9
      return char;
    })
  },
  script: {
    name: 'Script',
    transform: (text: string) => text.replace(/[A-Za-z]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code + 119899); // A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code + 119893); // a-z
      return char;
    })
  },
  scriptBold: {
    name: 'Script Bold',
    transform: (text: string) => text.replace(/[A-Za-z]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code + 119951); // A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code + 119945); // a-z
      return char;
    })
  },
  fraktur: {
    name: 'Fraktur',
    transform: (text: string) => text.replace(/[A-Za-z]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code + 120003); // A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code + 119997); // a-z
      return char;
    })
  },
  doubleStruck: {
    name: 'Double Struck',
    transform: (text: string) => text.replace(/[A-Za-z0-9]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code + 120107); // A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code + 120101); // a-z
      if (code >= 48 && code <= 57) return String.fromCharCode(code + 120784); // 0-9
      return char;
    })
  },
  circled: {
    name: 'Circled',
    transform: (text: string) => text.replace(/[A-Za-z0-9]/g, (char) => {
      const mapping: { [key: string]: string } = {
        'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ', 'H': 'Ⓗ',
        'I': 'Ⓘ', 'J': 'Ⓙ', 'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ', 'O': 'Ⓞ', 'P': 'Ⓟ',
        'Q': 'Ⓠ', 'R': 'Ⓡ', 'S': 'Ⓢ', 'T': 'Ⓣ', 'U': 'Ⓤ', 'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ',
        'Y': 'Ⓨ', 'Z': 'Ⓩ', 'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ',
        'g': 'ⓖ', 'h': 'ⓗ', 'i': 'ⓘ', 'j': 'ⓙ', 'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ',
        'o': 'ⓞ', 'p': 'ⓟ', 'q': 'ⓠ', 'r': 'ⓡ', 's': 'ⓢ', 't': 'ⓣ', 'u': 'ⓤ', 'v': 'ⓥ',
        'w': 'ⓦ', 'x': 'ⓧ', 'y': 'ⓨ', 'z': 'ⓩ', '0': '⓪', '1': '①', '2': '②', '3': '③',
        '4': '④', '5': '⑤', '6': '⑥', '7': '⑦', '8': '⑧', '9': '⑨'
      };
      return mapping[char] || char;
    })
  },
  squared: {
    name: 'Squared',
    transform: (text: string) => text.replace(/[A-Za-z]/g, (char) => {
      const mapping: { [key: string]: string } = {
        'A': '🅰', 'B': '🅱', 'C': '🅲', 'D': '🅳', 'E': '🅴', 'F': '🅵', 'G': '🅶', 'H': '🅷',
        'I': '🅸', 'J': '🅹', 'K': '🅺', 'L': '🅻', 'M': '🅼', 'N': '🅽', 'O': '🅾', 'P': '🅿',
        'Q': '🆀', 'R': '🆁', 'S': '🆂', 'T': '🆃', 'U': '🆄', 'V': '🆅', 'W': '🆆', 'X': '🆇',
        'Y': '🆈', 'Z': '🆉'
      };
      return mapping[char.toUpperCase()] || char;
    })
  }
};

export default function InstagramFontsConverter() {
  const [inputText, setInputText] = useState('');

  const getStats = () => {
    return {
      characters: inputText.length,
      words: inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length,
      styles: Object.keys(FONT_STYLES).length,
    };
  };

  const handleCopyStyle = (styleName: keyof typeof FONT_STYLES) => {
    const transformed = FONT_STYLES[styleName].transform(inputText);
    navigator.clipboard.writeText(transformed);
  };

  const handleDownload = () => {
    const allStyles = Object.entries(FONT_STYLES).map(([key, style]) => 
      `${style.name}:\n${style.transform(inputText)}\n`
    ).join('\n');
    
    const blob = new Blob([allStyles], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instagram-fonts.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputText('');
  };

  const stats = getStats();

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      {/* Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Text Input</label>
        <textarea
          className="w-full min-h-[150px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
          placeholder="Enter text to convert to Instagram fonts..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </div>

      {/* Font Styles Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(FONT_STYLES).map(([key, style]) => (
          <div key={key} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">{style.name}</h3>
              <button
                onClick={() => handleCopyStyle(key as keyof typeof FONT_STYLES)}
                disabled={!inputText.trim()}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
            <div className="min-h-[80px] p-3 bg-white dark:bg-gray-800 rounded border text-gray-900 dark:text-gray-100 text-lg font-medium overflow-x-auto">
              {inputText ? style.transform(inputText) : `${style.name} preview`}
            </div>
          </div>
        ))}
      </div>

      {/* Usage Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">Instagram Fonts Guide</h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>• Transform your text into stylish Unicode fonts for social media</div>
          <div>• Perfect for Instagram bios, captions, stories, and posts</div>
          <div>• Also works on Facebook, Twitter, TikTok, and other platforms</div>
          <div>• Copy individual styles or download all variations</div>
          <div>• Unicode fonts are supported across all devices and platforms</div>
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
          Download All
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
        <span>Font Styles: {stats.styles}</span>
      </div>
    </div>
  );
} 