export interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  [key: string]: number; // Allow additional numeric properties
} 