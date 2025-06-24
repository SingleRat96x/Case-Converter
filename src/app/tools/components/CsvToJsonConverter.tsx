'use client';

import { useState } from 'react';
import {
  Copy,
  Download,
  RefreshCw,
  ArrowLeftRight,
  Upload,
  Settings,
} from 'lucide-react';

type ConversionMode = 'csvToJson' | 'jsonToCsv';

export default function CsvToJsonConverter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('csvToJson');
  const [delimiter, setDelimiter] = useState(',');
  const [error, setError] = useState<string | null>(null);

  const parseCsvToJson = (csv: string, delimiter: string): string => {
    try {
      const lines = csv
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length === 0) throw new Error('Empty input');

      // Parse headers
      const headers = lines[0]
        .split(delimiter)
        .map(header => header.trim().replace(/^"|"$/g, ''))
        .filter(header => header.length > 0);

      if (headers.length === 0) throw new Error('No valid headers found');

      // Parse data rows
      const jsonData = lines.slice(1).map(line => {
        const values = line.split(delimiter).map(value => {
          const trimmed = value.trim().replace(/^"|"$/g, '');
          if (trimmed === 'true') return true;
          if (trimmed === 'false') return false;
          if (!isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed);
          return trimmed;
        });

        const row: Record<string, any> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] !== undefined ? values[index] : '';
        });

        return row;
      });

      return JSON.stringify(jsonData, null, 2);
    } catch (error) {
      throw new Error(
        'Invalid CSV format. Please check your input and delimiter.'
      );
    }
  };

  const parseJsonToCsv = (jsonStr: string, delimiter: string): string => {
    try {
      const data = JSON.parse(jsonStr);
      if (!Array.isArray(data)) {
        throw new Error('Input must be a JSON array');
      }
      if (data.length === 0) {
        throw new Error('Empty JSON array');
      }

      // Get all unique headers from all objects
      const headers = Array.from(
        new Set(data.flatMap(obj => Object.keys(obj)))
      );

      // Create CSV header row
      const csvRows = [headers.join(delimiter)];

      // Create data rows
      data.forEach(obj => {
        const row = headers.map(header => {
          const value = obj[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(delimiter)) {
            return `"${value}"`;
          }
          return String(value);
        });
        csvRows.push(row.join(delimiter));
      });

      return csvRows.join('\n');
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format. Please check your input.');
      }
      throw error;
    }
  };

  const getResult = (): string => {
    if (!input.trim()) return '';

    try {
      setError(null);
      return mode === 'csvToJson'
        ? parseCsvToJson(input, delimiter)
        : parseJsonToCsv(input, delimiter);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Conversion failed';
      setError(errorMsg);
      return `Error: ${errorMsg}`;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      setInput(content);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const toggleMode = () => {
    const result = getResult();
    if (result && !result.startsWith('Error:')) {
      setInput(result);
    }
    setMode(prev => (prev === 'csvToJson' ? 'jsonToCsv' : 'csvToJson'));
    setError(null);
  };

  const handleDownload = () => {
    const result = getResult();
    if (result.startsWith('Error:')) return;

    const extension = mode === 'csvToJson' ? 'json' : 'csv';
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${extension}`;
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
    setInput('');
    setError(null);
  };

  const result = getResult();

  return (
    <div className="w-full space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => setMode('csvToJson')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'csvToJson'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          CSV to JSON
        </button>
        <button
          onClick={toggleMode}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          title="Swap input/output"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => setMode('jsonToCsv')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'jsonToCsv'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          JSON to CSV
        </button>
      </div>

      {/* Settings */}
      {mode === 'csvToJson' && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
              CSV Settings
            </h3>
          </div>
          <div className="flex gap-2">
            <select
              value={delimiter}
              onChange={e => setDelimiter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
            <label className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer text-sm">
              <Upload className="h-4 w-4" />
              Upload File
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {mode === 'csvToJson' ? 'CSV Input' : 'JSON Input'}
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-gray-100 font-mono text-sm"
            placeholder={
              mode === 'csvToJson'
                ? 'name,age,city\nJohn,30,New York\nJane,25,Los Angeles'
                : '[{"name":"John","age":30,"city":"New York"}]'
            }
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            {mode === 'csvToJson' ? 'JSON Output' : 'CSV Output'}
          </label>
          <textarea
            className={`w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y font-mono text-sm ${
              error
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-900 dark:text-gray-100'
            }`}
            readOnly
            value={result}
            placeholder="Converted data will appear here..."
          />
        </div>
      </div>

      {/* Examples */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
          {mode === 'csvToJson' ? 'CSV Format Example' : 'JSON Format Example'}
        </h3>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {mode === 'csvToJson' ? (
            <pre className="whitespace-pre-wrap">
              name,age,city{'\n'}John,30,New York{'\n'}Jane,25,Los Angeles
            </pre>
          ) : (
            <pre className="whitespace-pre-wrap">
              {`[
  {"name": "John", "age": 30, "city": "New York"},
  {"name": "Jane", "age": 25, "city": "Los Angeles"}
]`}
            </pre>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={!input.trim() || result.startsWith('Error:')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={!input.trim() || result.startsWith('Error:')}
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
