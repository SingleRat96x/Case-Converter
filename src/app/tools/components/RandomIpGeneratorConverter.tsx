'use client';

import { useState } from 'react';
import { Copy, Download, RefreshCw, Network } from 'lucide-react';

export default function RandomIpGeneratorConverter() {
  const [count, setCount] = useState(10);
  const [ipType, setIpType] = useState('ipv4');
  const [includePrivate, setIncludePrivate] = useState(true);
  const [generatedIps, setGeneratedIps] = useState<string[]>([]);

  const generateRandomIPv4 = (allowPrivate: boolean = true): string => {
    if (allowPrivate) {
      // Generate any IPv4 address
      return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
    } else {
      // Generate public IPv4 address (avoid private ranges)
      let octets: number[] = [];
      do {
        octets = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
      } while (
        (octets[0] === 10) || // 10.0.0.0/8
        (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || // 172.16.0.0/12
        (octets[0] === 192 && octets[1] === 168) // 192.168.0.0/16
      );
      return octets.join('.');
    }
  };

  const generateRandomIPv6 = (): string => {
    return Array.from({ length: 8 }, () => {
      return Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
    }).join(':');
  };

  const generateRandomIP = (): string => {
    return ipType === 'ipv4' ? generateRandomIPv4(includePrivate) : generateRandomIPv6();
  };

  const handleGenerate = () => {
    const ips = Array.from({ length: count }, () => generateRandomIP());
    setGeneratedIps(ips);
  };

  const getResult = (): string => {
    return generatedIps.join('\n');
  };

  const handleDownload = () => {
    const result = getResult();
    const filename = `random-ips-${ipType}-${count}.txt`;
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
    setGeneratedIps([]);
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-4">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">Count</label>
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-50">IP Type</label>
              <select
                value={ipType}
                onChange={(e) => setIpType(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                <option value="ipv4">IPv4 (192.168.1.1)</option>
                <option value="ipv6">IPv6 (2001:0db8:85a3:0000:0000:8a2e:0370:7334)</option>
              </select>
            </div>
            
            {ipType === 'ipv4' && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={includePrivate}
                    onChange={(e) => setIncludePrivate(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Include Private IPs
                </label>
              </div>
            )}
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <Network className="h-4 w-4" />
              Generate Random IPs
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">IP Address Info</label>
          <div className="min-h-[300px] p-4 rounded-lg border bg-background">
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>Count: {count} addresses</div>
              <div>Type: {ipType.toUpperCase()}</div>
              {ipType === 'ipv4' && (
                <div>Range: {includePrivate ? 'All IPs (public + private)' : 'Public IPs only'}</div>
              )}
              <div>Example: {generateRandomIP()}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Generated IP Addresses ({generatedIps.length})
          </label>
          <textarea
            className="w-full min-h-[300px] p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 resize-y font-mono text-sm"
            readOnly
            value={getResult()}
            placeholder="Generated IP addresses will appear here..."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={generatedIps.length === 0}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleCopy}
          disabled={generatedIps.length === 0}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Copy className="h-4 w-4" />
          Copy
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Clear
        </button>
      </div>
    </div>
  );
} 