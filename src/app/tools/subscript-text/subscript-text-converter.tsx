'use client';

import { useState } from 'react';
import AdScript from '@/components/ads/AdScript';
import { TextInput } from '@/app/components/shared/ToolInputs';
import { ActionButtonGroup } from '@/app/components/shared/ToolActions';
import { TextAnalytics, generateTextStats, type TextStats } from '@/app/components/shared/TextAnalytics';

const subscriptMap: { [key: string]: string } = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
  'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
  'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
  'v': 'ᵥ', 'x': 'ₓ'
};

export function SubscriptTextConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState<TextStats>(generateTextStats(''));

  const convertToSubscript = (text: string) => text.toLowerCase().split('').map(char => subscriptMap[char] || char).join('');

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    setInput(newInput);
    setOutput(convertToSubscript(newInput));
    setStats(generateTextStats(newInput));
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

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscript-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <TextInput
          title="Input Text"
          value={input}
          onChange={handleInputChange}
          placeholder="Enter text to convert to subscript..."
          minHeight="lg"
          fontFamily="mono"
          variant="default"
        />
      </div>

      <div>
        <TextInput
          title="Subscript Text"
          value={output}
          readOnly
          minHeight="lg"
          fontFamily="mono"
          variant="glass"
        />
        <ActionButtonGroup
          onDownload={handleDownload}
          onCopy={handleCopy}
          onClear={handleClear}
          className="mt-4"
        />
        <div className="max-w-4xl mx-auto mt-4">
          <TextAnalytics
            stats={stats}
            mode="grid"
            showStats={['characters', 'words', 'sentences', 'lines']}
          />
        </div>
      </div>
      <div className="md:col-span-2">
        <AdScript />
      </div>
    </div>
  );
} 