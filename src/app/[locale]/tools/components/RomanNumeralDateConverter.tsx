'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Calendar, RotateCcw } from 'lucide-react';

type ConversionMode = 'toRoman' | 'fromRoman';

const ROMAN_NUMERALS: { [key: number]: string } = {
  1000: 'M',
  900: 'CM',
  500: 'D',
  400: 'CD',
  100: 'C',
  90: 'XC',
  50: 'L',
  40: 'XL',
  10: 'X',
  9: 'IX',
  5: 'V',
  4: 'IV',
  1: 'I',
};

const ROMAN_VALUES: { [key: string]: number } = {
  M: 1000,
  CM: 900,
  D: 500,
  CD: 400,
  C: 100,
  XC: 90,
  L: 50,
  XL: 40,
  X: 10,
  IX: 9,
  V: 5,
  IV: 4,
  I: 1,
};

export default function RomanNumeralDateConverter() {
  const [inputDate, setInputDate] = useState('');
  const [mode, setMode] = useState<ConversionMode>('toRoman');

  const numberToRoman = (num: number): string => {
    if (num <= 0 || num > 3999) return '';

    let result = '';
    for (const value of Object.keys(ROMAN_NUMERALS)
      .map(Number)
      .sort((a, b) => b - a)) {
      while (num >= value) {
        result += ROMAN_NUMERALS[value];
        num -= value;
      }
    }
    return result;
  };

  const romanToNumber = (roman: string): number => {
    if (!roman) return 0;

    let result = 0;
    let i = 0;

    while (i < roman.length) {
      if (i + 1 < roman.length && ROMAN_VALUES[roman.slice(i, i + 2)]) {
        result += ROMAN_VALUES[roman.slice(i, i + 2)];
        i += 2;
      } else if (ROMAN_VALUES[roman[i]]) {
        result += ROMAN_VALUES[roman[i]];
        i += 1;
      } else {
        return 0; // Invalid character
      }
    }

    return result;
  };

  const dateToRoman = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Error: Invalid date format';

      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      if (year > 3999)
        return 'Error: Year too large for Roman numerals (max 3999)';
      if (year <= 0) return 'Error: Year must be positive';

      const dayRoman = numberToRoman(day);
      const monthRoman = numberToRoman(month);
      const yearRoman = numberToRoman(year);

      return `${dayRoman} / ${monthRoman} / ${yearRoman}`;
    } catch {
      return 'Error: Invalid date format';
    }
  };

  const romanToDate = (romanStr: string): string => {
    try {
      const parts = romanStr.split('/').map(part => part.trim().toUpperCase());
      if (parts.length !== 3) return 'Error: Use format DD / MM / YYYY';

      const day = romanToNumber(parts[0]);
      const month = romanToNumber(parts[1]);
      const year = romanToNumber(parts[2]);

      if (day === 0 || month === 0 || year === 0) {
        return 'Error: Invalid Roman numerals';
      }

      if (day > 31 || month > 12) {
        return 'Error: Invalid date values';
      }

      // Create date and format
      const date = new Date(year, month - 1, day);
      if (date.getDate() !== day || date.getMonth() !== month - 1) {
        return 'Error: Invalid date';
      }

      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch {
      return 'Error: Invalid Roman numeral format';
    }
  };

  const getResult = (): string => {
    if (!inputDate.trim()) return '';

    return mode === 'toRoman' ? dateToRoman(inputDate) : romanToDate(inputDate);
  };

  const toggleMode = () => {
    const result = getResult();
    if (result && !result.startsWith('Error:')) {
      setInputDate(result);
    }
    setMode(mode === 'toRoman' ? 'fromRoman' : 'toRoman');
  };

  const getTodayExample = () => {
    const today = new Date();
    return mode === 'toRoman'
      ? today.toISOString().split('T')[0]
      : dateToRoman(today.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    const today = new Date();
    setInputDate(today.toISOString().split('T')[0]);
  };

  const handleDownload = () => {
    const result = getResult();
    if (result.startsWith('Error:')) return;

    const content = `Roman Numeral Date Conversion
Generated on: ${new Date().toLocaleString()}

Input: ${inputDate}
Output: ${result}
Mode: ${mode === 'toRoman' ? 'Date to Roman' : 'Roman to Date'}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roman-date.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const result = getResult();
    if (!result.startsWith('Error:')) {
      navigator.clipboard.writeText(result);
    }
  };

  const handleClear = () => {
    setInputDate('');
  };

  const result = getResult();

  return (
    <div className="w-full space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => setMode('toRoman')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'toRoman'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Date to Roman
        </button>
        <button
          onClick={toggleMode}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          title="Swap conversion mode"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={() => setMode('fromRoman')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'fromRoman'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Roman to Date
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
              {mode === 'toRoman' ? 'Date Input' : 'Roman Numeral Input'}
            </label>
            {mode === 'toRoman' && (
              <button
                onClick={handleSetToday}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Use Today
              </button>
            )}
          </div>
          {mode === 'toRoman' ? (
            <input
              type="date"
              className="w-full p-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100"
              value={inputDate}
              onChange={e => setInputDate(e.target.value)}
            />
          ) : (
            <textarea
              className="w-full min-h-[100px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100 font-mono"
              placeholder="Enter Roman numerals (e.g., XV / III / MMXXIV)"
              value={inputDate}
              onChange={e => setInputDate(e.target.value)}
            />
          )}
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {mode === 'toRoman' ? 'Roman Numeral Output' : 'Date Output'}
          </label>
          <textarea
            className={`w-full min-h-[100px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y font-mono text-lg ${
              result.startsWith('Error:')
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-900 dark:text-gray-100'
            }`}
            readOnly
            value={result || 'Converted result will appear here...'}
            placeholder="Conversion result will appear here..."
          />
        </div>
      </div>

      {/* Roman Numeral Guide */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          Roman Numeral Reference
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs text-gray-600 dark:text-gray-400">
          {Object.entries(ROMAN_NUMERALS)
            .slice(0, 13)
            .map(([num, roman]) => (
              <div key={num} className="font-mono">
                {num}: {roman}
              </div>
            ))}
        </div>
      </div>

      {/* Examples */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          Examples
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          {mode === 'toRoman' ? (
            <>
              <div>• 2024-03-15 → XV / III / MMXXIV</div>
              <div>• 1776-07-04 → IV / VII / MDCCLXXVI</div>
              <div>• Today: {getTodayExample()}</div>
            </>
          ) : (
            <>
              <div>• XV / III / MMXXIV → 2024-03-15</div>
              <div>• IV / VII / MDCCLXXVI → 1776-07-04</div>
              <div>• Use format: DD / MM / YYYY</div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={!inputDate.trim() || result.startsWith('Error:')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={!inputDate.trim() || result.startsWith('Error:')}
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
