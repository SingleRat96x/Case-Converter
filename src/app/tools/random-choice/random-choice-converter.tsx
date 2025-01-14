'use client';

import { useState } from 'react';
import { CaseConverterButtons } from '@/components/shared/CaseConverterButtons';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { calculateTextStatistics } from '@/lib/text-utils';

export function RandomChoiceConverter() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const generateRandomChoice = () => {
    const choices = input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (choices.length === 0) {
      setResult('Please enter some choices (one per line)');
      return;
    }

    const randomIndex = Math.floor(Math.random() * choices.length);
    setResult(choices[randomIndex]);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'random-choice.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  const handleClear = () => {
    setInput('');
    setResult('');
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input">Enter your choices (one per line)</Label>
            <Textarea
              id="input"
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[200px] font-mono"
            />
          </div>
          <Button 
            onClick={generateRandomChoice}
            className="w-full"
          >
            Generate Random Choice
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="output">Random Choice Result</Label>
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