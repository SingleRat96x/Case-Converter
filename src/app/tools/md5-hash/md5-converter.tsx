'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import CryptoJS from 'crypto-js';

export function Md5Converter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [uppercase, setUppercase] = useState(false);

  const generateMd5Hash = (text: string, uppercase: boolean): string => {
    try {
      const hash = CryptoJS.MD5(text).toString();
      return uppercase ? hash.toUpperCase() : hash.toLowerCase();
    } catch (error) {
      throw new Error('Failed to generate MD5 hash');
    }
  };

  const handleConvert = () => {
    try {
      const hash = generateMd5Hash(input, uppercase);
      setOutput(hash);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput('Error: Failed to generate hash');
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
          <Label htmlFor="input">Text to Hash</Label>
          <Textarea
            id="input"
            placeholder="Enter text to generate MD5 hash..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Note: MD5 is not cryptographically secure and should not be used for passwords.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700"
            />
            Uppercase hash
          </label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1">
            Generate MD5 Hash
          </Button>
          <Button onClick={handleClear} variant="outline">
            Clear
          </Button>
        </div>

        <div>
          <Label htmlFor="output">MD5 Hash</Label>
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
          Copy Hash
        </Button>
      </div>
    </Card>
  );
} 