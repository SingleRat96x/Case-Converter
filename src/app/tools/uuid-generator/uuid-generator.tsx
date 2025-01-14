'use client';

import { useState } from 'react';
import { CaseConverterButtons } from '@/components/shared/CaseConverterButtons';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calculateTextStatistics } from '@/lib/text-utils';

export function UuidGenerator() {
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [result, setResult] = useState('');

  const generateUUID = () => {
    const uuids = Array.from({ length: count }, () => {
      let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

      if (uppercase) {
        uuid = uuid.toUpperCase();
      }

      return uuid;
    });

    setResult(uuids.join('\n'));
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uuids.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  const handleClear = () => {
    setResult('');
    setCount(1);
    setUppercase(false);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="count">Number of UUIDs</Label>
              <input
                type="number"
                id="count"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-950 dark:border-gray-800 dark:bg-gray-950"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={(e) => setUppercase(e.target.checked)}
                  className="h-4 w-4"
                />
                <span>Uppercase Format</span>
              </label>
            </div>
          </div>
          <Button 
            onClick={generateUUID}
            className="w-full"
          >
            Generate UUID{count > 1 ? 's' : ''}
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="output">Generated UUID{count > 1 ? 's' : ''}</Label>
            <div
              id="output"
              className="min-h-[200px] p-4 rounded-md bg-muted font-mono break-all whitespace-pre-wrap"
            >
              {result}
            </div>
          </div>
          <CaseConverterButtons
            onDownload={handleDownload}
            onCopy={handleCopy}
            onClear={handleClear}
            stats={calculateTextStatistics(result)}
          />
        </Card>
      </div>
    </div>
  );
} 