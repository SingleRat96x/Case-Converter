'use client';

import { useState } from 'react';
import { ToolLayout, InputOutputGrid } from '@/lib/shared/ToolLayout';
import { TextInput } from '@/app/[locale]/components/shared/ToolInputs';
import { ConverterActions } from '@/app/[locale]/components/shared/ToolActions';
import {
  TextAnalytics,
  useTextStats,
  type TextStats,
} from '@/app/[locale]/components/shared/TextAnalytics';
import AdSpace from '../components/AdSpace';

export default function UppercaseConverter() {
  const [inputText, setInputText] = useState('');
  const [stats, setStats] = useState<TextStats>({});
  const { calculateStats } = useTextStats();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setInputText(newText);
    setStats(calculateStats(newText));
  };

  const convertToUpperCase = (text: string) => {
    return text.toUpperCase();
  };

  const handleDownload = () => {
    const blob = new Blob([convertToUpperCase(inputText)], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uppercase-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(convertToUpperCase(inputText));
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setStats({});
  };

  const handleSwap = () => {
    const converted = convertToUpperCase(inputText);
    setInputText(converted);
    setStats(calculateStats(converted));
  };

  const convertedText = convertToUpperCase(inputText);

  return (
    <ToolLayout>
      {/* Input/Output Grid Layout - New Universal Component */}
      <InputOutputGrid>
        <TextInput
          title="Input Text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enter your text here to convert to uppercase..."
          minHeight="lg"
          variant="gradient"
        />

        <TextInput
          title="Uppercase Result"
          value={convertedText}
          readOnly
          placeholder="Your uppercase text will appear here..."
          minHeight="lg"
          variant="glass"
          fontFamily="mono"
        />
      </InputOutputGrid>

      {/* Ad Space */}
      <AdSpace position="middle" />

      {/* Text Analytics */}
      {inputText && (
        <TextAnalytics stats={stats} mode="inline" className="mt-6" />
      )}

      {/* Universal Converter Actions */}
      <ConverterActions
        onDownload={handleDownload}
        onCopy={handleCopy}
        onClear={handleClear}
        onSwap={handleSwap}
        hasContent={!!inputText.trim()}
        className="mt-8"
      />
    </ToolLayout>
  );
}
