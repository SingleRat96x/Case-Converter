'use client';

import { TextToolLayout } from '@/components/tools/TextToolLayout';
import { TextTransformation } from '@/components/tools/TextTransformation';
import { EyeOff } from 'lucide-react';

const invisibleChars = [
  '\u200B', // Zero Width Space
  '\u200C', // Zero Width Non-Joiner
  '\u200D', // Zero Width Joiner
  '\u2060', // Word Joiner
  '\uFEFF', // Zero Width No-Break Space
];

const convertToInvisibleText = (text: string) => {
  return text.split('').map(char => {
    const invisibleChar = invisibleChars[Math.floor(Math.random() * invisibleChars.length)];
    return char + invisibleChar;
  }).join('');
};

export function InvisibleTextConverter() {
  return (
    <TextToolLayout
      title="Invisible Text Generator"
      description="Create invisible characters and hidden text"
    >
      <TextTransformation
        transformer={convertToInvisibleText}
        toolConfig={{
          name: 'Invisible Text',
          icon: EyeOff,
          placeholder: 'Type or paste your text here...',
          downloadFileName: 'invisible-text.txt'
        }}
        layout="dual"
        textareaSize="xl"
      />
    </TextToolLayout>
  );
} 