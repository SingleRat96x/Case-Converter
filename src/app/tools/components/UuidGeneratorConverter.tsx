'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Hash, Settings } from 'lucide-react';

interface GeneratorStats {
  generated: number;
  total: number;
  version: string;
  format: string;
}

export default function UuidGeneratorConverter() {
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [includeHyphens, setIncludeHyphens] = useState(true);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [stats, setStats] = useState<GeneratorStats>({
    generated: 0,
    total: 0,
    version: 'v4',
    format: 'Standard'
  });

  const generateUUID = (): string => {
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    if (!includeHyphens) {
      uuid = uuid.replace(/-/g, '');
    }

    if (uppercase) {
      uuid = uuid.toUpperCase();
    }

    return uuid;
  };

  const handleGenerate = () => {
    const newUuids = Array.from({ length: count }, () => generateUUID());
    setGeneratedUuids(newUuids);
    
    updateStats(newUuids);
  };

  const updateStats = (uuids: string[]) => {
    setStats({
      generated: uuids.length,
      total: generatedUuids.length + uuids.length,
      version: 'v4',
      format: includeHyphens ? (uppercase ? 'UPPERCASE' : 'lowercase') : (uppercase ? 'HEX-UPPER' : 'hex-lower')
    });
  };

  const getResult = (): string => {
    return generatedUuids.join('\n');
  };

  const handleDownload = () => {
    const result = getResult();
    const filename = `uuid-${count > 1 ? 'list' : 'single'}.txt`;
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
    setGeneratedUuids([]);
    setStats({
      generated: 0,
      total: 0,
      version: 'v4',
      format: 'Standard'
    });
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      {/* Generator Settings */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">UUID Generator Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Number of UUIDs
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-2 border rounded text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Format Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={(e) => setUppercase(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Uppercase
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={includeHyphens}
                  onChange={(e) => setIncludeHyphens(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Include hyphens
              </label>
            </div>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <Hash className="h-4 w-4" />
              Generate UUID{count > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Preview/Instructions */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            UUID Preview & Info
          </label>
          <div className="min-h-[300px] p-4 rounded-lg border bg-background text-gray-900 dark:text-gray-100">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">UUID Format</h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Version: UUID v4 (Random)</div>
                  <div>Length: {includeHyphens ? '36' : '32'} characters</div>
                  <div>Format: {includeHyphens ? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' : 'xxxxxxxx4xxxyxxxxxxxxxxx'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Example Output</h4>
                <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  {generateUUID()}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Use Cases</h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>• Database primary keys</div>
                  <div>• Unique identifiers</div>
                  <div>• Session tokens</div>
                  <div>• File naming</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Output */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Generated UUID{generatedUuids.length > 1 ? 's' : ''} ({generatedUuids.length})
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y text-gray-900 dark:text-gray-100 font-mono text-sm"
            readOnly
            value={getResult()}
            placeholder="Generated UUIDs will appear here..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={generatedUuids.length === 0}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Download UUIDs
        </button>
        <button
          onClick={handleCopy}
          disabled={generatedUuids.length === 0}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors text-gray-900 dark:text-gray-100 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Copy className="h-4 w-4" />
          Copy UUIDs
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
        <span>Generated: {stats.generated}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Total Session: {stats.total}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Version: {stats.version}</span>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <span>Format: {stats.format}</span>
      </div>
    </div>
  );
} 