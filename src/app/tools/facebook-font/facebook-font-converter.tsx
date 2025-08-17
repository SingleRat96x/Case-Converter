'use client';

import { TextToolLayout } from '@/components/tools/TextToolLayout';
import { TextTransformation } from '@/components/tools/TextTransformation';
import { Type } from 'lucide-react';

const facebookFontMap: { [key: string]: string } = {
  'a': '𝖺', 'b': '𝖻', 'c': '𝖼', 'd': '𝖽', 'e': '𝖾', 'f': '𝖿', 'g': '𝗀', 'h': '𝗁', 'i': '𝗂',
  'j': '𝗃', 'k': '𝗄', 'l': '𝗅', 'm': '𝗆', 'n': '𝗇', 'o': '𝗈', 'p': '𝗉', 'q': '𝗊', 'r': '𝗋',
  's': '𝗌', 't': '𝗍', 'u': '𝗎', 'v': '𝗏', 'w': '𝗐', 'x': '𝗑', 'y': '𝗒', 'z': '𝗓',
  'A': '𝖠', 'B': '𝖡', 'C': '𝖢', 'D': '𝖣', 'E': '𝖤', 'F': '𝖥', 'G': '𝖦', 'H': '𝖧', 'I': '𝖨',
  'J': '𝖩', 'K': '𝖪', 'L': '𝖫', 'M': '𝖬', 'N': '𝖭', 'O': '𝖮', 'P': '𝖯', 'Q': '𝖰', 'R': '𝖱',
  'S': '𝖲', 'T': '𝖳', 'U': '𝖴', 'V': '𝖵', 'W': '𝖶', 'X': '𝖷', 'Y': '𝖸', 'Z': '𝖹',
  '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
};

const convertToFacebookFont = (text: string) => {
  return text.split('').map(char => facebookFontMap[char] || char).join('');
};

export function FacebookFontConverter() {
  return (
    <TextToolLayout
      title="Facebook Font Generator"
      description="Create stylish text for Facebook posts and comments"
    >
      <TextTransformation
        transformer={convertToFacebookFont}
        toolConfig={{
          name: 'Facebook Font',
          icon: Type,
          placeholder: 'Type or paste your text here...',
          downloadFileName: 'facebook-font.txt'
        }}
        layout="dual"
        textareaSize="xl"
      />
    </TextToolLayout>
  );
} 