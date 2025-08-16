"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function UrlConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('encode');

  const encodeUrl = (text: string): string => {
    try {
      return encodeURIComponent(text)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
        .replace(/%20/g, '+');
    } catch (error) {
      return 'Error: Invalid input for URL encoding';
    }
  };

  const decodeUrl = (text: string): string => {
    try {
      return decodeURIComponent(text.replace(/\+/g, ' '));
    } catch (error) {
      return 'Error: Invalid URL encoded string';
    }
  };

  const handleConvert = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    const result = activeTab === 'encode' ? encodeUrl(input) : decodeUrl(input);
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
          <TabsTrigger value="encode">Encode URL</TabsTrigger>
          <TabsTrigger value="decode">Decode URL</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        <div>
          <Label htmlFor="input">Input Text</Label>
          <Textarea
            id="input"
            placeholder={activeTab === 'encode' ? 'Enter text to encode...' : 'Enter URL encoded text to decode...'}
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