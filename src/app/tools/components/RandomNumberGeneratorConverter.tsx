'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Hash, Settings } from 'lucide-react';

export default function RandomNumberGeneratorConverter() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [allowDecimals, setAllowDecimals] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [generatedNumbers, setGeneratedNumbers] = useState<string[]>([]);

  const generateRandomNumber = (): string => {
    const random = Math.random() * (max - min) + min;
    return allowDecimals 
      ? random.toFixed(decimalPlaces)
      : Math.floor(random).toString();
  };

  const handleGenerate = () => {
    if (min > max) {
      setGeneratedNumbers(['Error: Minimum value must be less than or equal to maximum value']);
      return;
    }

    const newNumbers = Array.from({ length: count }, () => generateRandomNumber());
    setGeneratedNumbers(newNumbers);
  };

  const getResult = (): string => {
    return generatedNumbers.join('\n');
  };

  const handleDownload = () => {
    const result = getResult();
    const filename = `random-numbers-${count}.txt`;
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
    setGeneratedNumbers([]);
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">Random Number Generator Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Minimum</label>
                <input
                  type="number"
                  value={min}
                  onChange={(e) => setMin(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Maximum</label>
                <input
                  type="number"
                  value={max}
                  onChange={(e) => setMax(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Count</label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 border rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={allowDecimals}
                  onChange={(e) => setAllowDecimals(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Allow Decimal Numbers
              </label>
            </div>
            {allowDecimals && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Decimal Places</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={decimalPlaces}
                  onChange={(e) => setDecimalPlaces(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleGenerate}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
          >
            <Hash className="h-4 w-4" />
            Generate Random Number{count > 1 ? 's' : ''}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Generator Info</label>
          <div className="min-h-[300px] p-4 rounded-lg border bg-background text-gray-900 dark:text-gray-100">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Current Settings</h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Range: {min} to {max}</div>
                  <div>Count: {count} number{count > 1 ? 's' : ''}</div>
                  <div>Type: {allowDecimals ? `Decimal (${decimalPlaces} places)` : 'Integer'}</div>
                  <div>Total Possible: {allowDecimals ? 'Infinite' : (max - min + 1).toLocaleString()}</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Example Output</h4>
                <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {generateRandomNumber()}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Use Cases</h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>• Random sampling</div>
                  <div>• Lottery numbers</div>
                  <div>• Testing data</div>
                  <div>• Gaming applications</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Generated Numbers ({generatedNumbers.length})
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100 font-mono text-sm"
            readOnly
            value={getResult()}
            placeholder="Generated random numbers will appear here..."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={generatedNumbers.length === 0}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={generatedNumbers.length === 0}
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