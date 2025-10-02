/**
 * NATO Phonetic Alphabet utility functions
 * Provides conversion between text and NATO phonetic alphabet
 */

// NATO Phonetic Alphabet mapping
export const NATO_PHONETIC_ALPHABET: Record<string, string> = {
  'A': 'Alpha',
  'B': 'Bravo', 
  'C': 'Charlie',
  'D': 'Delta',
  'E': 'Echo',
  'F': 'Foxtrot',
  'G': 'Golf',
  'H': 'Hotel',
  'I': 'India',
  'J': 'Juliet',
  'K': 'Kilo',
  'L': 'Lima',
  'M': 'Mike',
  'N': 'November',
  'O': 'Oscar',
  'P': 'Papa',
  'Q': 'Quebec',
  'R': 'Romeo',
  'S': 'Sierra',
  'T': 'Tango',
  'U': 'Uniform',
  'V': 'Victor',
  'W': 'Whiskey',
  'X': 'X-ray',
  'Y': 'Yankee',
  'Z': 'Zulu'
};

// Numbers to phonetic mapping
export const NATO_PHONETIC_NUMBERS: Record<string, string> = {
  '0': 'Zero',
  '1': 'One',
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
  '6': 'Six',
  '7': 'Seven',
  '8': 'Eight',
  '9': 'Nine'
};

// Reverse mapping for phonetic to text conversion
export const PHONETIC_TO_LETTER: Record<string, string> = Object.fromEntries(
  Object.entries(NATO_PHONETIC_ALPHABET).map(([letter, phonetic]) => [phonetic.toLowerCase(), letter])
);

export const PHONETIC_TO_NUMBER: Record<string, string> = Object.fromEntries(
  Object.entries(NATO_PHONETIC_NUMBERS).map(([number, phonetic]) => [phonetic.toLowerCase(), number])
);

/**
 * Convert text to NATO phonetic alphabet
 */
export function textToNatoPhonetic(text: string): string {
  if (!text) return '';
  
  const words: string[] = [];
  
  for (const char of text.toUpperCase()) {
    if (NATO_PHONETIC_ALPHABET[char]) {
      words.push(NATO_PHONETIC_ALPHABET[char]);
    } else if (NATO_PHONETIC_NUMBERS[char]) {
      words.push(NATO_PHONETIC_NUMBERS[char]);
    } else if (char === ' ') {
      words.push('[SPACE]');
    } else if (char.match(/[.,;:!?-]/)) {
      words.push(`[${char}]`);
    } else if (char.match(/\s/)) {
      // Handle other whitespace characters
      words.push('[SPACE]');
    } else {
      // For unknown characters, keep them as-is in brackets
      words.push(`[${char}]`);
    }
  }
  
  return words.join(' ');
}

/**
 * Convert NATO phonetic alphabet back to text
 */
export function natoPhoneticToText(phonetic: string): string {
  if (!phonetic) return '';
  
  // Split by spaces and process each word
  const words = phonetic.trim().split(/\s+/);
  const result: string[] = [];
  
  for (const word of words) {
    const cleanWord = word.toLowerCase().trim();
    
    // Handle special cases
    if (cleanWord === '[space]' || cleanWord === 'space') {
      result.push(' ');
    } else if (cleanWord.startsWith('[') && cleanWord.endsWith(']')) {
      // Extract character from brackets
      const char = cleanWord.slice(1, -1);
      result.push(char);
    } else if (PHONETIC_TO_LETTER[cleanWord]) {
      result.push(PHONETIC_TO_LETTER[cleanWord]);
    } else if (PHONETIC_TO_NUMBER[cleanWord]) {
      result.push(PHONETIC_TO_NUMBER[cleanWord]);
    } else {
      // If not recognized, keep original word
      result.push(word);
    }
  }
  
  return result.join('');
}

/**
 * Check if text contains NATO phonetic words
 */
export function isNatoPhoneticText(text: string): boolean {
  if (!text) return false;
  
  const words = text.toLowerCase().split(/\s+/);
  const phoneticWords = Object.values(NATO_PHONETIC_ALPHABET).map(p => p.toLowerCase());
  const numberWords = Object.values(NATO_PHONETIC_NUMBERS).map(p => p.toLowerCase());
  const allPhoneticWords = [...phoneticWords, ...numberWords, 'space'];
  
  // Consider it phonetic if at least 50% of recognizable words are phonetic words
  const recognizableWords = words.filter(word => 
    allPhoneticWords.includes(word) || word.startsWith('[')
  );
  
  return recognizableWords.length >= Math.max(1, words.length * 0.5);
}

/**
 * Get NATO phonetic alphabet as array for display
 */
export function getNatoPhoneticAlphabet(): Array<{ letter: string; phonetic: string }> {
  return Object.entries(NATO_PHONETIC_ALPHABET).map(([letter, phonetic]) => ({
    letter,
    phonetic
  }));
}

/**
 * Get NATO phonetic numbers as array for display
 */
export function getNatoPhoneticNumbers(): Array<{ number: string; phonetic: string }> {
  return Object.entries(NATO_PHONETIC_NUMBERS).map(([number, phonetic]) => ({
    number,
    phonetic
  }));
}

/**
 * Format NATO phonetic text for better readability
 */
export function formatPhoneticText(phonetic: string): string {
  if (!phonetic) return '';
  
  return phonetic
    .replace(/\[SPACE\]/g, ' ')
    .replace(/\[(.)\]/g, '$1')
    .trim();
}

/**
 * Validate if input can be converted to NATO phonetic
 */
export function canConvertToPhonetic(text: string): boolean {
  if (!text) return false;
  
  // Check if text contains at least one convertible character
  return /[a-zA-Z0-9]/.test(text);
}

/**
 * Get conversion statistics
 */
export function getConversionStats(originalText: string, convertedText: string) {
  const originalLength = originalText.length;
  const convertedLength = convertedText.length;
  const wordCount = convertedText.split(/\s+/).filter(word => word.length > 0).length;
  
  return {
    originalLength,
    convertedLength,
    wordCount,
    compressionRatio: originalLength > 0 ? (convertedLength / originalLength).toFixed(2) : '0'
  };
}