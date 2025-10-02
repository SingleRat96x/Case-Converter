import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function downloadTextAsFile(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      textArea.remove();
      return Promise.resolve(true);
    } catch {
      textArea.remove();
      return Promise.resolve(false);
    }
  }
}

export function validateTextFile(file: File): boolean {
  return file.type === 'text/plain' || 
         file.name.endsWith('.txt') || 
         file.name.endsWith('.md') ||
         file.name.endsWith('.js') ||
         file.name.endsWith('.ts') ||
         file.name.endsWith('.jsx') ||
         file.name.endsWith('.tsx') ||
         file.name.endsWith('.json') ||
         file.name.endsWith('.css') ||
         file.name.endsWith('.html');
}

export async function validateAndReadTextFile(file: File): Promise<{ isValid: boolean; content?: string }> {
  const isValid = validateTextFile(file);
  if (!isValid) {
    return { isValid: false };
  }
  
  try {
    const content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
    
    return { isValid: true, content };
  } catch {
    return { isValid: false };
  }
}
