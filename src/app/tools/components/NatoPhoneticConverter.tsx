'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, RotateCcw } from 'lucide-react';

const NATO_PHONETIC: Record<string, string> = {
  'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta', 'E': 'Echo', 'F': 'Foxtrot',
  'G': 'Golf', 'H': 'Hotel', 'I': 'India', 'J': 'Juliet', 'K': 'Kilo', 'L': 'Lima',
  'M': 'Mike', 'N': 'November', 'O': 'Oscar', 'P': 'Papa', 'Q': 'Quebec', 'R': 'Romeo',
  'S': 'Sierra', 'T': 'Tango', 'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray',
  'Y': 'Yankee', 'Z': 'Zulu', '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three',
  '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine'
};

const REVERSE_NATO: Record<string, string> = Object.entries(NATO_PHONETIC).reduce(
  (acc, [char, phonetic]) => ({ ...acc, [phonetic.toLowerCase()]: char }),
  {}
);

export default function NatoPhoneticConverter() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const textToNato = (text: string): string => {
    return text
      .toUpperCase()
      .split('')
      .map(char => NATO_PHONETIC[char] || char)
      .filter(word => word.trim())
      .join(' ');
  };

  const natoToText = (nato: string): string => {
    return nato
      .split(/\s+/)
      .map(word => REVERSE_NATO[word.toLowerCase()] || word)
      .join('');
  };

  const getResult = (): string => {
    if (!inputText.trim()) return '';
    
    try {
      return mode === 'encode' ? textToNato(inputText) : natoToText(inputText);
    } catch {
      return 'Error: Invalid input';
    }
  };

  const handleSwapMode = () => {
    const result = getResult();
    setInputText(result);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  const handleDownload = () => {
    const result = getResult();
    const filename = `nato-phonetic-${mode}.txt`;
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
    navigator.clipboard.writeText(getResult());
  };

  const handleClear = () => {
    setInputText('');
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => setMode('encode')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'encode'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Text to NATO
        </button>
        <button
          onClick={handleSwapMode}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          title="Swap input/output"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'decode'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          NATO to Text
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {mode === 'encode' ? 'Text Input' : 'NATO Phonetic Input'}
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
            placeholder={mode === 'encode' ? 'Enter text to convert to NATO phonetic...' : 'Enter NATO phonetic words (Alpha Bravo Charlie...)'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {mode === 'encode' ? 'NATO Phonetic Output' : 'Text Output'}
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100"
            readOnly
            value={getResult()}
            placeholder="Converted result will appear here..."
          />
        </div>
      </div>

      {/* Reference */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">NATO Phonetic Alphabet</h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
          {Object.entries(NATO_PHONETIC).slice(0, 26).map(([char, phonetic]) => (
            <div key={char} className="font-mono">
              {char}: {phonetic}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={!getResult()}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={!getResult()}
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
    </div>
  );
} 