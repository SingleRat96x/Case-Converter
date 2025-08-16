"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Utf8Converter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('encode');

  const encodeUtf8 = (text: string): string => {
    try {
      return encodeURIComponent(text);
    } catch (error) {
      return 'Error: Invalid input for UTF-8 encoding';
    }
  };

  const decodeUtf8 = (text: string): string => {
    try {
      return decodeURIComponent(text);
    } catch (error) {
      return 'Error: Invalid UTF-8 encoded string';
    }
  };

  const handleConvert = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    const result = activeTab === 'encode' ? encodeUtf8(input) : decodeUtf8(input);
    setOutput(result);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
    }
  };

  return (
    <Card className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encode">Encode UTF-8</TabsTrigger>
          <TabsTrigger value="decode">Decode UTF-8</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        <div>
          <Label htmlFor="input">Input Text</Label>
          <Textarea
            id="input"
            placeholder={activeTab === 'encode' ? 'Enter text to encode...' : 'Enter UTF-8 encoded text to decode...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px]"
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

        <div>
          <Label htmlFor="output">Output</Label>
          <div className="relative">
            <Textarea
              id="output"
              value={output}
              readOnly
              className="min-h-[100px]"
            />
            {output && (
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
              >
                Copy
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
} 