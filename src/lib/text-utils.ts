export interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
}

export function calculateTextStatistics(text: string): TextStats {
  return {
    characters: text.length,
    words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
    sentences:
      text.trim() === ''
        ? 0
        : text
            .trim()
            .split(/[.!?]+/)
            .filter(Boolean).length,
    paragraphs:
      text.trim() === ''
        ? 0
        : text
            .trim()
            .split(/\n\s*\n/)
            .filter(Boolean).length,
    lines: text.trim() === '' ? 0 : text.trim().split('\n').length,
  };
}
