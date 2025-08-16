'use client';

import { TextToolLayout } from '@/components/tools/TextToolLayout';
import { TextTransformation } from '@/components/tools/TextTransformation';
import { FileText } from 'lucide-react';

const convertToPlainText = (text: string) => {
  // Remove all Unicode formatting characters and special characters
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
    .replace(/[\u2000-\u206F]/g, ' ') // Replace special spaces with regular space
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

export function PlainTextConverter() {
  return (
    <TextToolLayout
      title="Plain Text Converter"
      description="Strip formatting and convert to plain text"
    >
      <TextTransformation
        transformer={convertToPlainText}
        toolConfig={{
          name: 'Plain Text',
          icon: FileText,
          placeholder: 'Type or paste your formatted text here...',
          downloadFileName: 'plain-text.txt'
        }}
        layout="dual"
        textareaSize="xl"
      />
    </TextToolLayout>
  );
} 