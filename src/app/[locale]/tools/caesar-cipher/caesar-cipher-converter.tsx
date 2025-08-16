'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CaesarCipher() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [shift, setShift] = useState(3);
  const [activeTab, setActiveTab] = useState('encode');

  const caesarCipher = (text: string, shift: number, decode: boolean): string => {
    // Normalize shift value
    shift = decode ? (26 - (shift % 26)) : (shift % 26);

    return text
      .split('')
      .map(char => {
        // Get the character code
        const code = char.charCodeAt(0);

        // Handle uppercase letters
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        
        // Handle lowercase letters
        if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        
        // Return unchanged for non-alphabetic characters
        return char;
      })
      .join('');
  };

  const handleConvert = () => {
    try {
      const result = caesarCipher(input, shift, activeTab === 'decode');
      setOutput(result);
    } catch (error) {
      setOutput('Error: Failed to process text');
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

  const handleShiftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setShift(Math.max(0, Math.min(25, value)));
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="encode" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          <div>
            <Label htmlFor="input">
              {activeTab === 'encode' ? 'Text to Encode' : 'Text to Decode'}
            </Label>
            <Textarea
              id="input"
              placeholder={
                activeTab === 'encode'
                  ? 'Enter text to encode...'
                  : 'Enter text to decode...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="shift">Shift Amount (0-25)</Label>
              <input
                type="number"
                id="shift"
                min="0"
                max="25"
                value={shift}
                onChange={handleShiftChange}
                className="w-20 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConvert} className="flex-1">
                {activeTab === 'encode' ? 'Encode' : 'Decode'}
              </Button>
              <Button onClick={handleClear} variant="outline">
                Clear
              </Button>
            </div>
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