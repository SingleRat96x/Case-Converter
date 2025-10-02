import { AsciiOptions, ImageToAsciiOptions } from './asciiTransforms';

export const ASCII_FONT_PRESETS = [
  { name: 'Block', value: 'Block' },
  { name: 'Cyberlarge', value: 'Cyberlarge' },
  { name: 'Doom', value: 'Doom' },
  { name: 'Epic', value: 'Epic' },
  { name: 'Gothic', value: 'Gothic' },
  { name: 'Graffiti', value: 'Graffiti' },
  { name: 'Jazmine', value: 'Jazmine' },
  { name: 'Larry 3D', value: 'Larry 3D' },
  { name: 'Lean', value: 'Lean' },
  { name: 'Puffy', value: 'Puffy' },
  { name: 'Rounded', value: 'Rounded' }
];

// Removed alignment options as they're no longer needed

export const IMAGE_ASCII_PRESETS = {
  detailed: {
    name: 'Detailed',
    charset: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
    width: 100,
    contrast: 1.2,
    brightness: 0
  },
  simple: {
    name: 'Simple',
    charset: ' .,:;ox%#@',
    width: 80,
    contrast: 1.0,
    brightness: 0
  },
  blocks: {
    name: 'Blocks',
    charset: ' ░▒▓█',
    width: 60,
    contrast: 1.5,
    brightness: 10
  },
  minimal: {
    name: 'Minimal',
    charset: ' .-=+*#@',
    width: 70,
    contrast: 1.1,
    brightness: 5
  }
};

export const DEFAULT_ASCII_OPTIONS: AsciiOptions = {
  font: 'Block'
};

export const DEFAULT_IMAGE_ASCII_OPTIONS: ImageToAsciiOptions = {
  width: 80,
  charset: ' .,:;ox%#@',
  invert: false,
  contrast: 1.0,
  brightness: 0
};

export function generateAsciiPreview(text: string, font: string): string {
  const previewText = text.slice(0, 10);
  
  return `Preview for "${previewText}" in ${font} font would appear here`;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, GIF, BMP, or WebP image.'
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Please upload an image smaller than 10MB.'
    };
  }
  
  return { valid: true };
}

export function calculateOptimalImageWidth(originalWidth: number, originalHeight: number, maxWidth: number = 120): number {
  if (originalWidth <= maxWidth) {
    return originalWidth;
  }
  
  return Math.min(maxWidth, Math.floor(originalWidth * 0.6));
}

export function formatAsciiOutput(ascii: string, options: { addBorder?: boolean; borderChar?: string }): string {
  if (!options.addBorder) {
    return ascii;
  }
  
  const lines = ascii.split('\n');
  const maxLength = Math.max(...lines.map(line => line.length));
  const border = (options.borderChar || '*').repeat(maxLength + 4);
  
  const borderedLines = [
    border,
    ...lines.map(line => `${options.borderChar || '*'} ${line.padEnd(maxLength)} ${options.borderChar || '*'}`),
    border
  ];
  
  return borderedLines.join('\n');
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch {
        document.body.removeChild(textArea);
        return false;
      }
    });
}

export function downloadAsFile(content: string, filename: string = 'ascii-art.txt'): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function getAsciiStats(ascii: string): {
  lines: number;
  characters: number;
  maxLineLength: number;
  minLineLength: number;
  avgLineLength: number;
} {
  const lines = ascii.split('\n');
  const lineLengths = lines.map(line => line.length);
  
  return {
    lines: lines.length,
    characters: ascii.length,
    maxLineLength: Math.max(...lineLengths),
    minLineLength: Math.min(...lineLengths),
    avgLineLength: Math.round(lineLengths.reduce((sum, len) => sum + len, 0) / lines.length)
  };
}