'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextInput } from '@/app/components/shared/ToolInputs';
import { ActionButtonGroup } from '@/app/components/shared/ToolActions';
import { TextAnalytics, generateTextStats, type TextStats } from '@/app/components/shared/TextAnalytics';

export function Rot13Converter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState<TextStats>(generateTextStats(''));

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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setStats(generateTextStats(value));
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

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-4">
        <TextInput
          title="Text to Convert"
          value={input}
          onChange={handleInputChange}
          placeholder="Enter text to encode/decode using ROT13..."
          minHeight="md"
          fontFamily="mono"
        />

        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1">
            Convert ROT13
          </Button>
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
    </Card>
  );
} 