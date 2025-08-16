'use client';

import { useState } from 'react';
import { CaseConverterButtons } from '@/components/shared/CaseConverterButtons';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calculateTextStatistics } from '@/lib/text-utils';

export function RandomNumberConverter() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [allowDecimals, setAllowDecimals] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [result, setResult] = useState('');

  const generateRandomNumber = () => {
    if (min > max) {
      setResult('Minimum value must be less than or equal to maximum value');
      return;
    }

    const numbers = Array.from({ length: count }, () => {
      const random = Math.random() * (max - min) + min;
      return allowDecimals 
        ? random.toFixed(decimalPlaces)
        : Math.floor(random).toString();
    });

    setResult(numbers.join('\n'));
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'random-numbers.txt';
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
    setMin(1);
    setMax(100);
    setCount(1);
    setAllowDecimals(false);
    setDecimalPlaces(2);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min">Minimum Value</Label>
                <input
                  type="number"
                  id="min"
                  value={min}
                  onChange={(e) => setMin(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-950 dark:border-gray-800 dark:bg-gray-950"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Maximum Value</Label>
                <input
                  type="number"
                  id="max"
                  value={max}
                  onChange={(e) => setMax(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-950 dark:border-gray-800 dark:bg-gray-950"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Number of Values</Label>
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
                  checked={allowDecimals}
                  onChange={(e) => setAllowDecimals(e.target.checked)}
                  className="h-4 w-4"
                />
                <span>Allow Decimal Numbers</span>
              </label>
            </div>
            {allowDecimals && (
              <div className="space-y-2">
                <Label htmlFor="decimals">Decimal Places</Label>
                <input
                  type="number"
                  id="decimals"
                  min="0"
                  max="10"
                  value={decimalPlaces}
                  onChange={(e) => setDecimalPlaces(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-950 dark:border-gray-800 dark:bg-gray-950"
                />
              </div>
            )}
          </div>
          <Button 
            onClick={generateRandomNumber}
            className="w-full"
          >
            Generate Random Numbers
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="output">Random Numbers Result</Label>
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