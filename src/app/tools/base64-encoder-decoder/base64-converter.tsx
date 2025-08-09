'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdScript from '@/components/ads/AdScript';
import { ActionButtonGroup } from '@/app/components/shared/ToolActions';

export function Base64Converter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeTab, setActiveTab] = useState('encode');

  const handleEncode = () => {
    try {
      const encoded = btoa(input);
      setOutput(encoded);
    } catch (error) {
      setOutput('Error: Invalid input for Base64 encoding');
    }
  };

  const handleDecode = () => {
    try {
      const decoded = atob(input);
      setOutput(decoded);
    } catch (error) {
      setOutput('Error: Invalid Base64 input');
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
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          <div>
            <Label htmlFor="input">
              {activeTab === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
            </Label>
            <Textarea
              id="input"
              placeholder={
                activeTab === 'encode'
                  ? 'Enter text to convert to Base64...'
                  : 'Enter Base64 to decode...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConvert} className="flex-1">
              {activeTab === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
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
              className="min-h-[100px]"
            />
          </div>

          <ActionButtonGroup
            onCopy={handleCopy}
            onClear={handleClear}
            showDownload={false}
            className="justify-center"
          />
        </div>
      </Tabs>
    </Card>
  );
} 