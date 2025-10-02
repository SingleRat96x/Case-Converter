/**
 * Phonetic spelling transformation utilities
 * Supports multiple phonetic formats and bidirectional conversion
 */

// International Phonetic Alphabet (IPA) mappings for common English sounds
const IPA_MAPPINGS: Record<string, string> = {
  // Vowels
  'a': 'æ',      // cat
  'e': 'ɛ',      // bed
  'i': 'ɪ',      // bit
  'o': 'ɔ',      // cot
  'u': 'ʊ',      // put
  'ay': 'eɪ',    // day
  'ee': 'i',     // see
  'oo': 'u',     // food
  'ow': 'aʊ',    // how
  'oy': 'ɔɪ',    // boy
  
  // Consonants
  'ch': 'tʃ',    // chair
  'sh': 'ʃ',     // ship
  'th': 'θ',     // think
  'dh': 'ð',     // this
  'ng': 'ŋ',     // sing
  'zh': 'ʒ',     // measure
  'j': 'dʒ',     // jump
};

// Simplified phonetic mappings for easier reading
const SIMPLE_PHONETIC_MAPPINGS: Record<string, string> = {
  // Consonants with pronunciation guides
  'b': 'bee',
  'c': 'see',
  'd': 'dee',
  'f': 'eff',
  'g': 'gee',
  'h': 'aych',
  'j': 'jay',
  'k': 'kay',
  'l': 'ell',
  'm': 'em',
  'n': 'en',
  'p': 'pee',
  'q': 'cue',
  'r': 'ar',
  's': 'ess',
  't': 'tee',
  'v': 'vee',
  'w': 'double-you',
  'x': 'ex',
  'y': 'why',
  'z': 'zee',
  
  // Vowels with pronunciation
  'a': 'ay',
  'e': 'ee',
  'i': 'eye',
  'o': 'oh',
  'u': 'you',
};

// Sound-based phonetic spelling
const SOUND_BASED_MAPPINGS: Record<string, string> = {
  'ph': 'f',     // phone -> fone
  'gh': 'f',     // laugh -> laf
  'ck': 'k',     // back -> bak
  'qu': 'kw',    // quick -> kwik
  'x': 'ks',     // box -> boks
  'c': 'k',      // cat -> kat (when hard c)
  'ch': 'ch',    // chair -> chair
  'sh': 'sh',    // ship -> ship
  'th': 'th',    // think -> think
  'wh': 'w',     // what -> wat
  'wr': 'r',     // write -> rite
  'kn': 'n',     // know -> no
  'gn': 'n',     // design -> dezin
};

export type PhoneticFormat = 'ipa' | 'simple' | 'sound-based' | 'nato';

/**
 * Convert text to phonetic spelling based on format
 */
export function toPhoneticSpelling(text: string, format: PhoneticFormat = 'simple'): string {
  if (!text.trim()) return '';

  switch (format) {
    case 'ipa':
      return convertToIPA(text);
    case 'simple':
      return convertToSimplePhonetic(text);
    case 'sound-based':
      return convertToSoundBased(text);
    case 'nato':
      return convertToNATO(text);
    default:
      return convertToSimplePhonetic(text);
  }
}

/**
 * Convert phonetic spelling back to regular text (best effort)
 */
export function fromPhoneticSpelling(phoneticText: string, format: PhoneticFormat = 'simple'): string {
  if (!phoneticText.trim()) return '';

  switch (format) {
    case 'ipa':
      return convertFromIPA(phoneticText);
    case 'simple':
      return convertFromSimplePhonetic(phoneticText);
    case 'sound-based':
      return convertFromSoundBased(phoneticText);
    case 'nato':
      return convertFromNATO(phoneticText);
    default:
      return convertFromSimplePhonetic(phoneticText);
  }
}

/**
 * Convert to IPA (International Phonetic Alphabet)
 */
function convertToIPA(text: string): string {
  let result = text.toLowerCase();
  
  // Apply IPA mappings (longer patterns first)
  const sortedKeys = Object.keys(IPA_MAPPINGS).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    const regex = new RegExp(key, 'g');
    result = result.replace(regex, IPA_MAPPINGS[key]);
  }
  
  return result;
}

/**
 * Convert from IPA back to text (best effort)
 */
function convertFromIPA(ipaText: string): string {
  let result = ipaText;
  
  // Reverse IPA mappings
  const reverseMapping = Object.fromEntries(
    Object.entries(IPA_MAPPINGS).map(([key, value]) => [value, key])
  );
  
  for (const [ipaSymbol, text] of Object.entries(reverseMapping)) {
    const regex = new RegExp(ipaSymbol, 'g');
    result = result.replace(regex, text);
  }
  
  return result;
}

/**
 * Convert to simple phonetic (letter pronunciation)
 */
function convertToSimplePhonetic(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map(char => {
      if (/[a-z]/.test(char)) {
        return SIMPLE_PHONETIC_MAPPINGS[char] || char;
      }
      return char; // Keep punctuation and spaces
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convert from simple phonetic back to text
 */
function convertFromSimplePhonetic(phoneticText: string): string {
  const reverseMapping = Object.fromEntries(
    Object.entries(SIMPLE_PHONETIC_MAPPINGS).map(([key, value]) => [value, key])
  );
  
  const words = phoneticText.toLowerCase().split(/\s+/);
  return words
    .map(word => reverseMapping[word] || word)
    .join('')
    .replace(/[^a-z\s.,!?;:'"()-]/g, ''); // Clean up
}

/**
 * Convert to sound-based spelling
 */
function convertToSoundBased(text: string): string {
  let result = text.toLowerCase();
  
  // Apply sound-based mappings (longer patterns first)
  const sortedKeys = Object.keys(SOUND_BASED_MAPPINGS).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    const regex = new RegExp(key, 'g');
    result = result.replace(regex, SOUND_BASED_MAPPINGS[key]);
  }
  
  return result;
}

/**
 * Convert from sound-based spelling back to text (partial)
 */
function convertFromSoundBased(soundText: string): string {
  let result = soundText;
  
  // This is approximate - sound-based conversion is lossy
  const reverseMapping: Record<string, string> = {
    'f': 'ph',    // fone -> phone (sometimes)
    'k': 'c',     // kat -> cat (sometimes)
    'ks': 'x',    // boks -> box
    'kw': 'qu',   // kwik -> quick
  };
  
  for (const [sound, spelling] of Object.entries(reverseMapping)) {
    const regex = new RegExp(sound, 'g');
    result = result.replace(regex, spelling);
  }
  
  return result;
}

/**
 * Convert to NATO phonetic alphabet
 */
function convertToNATO(text: string): string {
  const natoAlphabet: Record<string, string> = {
    'a': 'Alpha', 'b': 'Bravo', 'c': 'Charlie', 'd': 'Delta',
    'e': 'Echo', 'f': 'Foxtrot', 'g': 'Golf', 'h': 'Hotel',
    'i': 'India', 'j': 'Juliet', 'k': 'Kilo', 'l': 'Lima',
    'm': 'Mike', 'n': 'November', 'o': 'Oscar', 'p': 'Papa',
    'q': 'Quebec', 'r': 'Romeo', 's': 'Sierra', 't': 'Tango',
    'u': 'Uniform', 'v': 'Victor', 'w': 'Whiskey', 'x': 'X-ray',
    'y': 'Yankee', 'z': 'Zulu',
    '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three',
    '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven',
    '8': 'Eight', '9': 'Nine'
  };
  
  return text
    .toLowerCase()
    .split('')
    .map(char => {
      if (/[a-z0-9]/.test(char)) {
        return natoAlphabet[char] || char;
      }
      return char === ' ' ? ' / ' : char;
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convert from NATO phonetic back to text
 */
function convertFromNATO(natoText: string): string {
  const reverseNato: Record<string, string> = {
    'alpha': 'a', 'bravo': 'b', 'charlie': 'c', 'delta': 'd',
    'echo': 'e', 'foxtrot': 'f', 'golf': 'g', 'hotel': 'h',
    'india': 'i', 'juliet': 'j', 'kilo': 'k', 'lima': 'l',
    'mike': 'm', 'november': 'n', 'oscar': 'o', 'papa': 'p',
    'quebec': 'q', 'romeo': 'r', 'sierra': 's', 'tango': 't',
    'uniform': 'u', 'victor': 'v', 'whiskey': 'w', 'x-ray': 'x',
    'yankee': 'y', 'zulu': 'z',
    'zero': '0', 'one': '1', 'two': '2', 'three': '3',
    'four': '4', 'five': '5', 'six': '6', 'seven': '7',
    'eight': '8', 'nine': '9'
  };
  
  return natoText
    .toLowerCase()
    .split(/\s+/)
    .map(word => {
      const cleaned = word.replace(/[^a-z-]/g, '');
      return reverseNato[cleaned] || (word === '/' ? ' ' : '');
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get phonetic format display name
 */
export function getPhoneticFormatName(format: PhoneticFormat): string {
  switch (format) {
    case 'ipa':
      return 'IPA (International Phonetic Alphabet)';
    case 'simple':
      return 'Simple Phonetic (Letter Names)';
    case 'sound-based':
      return 'Sound-Based Spelling';
    case 'nato':
      return 'NATO Phonetic Alphabet';
    default:
      return 'Simple Phonetic';
  }
}

/**
 * Validate if text appears to be in a specific phonetic format
 */
export function detectPhoneticFormat(text: string): PhoneticFormat | null {
  const lowerText = text.toLowerCase();
  
  // Check for NATO words
  const natoWords = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot'];
  if (natoWords.some(word => lowerText.includes(word))) {
    return 'nato';
  }
  
  // Check for IPA symbols
  if (/[æɛɪɔʊeɪiuaʊɔɪtʃʃθðŋʒdʒ]/.test(text)) {
    return 'ipa';
  }
  
  // Check for simple phonetic (letter names)
  const simpleWords = ['bee', 'see', 'dee', 'double-you', 'why'];
  if (simpleWords.some(word => lowerText.includes(word))) {
    return 'simple';
  }
  
  return null;
}