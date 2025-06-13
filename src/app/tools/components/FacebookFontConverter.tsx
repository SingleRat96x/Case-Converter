'use client';

import { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

const fontStyles = {
  'bold': {
    name: 'Bold',
    transform: (text: string) => text.replace(/[a-zA-Z0-9]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code - 65 + 0x1D400); // Bold A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code - 97 + 0x1D41A); // Bold a-z
      if (code >= 48 && code <= 57) return String.fromCharCode(code - 48 + 0x1D7CE); // Bold 0-9
      return char;
    })
  },
  'italic': {
    name: 'Italic',
    transform: (text: string) => text.replace(/[a-zA-Z]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code - 65 + 0x1D434); // Italic A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code - 97 + 0x1D44E); // Italic a-z
      return char;
    })
  },
  'bold-italic': {
    name: 'Bold Italic',
    transform: (text: string) => text.replace(/[a-zA-Z]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code - 65 + 0x1D468); // Bold Italic A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code - 97 + 0x1D482); // Bold Italic a-z
      return char;
    })
  },
  'script': {
    name: 'Script',
    transform: (text: string) => text.replace(/[a-zA-Z]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code - 65 + 0x1D49C); // Script A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code - 97 + 0x1D4B6); // Script a-z
      return char;
    })
  },
  'bold-script': {
    name: 'Bold Script',
    transform: (text: string) => text.replace(/[a-zA-Z]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code - 65 + 0x1D4D0); // Bold Script A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code - 97 + 0x1D4EA); // Bold Script a-z
      return char;
    })
  },
  'fraktur': {
    name: 'Gothic',
    transform: (text: string) => text.replace(/[a-zA-Z]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code - 65 + 0x1D504); // Fraktur A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code - 97 + 0x1D51E); // Fraktur a-z
      return char;
    })
  },
  'double-struck': {
    name: 'Double Struck',
    transform: (text: string) => text.replace(/[a-zA-Z0-9]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code - 65 + 0x1D538); // Double Struck A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code - 97 + 0x1D552); // Double Struck a-z
      if (code >= 48 && code <= 57) return String.fromCharCode(code - 48 + 0x1D7D8); // Double Struck 0-9
      return char;
    })
  },
  'sans-serif': {
    name: 'Sans Serif',
    transform: (text: string) => text.replace(/[a-zA-Z0-9]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code - 65 + 0x1D5A0); // Sans Serif A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code - 97 + 0x1D5BA); // Sans Serif a-z
      if (code >= 48 && code <= 57) return String.fromCharCode(code - 48 + 0x1D7E2); // Sans Serif 0-9
      return char;
    })
  },
  'sans-serif-bold': {
    name: 'Sans Serif Bold',
    transform: (text: string) => text.replace(/[a-zA-Z0-9]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code - 65 + 0x1D5D4); // Sans Serif Bold A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code - 97 + 0x1D5EE); // Sans Serif Bold a-z
      if (code >= 48 && code <= 57) return String.fromCharCode(code - 48 + 0x1D7EC); // Sans Serif Bold 0-9
      return char;
    })
  },
  'monospace': {
    name: 'Monospace',
    transform: (text: string) => text.replace(/[a-zA-Z0-9]/g, (char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCharCode(code - 65 + 0x1D670); // Monospace A-Z
      if (code >= 97 && code <= 122) return String.fromCharCode(code - 97 + 0x1D68A); // Monospace a-z
      if (code >= 48 && code <= 57) return String.fromCharCode(code - 48 + 0x1D7F6); // Monospace 0-9
      return char;
    })
  }
};

export default function FacebookFontConverter() {
  const [input, setInput] = useState('');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setInput('');
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      {/* Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
          Enter your text
        </label>
        <textarea
          className="w-full min-h-[100px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
          placeholder="Type your text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* Font Styles Grid */}
      {input && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Choose a style for Facebook posts and comments:
          </h3>
          <div className="grid gap-3">
            {Object.entries(fontStyles).map(([key, style]) => {
              const transformedText = style.transform(input);
              return (
                <div key={key} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {style.name}
                    </h4>
                    <button
                      onClick={() => handleCopy(transformedText)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded border font-display text-lg text-gray-900 dark:text-gray-100 min-h-[60px] break-words">
                    {transformedText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">How to Use</h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>1. Type your text in the input field above</div>
          <div>2. Choose a style from the generated options</div>
          <div>3. Click "Copy" to copy the styled text</div>
          <div>4. Paste it into your Facebook post or comment</div>
          <div className="text-amber-600 dark:text-amber-400 mt-2">
            <strong>Note:</strong> These fonts work on Facebook, Instagram, Twitter, and most social media platforms.
          </div>
        </div>
      </div>

      {/* Example */}
      {!input && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">Example</h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <div>Input: "Hello Facebook!"</div>
            <div>
              <strong>Bold:</strong> <span className="font-display text-lg">{fontStyles.bold.transform("Hello Facebook!")}</span>
            </div>
            <div>
              <strong>Script:</strong> <span className="font-display text-lg">{fontStyles.script.transform("Hello Facebook!")}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Clear
        </button>
      </div>
    </div>
  );
} 