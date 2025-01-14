'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function BinaryConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('encode');

  const textToBinary = (text: string): string => {
    return text
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(' ');
  };

  const binaryToText = (binary: string): string => {
    // Remove any spaces and validate binary string
    const cleanBinary = binary.replace(/\s/g, '');
    if (!/^[01]+$/.test(cleanBinary) || cleanBinary.length % 8 !== 0) {
      throw new Error('Invalid binary format');
    }

    // Convert binary to text
    const bytes = cleanBinary.match(/.{8}/g) || [];
    return bytes
      .map(byte => String.fromCharCode(parseInt(byte, 2)))
      .join('');
  };

  const handleEncode = () => {
    try {
      const binary = textToBinary(input);
      setOutput(binary);
    } catch (error) {
      setOutput('Error: Invalid input for binary conversion');
    }
  };

  const handleDecode = () => {
    try {
      const text = binaryToText(input);
      setOutput(text);
    } catch (error) {
      setOutput('Error: Invalid binary format. Please enter 8-bit binary numbers separated by spaces.');
    }
  };

  const handleConvert = () => {
    if (activeTab === 'encode') {
      handleEncode();
    } else {
      handleDecode();
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
          <TabsTrigger value="encode">Text to Binary</TabsTrigger>
          <TabsTrigger value="decode">Binary to Text</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          <div>
            <Label htmlFor="input">
              {activeTab === 'encode' ? 'Text to Convert' : 'Binary to Convert'}
            </Label>
            <Textarea
              id="input"
              placeholder={
                activeTab === 'encode'
                  ? 'Enter text to convert to binary...'
                  : 'Enter binary code (8 bits per character, space separated)...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConvert} className="flex-1">
              {activeTab === 'encode' ? 'Convert to Binary' : 'Convert to Text'}
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
      </Tabs>
    </Card>
  );
} 