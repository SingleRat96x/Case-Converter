'use client';

import { useState } from 'react';
import { CaseConverterButtons } from '@/components/shared/CaseConverterButtons';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { generateTextStats } from '@/app/components/shared/TextAnalytics';

export function RandomMonthConverter() {
  const [format, setFormat] = useState<'full' | 'short' | 'number'>('full');
  const [result, setResult] = useState('');

  const months = {
    full: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    short: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    number: [
      '01', '02', '03', '04', '05', '06',
      '07', '08', '09', '10', '11', '12'
    ]
  };

  const generateRandomMonth = () => {
    const monthList = months[format];
    const randomIndex = Math.floor(Math.random() * 12);
    setResult(monthList[randomIndex]);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'random-month.txt';
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
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Month Format</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="full"
                    checked={format === 'full'}
                    onChange={(e) => setFormat(e.target.value as 'full')}
                    className="h-4 w-4"
                  />
                  <span>Full Name</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="short"
                    checked={format === 'short'}
                    onChange={(e) => setFormat(e.target.value as 'short')}
                    className="h-4 w-4"
                  />
                  <span>Short Name</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="number"
                    checked={format === 'number'}
                    onChange={(e) => setFormat(e.target.value as 'number')}
                    className="h-4 w-4"
                  />
                  <span>Number</span>
                </label>
              </div>
            </div>
          </div>
          <Button 
            onClick={generateRandomMonth}
            className="w-full"
          >
            Generate Random Month
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="output">Random Month Result</Label>
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
            stats={generateTextStats(result)}
          />
        </Card>
      </div>
    </div>
  );
} 