'use client';

import { TextToolLayout } from '@/components/tools/TextToolLayout';
import { TextTransformation } from '@/components/tools/TextTransformation';
import { FlipHorizontal } from 'lucide-react';

const mirrorTextMap: { [key: string]: string } = {
  'a': 'ɒ', 'b': 'd', 'c': 'ɔ', 'd': 'b', 'e': 'ɘ', 'f': 'Ꮈ', 'g': 'ǫ', 'h': 'ʜ', 'i': 'i',
  'j': 'į', 'k': 'ʞ', 'l': '|', 'm': 'm', 'n': 'n', 'o': 'o', 'p': 'q', 'q': 'p', 'r': 'ɿ',
  's': 'ƨ', 't': 'ƚ', 'u': 'u', 'v': 'v', 'w': 'w', 'x': 'x', 'y': 'y', 'z': 'z',
  'A': 'A', 'B': 'ᙠ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'ꟻ', 'G': 'Ꭾ', 'H': 'H', 'I': 'I',
  'J': 'Ⴑ', 'K': 'ꓘ', 'L': '⅃', 'M': 'M', 'N': 'И', 'O': 'O', 'P': 'ꟼ', 'Q': 'Ọ', 'R': 'Я',
  'S': 'Ƨ', 'T': 'T', 'U': 'U', 'V': 'V', 'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Z',
  '1': '1', '2': '2', '3': 'Ɛ', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '0': '0',
  '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<',
  '?': '⸮', '!': '¡', '.': '.', ',': ',', ';': ';', ':': ':', '"': '"', "'": "'", '`': '`',
  '\\': '/', '/': '\\', '|': '|', '_': '_', '+': '+', '-': '-', '=': '=', '*': '*', '&': '⅋',
  '%': '%', '$': '$', '#': '#', '@': '@', '^': '^', '~': '~'
};

const convertToMirrorText = (text: string) => {
  return text.split('').map(char => mirrorTextMap[char] || char).join('').split('').reverse().join('');
};

export function MirrorTextConverter() {
  return (
    <TextTransformation
      transformer={convertToMirrorText}
      toolConfig={{
        name: 'Mirror Text',
        icon: FlipHorizontal,
        placeholder: 'Type or paste your text here...',
        downloadFileName: 'mirror-text.txt'
      }}
      layout="dual"
      textareaSize="xl"
    />
  );
} 