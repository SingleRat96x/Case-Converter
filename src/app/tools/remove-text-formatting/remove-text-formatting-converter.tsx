'use client';

import { TextToolLayout } from '@/components/tools/TextToolLayout';
import { TextTransformation } from '@/components/tools/TextTransformation';
import { X } from 'lucide-react';

const removeTextFormatting = (text: string) => {
  // Remove HTML tags
  let cleanText = text.replace(/<[^>]*>/g, '');
  
  // Convert HTML entities
  cleanText = cleanText
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&hellip;/g, '...')
    .replace(/&[^;]+;/g, ''); // Remove any remaining HTML entities
  
  // Convert Unicode fancy quotes and dashes to plain ASCII
  cleanText = cleanText
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[‒–—―]/g, '-')
    .replace(/…/g, '...');
  
  // Remove zero-width characters
  cleanText = cleanText.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // Normalize whitespace
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  return cleanText;
};

export function RemoveTextFormattingConverter() {
  return (
    <TextToolLayout
      title="Remove Text Formatting"
      description="Strip all formatting from your text"
    >
      <TextTransformation
        transformer={removeTextFormatting}
        toolConfig={{
          name: 'Remove Formatting',
          icon: X,
          placeholder: 'Type or paste your formatted text here...',
          downloadFileName: 'unformatted-text.txt'
        }}
        layout="dual"
        textareaSize="xl"
      />
    </TextToolLayout>
  );
} 