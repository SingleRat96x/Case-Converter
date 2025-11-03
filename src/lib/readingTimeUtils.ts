/**
 * Reading Time Estimation Utilities
 * 
 * Provides functions for calculating reading time estimates based on word count
 * and reading speed (words per minute).
 */

export interface ReadingTimeResult {
  minutes: number;
  seconds: number;
  totalMinutes: number;
  wordCount: number;
  range: {
    min: number;
    max: number;
  };
  outLoudMinutes: number;
}

export interface ReadingSpeedPreset {
  id: string;
  wpm: number;
  label: string;
}

/**
 * Predefined reading speed presets
 */
export const READING_SPEED_PRESETS: ReadingSpeedPreset[] = [
  { id: 'average', wpm: 200, label: 'Average reading – 200 wpm (articles, blog posts)' },
  { id: 'fast', wpm: 250, label: 'Fast reading – 250 wpm' },
  { id: 'slow', wpm: 150, label: 'Slow/technical reading – 150 wpm (technical documentation)' },
  { id: 'outloud', wpm: 120, label: 'Out-loud reading – 120 wpm (presentations, speeches)' },
];

export const DEFAULT_WPM = 200;
export const OUT_LOUD_WPM = 120;

/**
 * Calculate reading time based on word count and reading speed
 */
export function calculateReadingTime(wordCount: number, wpm: number = DEFAULT_WPM): ReadingTimeResult {
  if (wordCount <= 0 || wpm <= 0) {
    return {
      minutes: 0,
      seconds: 0,
      totalMinutes: 0,
      wordCount: 0,
      range: { min: 0, max: 0 },
      outLoudMinutes: 0,
    };
  }

  // Calculate base reading time
  const totalMinutes = wordCount / wpm;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);

  // Calculate range (±15% variation)
  const minMinutes = Math.floor(wordCount / (wpm * 1.15));
  const maxMinutes = Math.ceil(wordCount / (wpm * 0.85));

  // Calculate out-loud time
  const outLoudMinutes = Math.ceil(wordCount / OUT_LOUD_WPM);

  return {
    minutes,
    seconds,
    totalMinutes,
    wordCount,
    range: {
      min: minMinutes,
      max: maxMinutes,
    },
    outLoudMinutes,
  };
}

/**
 * Extract word count from plain text
 */
export function extractWordCountFromText(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  // Match words using Unicode-aware regex
  // Matches sequences of letters and numbers across all languages
  const words = text.match(/[\p{L}\p{N}]+/gu);
  return words ? words.length : 0;
}

/**
 * Extract word count from JSON data
 */
export function extractWordCountFromJSON(
  jsonString: string,
  keys?: string[]
): { wordCount: number; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    let extractedText = '';

    if (keys && keys.length > 0) {
      // Extract from specified keys
      extractedText = extractTextFromKeys(data, keys);
    } else {
      // Auto-detect: try common content keys first
      const commonKeys = ['content', 'text', 'body', 'description', 'message', 'article', 'post'];
      extractedText = extractTextFromKeys(data, commonKeys);

      // If no common keys found, extract all string values
      if (!extractedText.trim()) {
        extractedText = extractAllStrings(data);
      }
    }

    const wordCount = extractWordCountFromText(extractedText);
    
    if (wordCount === 0) {
      return {
        wordCount: 0,
        error: 'No text content found in JSON'
      };
    }

    return { wordCount };
  } catch (error) {
    return {
      wordCount: 0,
      error: error instanceof Error ? error.message : 'Invalid JSON'
    };
  }
}

/**
 * Extract text from specific keys in JSON object
 */
function extractTextFromKeys(obj: unknown, keys: string[]): string {
  const texts: string[] = [];

  function traverse(current: unknown, path: string[] = []): void {
    if (current === null || current === undefined) {
      return;
    }

    if (typeof current === 'string') {
      // Check if current path matches any of the target keys
      const currentKey = path[path.length - 1];
      if (keys.some(key => currentKey?.toLowerCase() === key.toLowerCase())) {
        texts.push(current);
      }
      return;
    }

    if (Array.isArray(current)) {
      current.forEach((item, index) => traverse(item, [...path, `[${index}]`]));
    } else if (typeof current === 'object') {
      Object.entries(current).forEach(([key, value]) => {
        traverse(value, [...path, key]);
      });
    }
  }

  traverse(obj);
  return texts.join(' ');
}

/**
 * Extract all string values from JSON object
 */
function extractAllStrings(obj: unknown): string {
  const strings: string[] = [];

  function traverse(current: unknown): void {
    if (current === null || current === undefined) {
      return;
    }

    if (typeof current === 'string') {
      strings.push(current);
      return;
    }

    if (Array.isArray(current)) {
      current.forEach(traverse);
    } else if (typeof current === 'object') {
      Object.values(current).forEach(traverse);
    }
  }

  traverse(obj);
  return strings.join(' ');
}

/**
 * Format reading time as human-readable string
 */
export function formatReadingTime(minutes: number, seconds: number): string {
  if (minutes === 0 && seconds === 0) {
    return '0 sec';
  }

  if (minutes === 0) {
    return `${seconds} sec`;
  }

  if (seconds === 0) {
    return minutes === 1 ? '1 min' : `${minutes} min`;
  }

  const minText = minutes === 1 ? '1 min' : `${minutes} min`;
  const secText = seconds === 1 ? '1 sec' : `${seconds} sec`;
  return `${minText} ${secText}`;
}

/**
 * Format reading time range as human-readable string
 */
export function formatReadingRange(min: number, max: number): string {
  if (min === max) {
    return min === 1 ? '1 minute' : `${min} minutes`;
  }
  return `${min}–${max} minutes`;
}

/**
 * Generate copyable summary string
 */
export function generateCopyableSummary(result: ReadingTimeResult, wpm: number): string {
  const timeStr = formatReadingTime(result.minutes, result.seconds);
  const rangeStr = formatReadingRange(result.range.min, result.range.max);
  
  let summary = `Estimated reading time: ${timeStr}`;
  
  if (result.wordCount > 0) {
    summary += ` (${result.wordCount} words)`;
  }
  
  summary += `\nReading speed: ${wpm} words per minute`;
  summary += `\nReading time range: ${rangeStr}`;
  
  if (wpm !== OUT_LOUD_WPM) {
    summary += `\nOut loud: about ${result.outLoudMinutes} minute${result.outLoudMinutes === 1 ? '' : 's'}`;
  }
  
  return summary;
}

/**
 * Parse JSON keys from user input
 */
export function parseJSONKeys(input: string): string[] | null {
  if (!input || input.trim().toLowerCase() === 'auto-detect') {
    return null; // null means auto-detect
  }

  try {
    // Try parsing as JSON array
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return parsed.filter(key => typeof key === 'string');
    }
    return [String(parsed)];
  } catch {
    // If not valid JSON, split by comma
    return input
      .split(',')
      .map(key => key.trim())
      .filter(key => key.length > 0);
  }
}

/**
 * Validate JSON string
 */
export function validateJSON(jsonString: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(jsonString);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON'
    };
  }
}
