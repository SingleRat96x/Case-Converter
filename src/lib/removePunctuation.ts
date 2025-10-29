/**
 * Remove punctuation from text with smart keep-options
 */

export interface RemovePunctuationOptions {
  keepApostrophes: boolean;
  keepHyphens: boolean;
  keepEmailUrl: boolean;
  keepNumbers: boolean;
  keepLineBreaks: boolean;
  customKeepList: string;
}

export const DEFAULT_OPTIONS: RemovePunctuationOptions = {
  keepApostrophes: true,
  keepHyphens: false,
  keepEmailUrl: true,
  keepNumbers: true,
  keepLineBreaks: true,
  customKeepList: '',
};

/**
 * Unicode punctuation categories (General Category P*)
 * Pc: Connector punctuation (e.g., _)
 * Pd: Dash punctuation (e.g., -)
 * Pe: Close punctuation (e.g., ])
 * Pf: Final punctuation (e.g., »)
 * Pi: Initial punctuation (e.g., «)
 * Po: Other punctuation (e.g., !)
 * Ps: Open punctuation (e.g., [)
 */
const UNICODE_PUNCTUATION_REGEX = /[\p{P}]/gu;

/**
 * ASCII punctuation commonly treated as punctuation
 */
const ASCII_PUNCTUATION_CHARS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

/**
 * Email pattern for preserving email punctuation
 */
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * URL pattern for preserving URL punctuation
 */
const URL_REGEX = /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.(?:com|org|net|edu|gov|mil|int|co|uk|de|fr|jp|au|us|ru|ch|it|nl|se|no|es|info|biz|name|io|ly|app|dev)\b[^\s]*/gi;

/**
 * Apostrophe patterns in contractions
 */
const CONTRACTION_PATTERNS = [
  /\b\w+'\w+\b/g, // Standard contractions like don't, can't, it's
  /\b\w+'\b/g,    // Possessives like John's, cats'
];

/**
 * Hyphen patterns in compound words and slugs
 */
const HYPHEN_PATTERNS = [
  /\b\w+[-_]\w+\b/g, // Compound words like well-being, snake_case
];

/**
 * Remove punctuation from text with configurable options
 */
export function removePunctuation(
  text: string, 
  options: RemovePunctuationOptions = DEFAULT_OPTIONS
): string {
  if (!text) return '';

  let result = text;
  const protectedRanges: Array<{ start: number; end: number; replacement: string }> = [];

  // Step 1: Protect content that should be preserved
  if (options.keepEmailUrl) {
    // Protect emails
    const emails = Array.from(result.matchAll(EMAIL_REGEX));
    emails.forEach((match, index) => {
      if (match.index !== undefined) {
        const placeholder = `__EMAIL_${index}__`;
        protectedRanges.push({
          start: match.index,
          end: match.index + match[0].length,
          replacement: placeholder
        });
      }
    });

    // Protect URLs
    const urls = Array.from(result.matchAll(URL_REGEX));
    urls.forEach((match, index) => {
      if (match.index !== undefined) {
        const placeholder = `__URL_${index}__`;
        protectedRanges.push({
          start: match.index,
          end: match.index + match[0].length,
          replacement: placeholder
        });
      }
    });
  }

  if (options.keepApostrophes) {
    // Protect contractions and possessives
    CONTRACTION_PATTERNS.forEach((pattern, patternIndex) => {
      const matches = Array.from(result.matchAll(pattern));
      matches.forEach((match, index) => {
        if (match.index !== undefined) {
          const placeholder = `__CONTRACTION_${patternIndex}_${index}__`;
          protectedRanges.push({
            start: match.index,
            end: match.index + match[0].length,
            replacement: placeholder
          });
        }
      });
    });
  }

  if (options.keepHyphens) {
    // Protect hyphenated words and underscores
    HYPHEN_PATTERNS.forEach((pattern, patternIndex) => {
      const matches = Array.from(result.matchAll(pattern));
      matches.forEach((match, index) => {
        if (match.index !== undefined) {
          const placeholder = `__HYPHEN_${patternIndex}_${index}__`;
          protectedRanges.push({
            start: match.index,
            end: match.index + match[0].length,
            replacement: placeholder
          });
        }
      });
    });
  }

  // Sort ranges by start position (descending) to replace from end to beginning
  protectedRanges.sort((a, b) => b.start - a.start);

  // Create a map to restore protected content
  const protectionMap = new Map<string, string>();

  // Replace protected content with placeholders
  protectedRanges.forEach(range => {
    const originalText = result.substring(range.start, range.end);
    protectionMap.set(range.replacement, originalText);
    result = result.substring(0, range.start) + range.replacement + result.substring(range.end);
  });

  // Step 2: Create character whitelist
  const customKeepChars = new Set(options.customKeepList.split(''));
  
  // Step 3: Remove punctuation character by character
  result = result.split('').map(char => {
    // Always keep if in custom keep list
    if (customKeepChars.has(char)) {
      return char;
    }

    // Keep numbers if option is enabled
    if (options.keepNumbers && /\d/.test(char)) {
      return char;
    }

    // Keep line breaks if option is enabled
    if (options.keepLineBreaks && /[\r\n]/.test(char)) {
      return char;
    }

    // Keep spaces and letters
    if (/[\s\p{L}]/u.test(char)) {
      return char;
    }

    // Check if character is punctuation
    const isPunctuation = UNICODE_PUNCTUATION_REGEX.test(char) || ASCII_PUNCTUATION_CHARS.includes(char);
    
    return isPunctuation ? '' : char;
  }).join('');

  // Step 4: Restore protected content
  protectionMap.forEach((original, placeholder) => {
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), original);
  });

  // Step 5: Clean up extra spaces (but preserve line breaks if enabled)
  if (options.keepLineBreaks) {
    // Clean up spaces while preserving line structure
    result = result
      .split('\n')
      .map(line => line.replace(/\s+/g, ' ').trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n'); // Limit consecutive line breaks to 2
  } else {
    // Replace all whitespace with single spaces
    result = result.replace(/\s+/g, ' ').trim();
  }

  return result;
}

/**
 * Get statistics about punctuation removal
 */
export interface PunctuationStats {
  originalLength: number;
  resultLength: number;
  charactersRemoved: number;
  reductionPercentage: number;
  punctuationFound: string[];
  protectedElements: {
    emails: number;
    urls: number;
    contractions: number;
    hyphens: number;
  };
}

export function getPunctuationStats(
  originalText: string,
  resultText: string,
  options: RemovePunctuationOptions
): PunctuationStats {
  const originalLength = originalText.length;
  const resultLength = resultText.length;
  const charactersRemoved = originalLength - resultLength;
  const reductionPercentage = originalLength > 0 ? Math.round((charactersRemoved / originalLength) * 100) : 0;

  // Find all punctuation in original text
  const punctuationFound = Array.from(new Set(
    originalText.split('').filter(char => 
      UNICODE_PUNCTUATION_REGEX.test(char) || ASCII_PUNCTUATION_CHARS.includes(char)
    )
  )).sort();

  // Count protected elements
  const emails = options.keepEmailUrl ? (originalText.match(EMAIL_REGEX) || []).length : 0;
  const urls = options.keepEmailUrl ? (originalText.match(URL_REGEX) || []).length : 0;
  
  let contractions = 0;
  if (options.keepApostrophes) {
    CONTRACTION_PATTERNS.forEach(pattern => {
      contractions += (originalText.match(pattern) || []).length;
    });
  }

  let hyphens = 0;
  if (options.keepHyphens) {
    HYPHEN_PATTERNS.forEach(pattern => {
      hyphens += (originalText.match(pattern) || []).length;
    });
  }

  return {
    originalLength,
    resultLength,
    charactersRemoved,
    reductionPercentage,
    punctuationFound,
    protectedElements: {
      emails,
      urls,
      contractions,
      hyphens
    }
  };
}

/**
 * Validate custom keep list for invalid characters
 */
export function validateCustomKeepList(customKeepList: string): { isValid: boolean; invalidChars: string[] } {
  const invalidChars: string[] = [];
  
  // Check for characters that might cause issues
  const problematicChars = ['\n', '\r', '\t'];
  
  for (const char of customKeepList) {
    if (problematicChars.includes(char)) {
      invalidChars.push(char === '\n' ? '\\n' : char === '\r' ? '\\r' : char === '\t' ? '\\t' : char);
    }
  }

  return {
    isValid: invalidChars.length === 0,
    invalidChars
  };
}