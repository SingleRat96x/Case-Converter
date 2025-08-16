'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function NumberSorter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isDescending, setIsDescending] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [delimiter, setDelimiter] = useState('\n');

  const sortNumbers = (
    numbers: string,
    isDescending: boolean,
    removeDuplicates: boolean,
    delimiter: string
  ): string => {
    try {
      // Split the input by the delimiter and filter out empty strings
      let nums = numbers
        .split(new RegExp(`[${delimiter}]+`))
        .map(n => n.trim())
        .filter(Boolean)
        .map(n => {
          const parsed = parseFloat(n);
          if (isNaN(parsed)) {
            throw new Error(`Invalid number: ${n}`);
          }
          return parsed;
        });

      // Remove duplicates if requested
      if (removeDuplicates) {
        nums = Array.from(new Set(nums));
      }

      // Sort the numbers
      nums.sort((a, b) => isDescending ? b - a : a - b);

      // Join the numbers back together
      return nums.join(delimiter);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to sort numbers: ${error.message}`);
      }
      throw new Error('Failed to sort numbers');
    }
  };

  const handleSort = () => {
    try {
      const sorted = sortNumbers(input, isDescending, removeDuplicates, delimiter);
      setOutput(sorted);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput('Error: Failed to sort numbers');
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
          <Label htmlFor="input">Numbers to Sort</Label>
          <Textarea
            id="input"
            placeholder="Enter numbers (one per line or separated by commas)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px] font-mono"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={isDescending}
              onChange={(e) => setIsDescending(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700"
            />
            Sort descending
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={removeDuplicates}
              onChange={(e) => setRemoveDuplicates(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700"
            />
            Remove duplicates
          </label>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Delimiter:
            </label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="\n">New line</option>
              <option value=",">Comma</option>
              <option value=" ">Space</option>
              <option value=";">Semicolon</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSort} className="flex-1">
            Sort Numbers
          </Button>
          <Button onClick={handleClear} variant="outline">
            Clear
          </Button>
        </div>

        <div>
          <Label htmlFor="output">Sorted Numbers</Label>
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