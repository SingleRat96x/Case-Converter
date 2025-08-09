'use client';

import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { TextInput } from '@/app/components/shared/ToolInputs';
import { ActionButtonGroup } from '@/app/components/shared/ToolActions';
import { TextAnalytics, generateTextStats, type TextStats } from '@/app/components/shared/TextAnalytics';

export default function Utf8Converter() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [stats, setStats] = useState<TextStats>(generateTextStats(''));

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

  const processText = (text: string): string => {
    if (!text.trim()) return '';
    return mode === 'encode' ? encodeUtf8(text) : decodeUtf8(text);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    setStats(generateTextStats(newText));
  };

  const handleModeSwitch = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
  };

  const handleDownload = () => {
    const result = processText(inputText);
    const filename = mode === 'encode' ? 'utf8-encoded.txt' : 'utf8-decoded.txt';
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(processText(inputText));
  };

  const handleClear = () => {
    setInputText('');
    setStats(generateTextStats(''));
  };

  return (
    <div className="w-full space-y-6">
      {/* Mode Toggle */}
      <div className="tool-settings-default tool-card-vibrant p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Mode</h3>
            <p className="text-xs text-muted-foreground">
              {mode === 'encode' ? 'Encode text to UTF-8' : 'Decode UTF-8 encoded text'}
            </p>
          </div>
          <button
            onClick={handleModeSwitch}
            className="tool-button-primary px-4 py-2 h-10 rounded-md text-sm inline-flex items-center gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            {mode === 'encode' ? 'Switch to Decode' : 'Switch to Encode'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TextInput
          title={mode === 'encode' ? 'Text to Encode' : 'UTF-8 to Decode'}
          value={inputText}
          onChange={handleInputChange}
          placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter UTF-8 encoded text to decode...'}
          minHeight="md"
          fontFamily="mono"
        />

        <TextInput
          title={mode === 'encode' ? 'UTF-8 Encoded Result' : 'Decoded Text Result'}
          value={processText(inputText)}
          readOnly
          minHeight="md"
          fontFamily="mono"
        />
      </div>

      <ActionButtonGroup
        onDownload={handleDownload}
        onCopy={handleCopy}
        onClear={handleClear}
        downloadDisabled={!inputText}
        copyDisabled={!inputText}
      />

      <TextAnalytics stats={stats} mode="grid" />
    </div>
  );
}
