const fs = require('fs');
const path = require('path');

// Tool configurations
const toolConfigs = {
  'italic-text': {
    title: 'Italic Text Converter',
    description: 'Convert your text to italic Unicode characters',
    icon: 'Italic',
    placeholder: 'Type or paste your text here...',
    fileName: 'italic-text.txt',
    layout: 'dual'
  },
  'big-text': {
    title: 'Big Text Converter',
    description: 'Transform your text into large Unicode characters',
    icon: 'Type',
    placeholder: 'Type or paste your text here...',
    fileName: 'big-text.txt',
    layout: 'dual'
  },
  'bubble-text': {
    title: 'Bubble Text Generator',
    description: 'Convert your text to bubble-style Unicode characters',
    icon: 'Circle',
    placeholder: 'Type or paste your text here...',
    fileName: 'bubble-text.txt',
    layout: 'dual'
  },
  'cursed-text': {
    title: 'Cursed Text Generator',
    description: 'Create glitchy, cursed text with Unicode combining characters',
    icon: 'Zap',
    placeholder: 'Type or paste your text here...',
    fileName: 'cursed-text.txt',
    layout: 'dual'
  },
  'facebook-font': {
    title: 'Facebook Font Generator',
    description: 'Create stylish text for Facebook posts and comments',
    icon: 'Type',
    placeholder: 'Type or paste your text here...',
    fileName: 'facebook-font.txt',
    layout: 'dual'
  },
  'invisible-text': {
    title: 'Invisible Text Generator',
    description: 'Create invisible characters and hidden text',
    icon: 'EyeOff',
    placeholder: 'Type or paste your text here...',
    fileName: 'invisible-text.txt',
    layout: 'dual'
  },
  'mirror-text': {
    title: 'Mirror Text Generator',
    description: 'Create mirrored/reversed text effects',
    icon: 'FlipHorizontal',
    placeholder: 'Type or paste your text here...',
    fileName: 'mirror-text.txt',
    layout: 'dual'
  },
  'plain-text': {
    title: 'Plain Text Converter',
    description: 'Strip formatting and convert to plain text',
    icon: 'FileText',
    placeholder: 'Type or paste your text here...',
    fileName: 'plain-text.txt',
    layout: 'dual'
  },
  'remove-line-breaks': {
    title: 'Remove Line Breaks',
    description: 'Remove all line breaks and extra spaces from your text',
    icon: 'Minus',
    placeholder: 'Type or paste your text here...',
    fileName: 'text-without-line-breaks.txt',
    layout: 'dual'
  },
  'remove-text-formatting': {
    title: 'Remove Text Formatting',
    description: 'Strip all formatting from your text',
    icon: 'X',
    placeholder: 'Type or paste your text here...',
    fileName: 'unformatted-text.txt',
    layout: 'dual'
  }
};

function generateMigratedCode(toolName, config) {
  return `'use client';

import { TextToolLayout } from '@/components/tools/TextToolLayout';
import { TextTransformation } from '@/components/tools/TextTransformation';
import { ${config.icon} } from 'lucide-react';

// [CONVERSION_MAP_PLACEHOLDER]

// [CONVERSION_FUNCTION_PLACEHOLDER]

export function ${toolName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}Converter() {
  return (
    <TextToolLayout
      title="${config.title}"
      description="${config.description}"
    >
      <TextTransformation
        transformer={convertText}
        toolConfig={{
          name: '${config.title.replace(' Generator', '').replace(' Converter', '')}',
          icon: ${config.icon},
          placeholder: '${config.placeholder}',
          downloadFileName: '${config.fileName}'
        }}
        layout="${config.layout}"
        textareaSize="xl"
      />
    </TextToolLayout>
  );
}`;
}

// Process each tool
Object.entries(toolConfigs).forEach(([toolName, config]) => {
  console.log(`Generating migration template for: ${toolName}`);
  const code = generateMigratedCode(toolName, config);
  console.log(`\n=== ${toolName} ===\n`);
  console.log(code);
  console.log('\n');
});

console.log('\nMigration templates generated! You need to:');
console.log('1. Copy the conversion map from the original file');
console.log('2. Copy/adapt the conversion function');
console.log('3. Replace the placeholders in the generated code');
console.log('4. Save the updated file');