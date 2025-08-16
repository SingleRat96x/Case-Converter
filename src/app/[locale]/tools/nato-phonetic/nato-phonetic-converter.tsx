'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NATO_ALPHABET: { [key: string]: string } = {
  'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta', 'E': 'Echo',
  'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel', 'I': 'India', 'J': 'Juliet',
  'K': 'Kilo', 'L': 'Lima', 'M': 'Mike', 'N': 'November', 'O': 'Oscar',
  'P': 'Papa', 'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango',
  'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray', 'Y': 'Yankee',
  'Z': 'Zulu', '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three',
  '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight',
  '9': 'Nine'
};

// Create reverse mapping for decoding
const REVERSE_NATO = Object.entries(NATO_ALPHABET).reduce((acc, [key, value]) => {
  acc[value.toLowerCase()] = key;
  return acc;
}, {} as { [key: string]: string });

export function NatoPhoneticConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('encode');

  const textToNato = (text: string): string => {
    try {
      return text
        .toUpperCase()
        .split('')
        .map(char => {
          if (char === ' ') return '\n';
          if (NATO_ALPHABET[char]) {
            return NATO_ALPHABET[char];
          }
          return char;
        })
        .join(' ')
        .trim();
    } catch (error) {
      throw new Error('Failed to convert text to NATO phonetic alphabet');
    }
  };

  const natoToText = (nato: string): string => {
    try {
      return nato
        .toLowerCase()
        .split(/[\n\r]+/)
        .map(word => 
          word
            .split(' ')
            .map(part => {
              if (REVERSE_NATO[part.toLowerCase()]) {
                return REVERSE_NATO[part.toLowerCase()];
              }
              return part;
            })
            .join('')
        )
        .join(' ')
        .toUpperCase();
    } catch (error) {
      throw new Error('Failed to convert NATO phonetic alphabet to text');
    }
  };

  const handleConvert = () => {
    try {
      const result = activeTab === 'encode' ? textToNato(input) : natoToText(input);
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
          <TabsTrigger value="encode">Text to NATO</TabsTrigger>
          <TabsTrigger value="decode">NATO to Text</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          <div>
            <Label htmlFor="input">
              {activeTab === 'encode' ? 'Text to Convert' : 'NATO Phonetic to Convert'}
            </Label>
            <Textarea
              id="input"
              placeholder={
                activeTab === 'encode'
                  ? 'Enter text to convert to NATO phonetic alphabet...'
                  : 'Enter NATO phonetic alphabet (e.g., Alpha Bravo Charlie)...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConvert} className="flex-1">
              {activeTab === 'encode' ? 'Convert to NATO' : 'Convert to Text'}
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