'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextInput } from '@/app/components/shared/ToolInputs';
import { ActionButtonGroup } from '@/app/components/shared/ToolActions';
import { TextAnalytics, generateTextStats, type TextStats } from '@/app/components/shared/TextAnalytics';

export function CaesarCipher() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [shift, setShift] = useState(3);
  const [activeTab, setActiveTab] = useState('encode');
  const [stats, setStats] = useState<TextStats>(generateTextStats(''));

  const caesarCipher = (text: string, shiftAmount: number, decode: boolean): string => {
    const normalized = decode ? (26 - (shiftAmount % 26)) : (shiftAmount % 26);

    return text
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + normalized) % 26) + 65);
        }
        if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + normalized) % 26) + 97);
        }
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
    setStats(generateTextStats(''));
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setStats(generateTextStats(value));
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="encode" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          <TextInput
            title={activeTab === 'encode' ? 'Text to Encode' : 'Text to Decode'}
            value={input}
            onChange={handleInputChange}
            placeholder={activeTab === 'encode' ? 'Enter text to encode...' : 'Enter text to decode...'}
            minHeight="md"
            fontFamily="mono"
          />

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="shift" className="text-sm font-medium text-foreground">Shift Amount (0-25)</label>
              <input
                type="number"
                id="shift"
                min={0}
                max={25}
                value={shift}
                onChange={handleShiftChange}
                className="w-24 px-3 py-2 border rounded-md bg-background border-border"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConvert} className="flex-1">
                {activeTab === 'encode' ? 'Encode' : 'Decode'}
              </Button>
            </div>
          </div>

          <TextInput
            title="Result"
            value={output}
            readOnly
            minHeight="md"
            fontFamily="mono"
          />

          <ActionButtonGroup
            onCopy={handleCopy}
            onClear={handleClear}
            copyDisabled={!output}
            showDownload={false}
            className="justify-center"
          />

          <TextAnalytics stats={stats} mode="grid" />
        </div>
      </Tabs>
    </Card>
  );
} 