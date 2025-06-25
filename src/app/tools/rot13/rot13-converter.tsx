'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function Rot13Converter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const rot13 = (text: string): string => {
    try {
      return text.replace(/[a-zA-Z]/g, (char) => {
        const code = char.charCodeAt(0);
        const isUpperCase = code >= 65 && code <= 90;
        const base = isUpperCase ? 65 : 97;
        return String.fromCharCode(((code - base + 13) % 26) + base);
      });
    } catch (error) {
      throw new Error('Failed to process text');
    }
  };

  const handleConvert = () => {
    try {
      const result = rot13(input);
      setOutput(result);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput('Error: Failed to convert text');
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
          <Label htmlFor="input">Text to Convert</Label>
          <Textarea
            id="input"
            placeholder="Enter text to encode/decode using ROT13..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ROT13 is its own inverse - encoding and decoding use the same operation.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1">
            Convert ROT13
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
            className="min-h-[100px]"
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