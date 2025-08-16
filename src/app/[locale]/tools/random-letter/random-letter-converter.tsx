'use client';

import { useState } from 'react';
import { CaseConverterButtons } from '@/components/shared/CaseConverterButtons';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calculateTextStatistics } from '@/lib/text-utils';

export function RandomLetterConverter() {
  const [letterCase, setLetterCase] = useState<'uppercase' | 'lowercase' | 'both'>('both');
  const [count, setCount] = useState(1);
  const [result, setResult] = useState('');

  const generateRandomLetter = () => {
    const letters = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      both: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    };

    const letterPool = letters[letterCase];
    const randomLetters = Array.from({ length: count }, () => 
      letterPool[Math.floor(Math.random() * letterPool.length)]
    ).join(' ');

    setResult(randomLetters);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'random-letters.txt';
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
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Letter Case</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="uppercase"
                    checked={letterCase === 'uppercase'}
                    onChange={(e) => setLetterCase(e.target.value as 'uppercase')}
                    className="h-4 w-4"
                  />
                  <span>Uppercase</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="lowercase"
                    checked={letterCase === 'lowercase'}
                    onChange={(e) => setLetterCase(e.target.value as 'lowercase')}
                    className="h-4 w-4"
                  />
                  <span>Lowercase</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="both"
                    checked={letterCase === 'both'}
                    onChange={(e) => setLetterCase(e.target.value as 'both')}
                    className="h-4 w-4"
                  />
                  <span>Both</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="count">Number of Letters</Label>
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
          </div>
          <Button 
            onClick={generateRandomLetter}
            className="w-full"
          >
            Generate Random Letters
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="output">Random Letters Result</Label>
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