/**
 * Pig Latin transformation utilities
 * Supports bidirectional conversion between English and Pig Latin
 */

// Vowels for Pig Latin rules
const VOWELS = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];

// Common consonant clusters that should be moved together
const CONSONANT_CLUSTERS = [
  'bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr',
  'pl', 'pr', 'sc', 'sh', 'sk', 'sl', 'sm', 'sn', 'sp', 'st',
  'sw', 'th', 'tr', 'tw', 'wh', 'wr', 'sch', 'scr', 'shr',
  'spl', 'spr', 'str', 'thr'
];

/**
 * Convert English text to Pig Latin
 */
export function toPigLatin(text: string): string {
  if (!text.trim()) return '';

  return text
    .split(/(\s+|[^\w\s]+)/) // Split on whitespace and punctuation, preserving them
    .map(token => {
      // Only transform words (containing letters)
      if (!/[a-zA-Z]/.test(token)) {
        return token; // Return punctuation and whitespace as-is
      }
      
      return transformWordToPigLatin(token);
    })
    .join('');
}

/**
 * Convert Pig Latin text back to English (best effort)
 */
export function fromPigLatin(text: string): string {
  if (!text.trim()) return '';

  return text
    .split(/(\s+|[^\w\s]+)/) // Split on whitespace and punctuation, preserving them
    .map(token => {
      // Only transform words (containing letters)
      if (!/[a-zA-Z]/.test(token)) {
        return token; // Return punctuation and whitespace as-is
      }
      
      return transformWordFromPigLatin(token);
    })
    .join('');
}

/**
 * Transform a single word to Pig Latin
 */
function transformWordToPigLatin(word: string): string {
  if (!word || word.length === 0) return word;

  // Preserve original capitalization pattern
  const isFirstCapital = /^[A-Z]/.test(word);
  const isAllCaps = word === word.toUpperCase();
  
  const lowerWord = word.toLowerCase();
  let result: string;

  // Rule 1: If word starts with vowel, add "way"
  if (VOWELS.includes(lowerWord[0])) {
    result = lowerWord + 'way';
  } else {
    // Rule 2: Find consonant cluster or single consonant at beginning
    let consonantCluster = '';
    
    // Check for consonant clusters first (longer matches first)
    const sortedClusters = CONSONANT_CLUSTERS.sort((a, b) => b.length - a.length);
    for (const cluster of sortedClusters) {
      if (lowerWord.startsWith(cluster)) {
        consonantCluster = cluster;
        break;
      }
    }
    
    // If no cluster found, take first consonant
    if (!consonantCluster) {
      consonantCluster = lowerWord[0];
    }
    
    // Move consonant cluster to end and add "ay"
    const remainingWord = lowerWord.slice(consonantCluster.length);
    result = remainingWord + consonantCluster + 'ay';
  }

  // Restore capitalization
  if (isAllCaps) {
    return result.toUpperCase();
  } else if (isFirstCapital) {
    return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
  } else {
    return result.toLowerCase();
  }
}

/**
 * Transform a single word from Pig Latin back to English (best effort)
 */
function transformWordFromPigLatin(word: string): string {
  if (!word || word.length === 0) return word;

  // Preserve original capitalization pattern
  const isFirstCapital = /^[A-Z]/.test(word);
  const isAllCaps = word === word.toUpperCase();
  
  const lowerWord = word.toLowerCase();
  let result: string;

  // Rule 1: If word ends with "way", it was originally a vowel word
  if (lowerWord.endsWith('way')) {
    result = lowerWord.slice(0, -3); // Remove "way"
  }
  // Rule 2: If word ends with consonant(s) + "ay"
  else if (lowerWord.endsWith('ay') && lowerWord.length > 2) {
    const withoutAy = lowerWord.slice(0, -2);
    
    // Find where the original consonant cluster might be
    // Try matching known clusters first
    let consonantCluster = '';
    let remainingWord = withoutAy;
    
    for (const cluster of CONSONANT_CLUSTERS.sort((a, b) => b.length - a.length)) {
      if (withoutAy.endsWith(cluster)) {
        consonantCluster = cluster;
        remainingWord = withoutAy.slice(0, -cluster.length);
        break;
      }
    }
    
    // If no cluster found, assume last character is the consonant
    if (!consonantCluster && withoutAy.length > 0) {
      consonantCluster = withoutAy.slice(-1);
      remainingWord = withoutAy.slice(0, -1);
    }
    
    result = consonantCluster + remainingWord;
  } else {
    // Not valid Pig Latin, return as-is
    result = lowerWord;
  }

  // Restore capitalization
  if (isAllCaps) {
    return result.toUpperCase();
  } else if (isFirstCapital) {
    return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
  } else {
    return result.toLowerCase();
  }
}

/**
 * Detect if text appears to be in Pig Latin
 */
export function isPigLatin(text: string): boolean {
  if (!text.trim()) return false;

  const words = text.toLowerCase().split(/\s+/).filter(word => /[a-zA-Z]/.test(word));
  if (words.length === 0) return false;

  let pigLatinWords = 0;
  
  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, ''); // Remove punctuation
    
    // Check for Pig Latin patterns
    if (cleanWord.endsWith('way') || 
        (cleanWord.endsWith('ay') && cleanWord.length > 2)) {
      pigLatinWords++;
    }
  }
  
  // Consider it Pig Latin if more than 50% of words match the pattern
  return (pigLatinWords / words.length) > 0.5;
}

/**
 * Get statistics about Pig Latin conversion
 */
export function getPigLatinStats(originalText: string, pigLatinText: string) {
  const originalWords = originalText.trim() ? originalText.trim().split(/\s+/).filter(word => /[a-zA-Z]/.test(word)) : [];
  const pigLatinWords = pigLatinText.trim() ? pigLatinText.trim().split(/\s+/).filter(word => /[a-zA-Z]/.test(word)) : [];
  
  const originalLength = originalText.length;
  const pigLatinLength = pigLatinText.length;
  const expansionRatio = originalLength > 0 ? (pigLatinLength / originalLength) : 0;
  
  // Count vowel vs consonant words in original
  let vowelWords = 0;
  let consonantWords = 0;
  
  for (const word of originalWords) {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    if (cleanWord.length > 0) {
      if (VOWELS.includes(cleanWord[0])) {
        vowelWords++;
      } else {
        consonantWords++;
      }
    }
  }
  
  return {
    originalLength,
    pigLatinLength,
    originalWordCount: originalWords.length,
    pigLatinWordCount: pigLatinWords.length,
    vowelWords,
    consonantWords,
    expansionRatio: Math.round(expansionRatio * 100) / 100,
    compressionRatio: Math.round(expansionRatio * 10) / 10
  };
}