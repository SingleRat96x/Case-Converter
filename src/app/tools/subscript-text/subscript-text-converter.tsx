'use client';

import { useState } from 'react';
import { ActionButtons } from '@/components/shared/ActionButtons';
import { UnifiedStats } from '@/components/shared/UnifiedStats';
import { themeClasses, cn } from '@/lib/theme-config';
import { calculateTextStatistics } from '@/lib/text-utils';

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

  const convertToSubscript = (text: string) => {
    return text.toLowerCase().split('').map(char => subscriptMap[char] || char).join('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    setInput(newInput);
    setOutput(convertToSubscript(newInput));
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

  const stats = calculateTextStatistics(output);

  return (
    <div className={cn(themeClasses.container.lg, themeClasses.section.spacing.lg)}>
      {/* Dual Layout */}
      <div className={cn(themeClasses.grid.base, themeClasses.grid.cols[2], themeClasses.grid.gaps.md)}>
        {/* Input */}
        <div className={themeClasses.section.spacing.sm}>
          <label className={themeClasses.label}>Input Text</label>
          <textarea
            className={cn(
              themeClasses.textarea.base,
              themeClasses.textarea.focus,
              themeClasses.textarea.sizes.lg,
              'font-mono'
            )}
            placeholder="Enter text to convert to subscript..."
            value={input}
            onChange={handleInputChange}
            aria-label="Text input for subscript conversion"
          />
        </div>

        {/* Output */}
        <div className={themeClasses.section.spacing.sm}>
          <label className={themeClasses.label}>Subscript Text</label>
          <div
            className={cn(
              themeClasses.textarea.base,
              themeClasses.textarea.sizes.lg,
              'bg-muted cursor-default font-mono break-all whitespace-pre-wrap'
            )}
            aria-label="Subscript text output"
          >
            {output}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={themeClasses.section.spacing.md}>
        <ActionButtons
          onDownload={handleDownload}
          onCopy={handleCopy}
          onClear={handleClear}
          disabled={!output}
        />
      </div>

      {/* Stats Display */}
      <UnifiedStats
        stats={stats}
        variant="cards"
      />
    </div>
  );
} 