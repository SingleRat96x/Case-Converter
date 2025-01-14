'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Morse code mapping
const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
  '!': '-.-.--', "'": '.----.', '"': '.-..-.', '(': '-.--.',
  ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '/': '-..-.',
  '_': '..--.-', '=': '-...-', '+': '.-.-.', '-': '-....-', '$': '...-..-',
  '@': '.--.-.', ' ': '/'
};

// Reverse mapping for decoding
const REVERSE_MORSE_CODE: Record<string, string> = Object.entries(MORSE_CODE).reduce(
  (acc, [char, morse]) => ({ ...acc, [morse]: char }),
  {}
);

export function MorseCodeConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('encode');

  const textToMorse = (text: string): string => {
    try {
      return text
        .toUpperCase()
        .split('')
        .map(char => MORSE_CODE[char] || char)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    } catch (error) {
      throw new Error('Failed to convert text to Morse code');
    }
  };

  const morseToText = (morse: string): string => {
    try {
      return morse
        .split(' ')
        .map(code => REVERSE_MORSE_CODE[code] || code)
        .join('')
        .trim();
    } catch (error) {
      throw new Error('Failed to convert Morse code to text');
    }
  };

  const handleConvert = () => {
    try {
      const result = activeTab === 'encode' ? textToMorse(input) : morseToText(input);
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
          <TabsTrigger value="encode">Text to Morse</TabsTrigger>
          <TabsTrigger value="decode">Morse to Text</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          <div>
            <Label htmlFor="input">
              {activeTab === 'encode' ? 'Text to Convert' : 'Morse Code to Convert'}
            </Label>
            <Textarea
              id="input"
              placeholder={
                activeTab === 'encode'
                  ? 'Enter text to convert to Morse code...'
                  : 'Enter Morse code (use spaces between letters, / between words)...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px] font-mono"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConvert} className="flex-1">
              {activeTab === 'encode' ? 'Convert to Morse' : 'Convert to Text'}
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
      </Tabs>
    </Card>
  );
} 