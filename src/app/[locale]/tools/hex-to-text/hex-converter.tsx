'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdScript from '@/components/ads/AdScript';

export function HexConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('encode');

  const textToHex = (text: string): string => {
    try {
      return Array.from(text)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ');
    } catch (error) {
      throw new Error('Failed to convert text to hex');
    }
  };

  const hexToText = (hex: string): string => {
    try {
      // Remove spaces and validate hex string
      const cleanHex = hex.replace(/\s/g, '');
      if (!/^[0-9A-Fa-f]+$/.test(cleanHex) || cleanHex.length % 2 !== 0) {
        throw new Error('Invalid hex format');
      }

      // Convert hex to text
      const bytes = cleanHex.match(/.{2}/g) || [];
      return bytes
        .map(byte => String.fromCharCode(parseInt(byte, 16)))
        .join('');
    } catch (error) {
      throw new Error('Invalid hex format. Please enter valid hexadecimal values.');
    }
  };

  const handleConvert = () => {
    try {
      const result = activeTab === 'encode' ? textToHex(input) : hexToText(input);
      setOutput(result);
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput('Error: Failed to convert');
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
      <Tabs defaultValue="encode" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="encode">Text to Hex</TabsTrigger>
          <TabsTrigger value="decode">Hex to Text</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          <div>
            <Label htmlFor="input">
              {activeTab === 'encode' ? 'Text to Convert' : 'Hex to Convert'}
            </Label>
            <Textarea
              id="input"
              placeholder={
                activeTab === 'encode'
                  ? 'Enter text to convert to hex...'
                  : 'Enter hex values (e.g., 48 65 6c 6c 6f)...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px] font-mono"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConvert} className="flex-1">
              {activeTab === 'encode' ? 'Convert to Hex' : 'Convert to Text'}
            </Button>
            <Button onClick={handleClear} variant="outline">
              Clear
            </Button>
          </div>

          <AdScript />

          <div>
            <Label htmlFor="output">Result</Label>
            <Textarea
              id="output"
              value={output}
              readOnly
              className="min-h-[100px] font-mono"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              onClick={handleCopy}
              variant="outline"
              className="w-full sm:w-auto min-w-[140px]"
              disabled={!output}
            >
              Copy Result
            </Button>
          </div>
        </div>
      </Tabs>
    </Card>
  );
} 