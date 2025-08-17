'use client';

import { TextToolLayout } from '@/components/tools/TextToolLayout';
import { TextTransformation } from '@/components/tools/TextTransformation';
import { Minus } from 'lucide-react';

const removeLineBreaks = (text: string) => {
  // Replace all line breaks with spaces and normalize whitespace
  return text
    .replace(/\r\n/g, ' ') // Windows line breaks
    .replace(/\n/g, ' ') // Unix line breaks
    .replace(/\r/g, ' ') // Old Mac line breaks
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .trim();
};

export function RemoveLineBreaksConverter() {
  return (
    <TextTransformation
      transformer={removeLineBreaks}
      toolConfig={{
        name: 'Remove Line Breaks',
        icon: Minus,
        placeholder: 'Type or paste your text with line breaks here...',
        downloadFileName: 'text-without-line-breaks.txt'
      }}
      layout="dual"
      textareaSize="xl"
    />
  );
} 