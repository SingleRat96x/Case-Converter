import { parseFLFFont, generateAsciiArt, type FLFFont } from './flfParser';

export interface AsciiOptions {
  font: string;
}

export interface ImageToAsciiOptions {
  width: number;
  height?: number;
  charset: string;
  invert: boolean;
  contrast: number;
  brightness: number;
}

export const DEFAULT_CHARSETS = {
  simple: ' .,:;ox%#@',
  extended: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  blocks: ' ░▒▓█',
  minimal: ' .-=+*#@'
};

// Font cache to avoid reloading
const fontCache = new Map<string, FLFFont>();

export async function textToAscii(text: string, options: AsciiOptions): Promise<string> {
  try {
    // Get or load font
    let font = fontCache.get(options.font);
    if (!font) {
      font = await parseFLFFont(options.font);
      fontCache.set(options.font, font);
    }
    
    // Generate ASCII art (simplified - no alignment or width)
    const result = generateAsciiArt(text, font);
    
    return result;
  } catch (error) {
    console.error('Error generating ASCII art:', error);
    return text; // fallback to original text
  }
}

export function imageToAscii(imageData: ImageData, options: ImageToAsciiOptions): string {
  const { width, height = Math.floor(imageData.height * (width / imageData.width) * 0.5), charset, invert, contrast, brightness } = options;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = width;
  canvas.height = height;
  
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCanvas.width = imageData.width;
  tempCanvas.height = imageData.height;
  
  tempCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(tempCanvas, 0, 0, width, height);
  
  const resizedImageData = ctx.getImageData(0, 0, width, height);
  const data = resizedImageData.data;
  
  let result = '';
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      
      let grayscale = (r * 0.299 + g * 0.587 + b * 0.114);
      
      grayscale = Math.max(0, Math.min(255, grayscale * contrast + brightness));
      
      if (invert) {
        grayscale = 255 - grayscale;
      }
      
      const charIndex = Math.floor((grayscale / 255) * (charset.length - 1));
      result += charset[charIndex];
    }
    result += '\n';
  }
  
  return result.trim();
}

export function getAvailableFonts(): string[] {
  return [
    'Block',
    'Cyberlarge',
    'Doom',
    'Epic',
    'Gothic',
    'Graffiti',
    'Jazmine',
    'Larry 3D',
    'Lean',
    'Puffy',
    'Rounded'
  ];
}

export function processImageFile(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          resolve(imageData);
        } catch {
          reject(new Error('Failed to process image data'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}