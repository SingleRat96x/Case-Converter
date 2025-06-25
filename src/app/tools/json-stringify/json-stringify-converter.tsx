'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function JsonStringifyConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [includeQuotes, setIncludeQuotes] = useState(true);

  const stringifyText = (text: string, includeQuotes: boolean): string => {
    try {
      // First, escape the text using JSON.stringify
      const escaped = JSON.stringify(text);
      
      // If quotes are not needed, remove the surrounding quotes
      return includeQuotes ? escaped : escaped.slice(1, -1);
    } catch (error) {
      throw new Error('Failed to stringify text');
    }
  };

  const handleConvert = () => {
    try {
      const result = stringifyText(input, includeQuotes);
      setOutput(result);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput('Error: Failed to stringify text');
      }
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="input">Text to Stringify</Label>
          <Textarea
            id="input"
            placeholder="Enter text to convert to JSON string format..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px] font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={includeQuotes}
              onChange={(e) => setIncludeQuotes(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700"
            />
            Include surrounding quotes
          </label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1">
            Stringify
          </Button>
          <Button onClick={handleClear} variant="outline">
            Clear
          </Button>
        </div>

        <div>
          <Label htmlFor="output">Result</Label>
          <Textarea
            id="output"
            value={output}
            readOnly
            className="min-h-[100px] font-mono"
          />
        </div>

        <Button
          onClick={handleCopy}
          variant="outline"
          className="w-full"
          disabled={!output}
        >
          Copy Result
        </Button>
      </div>
    </Card>
  );
} 