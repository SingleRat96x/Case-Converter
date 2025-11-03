/**
 * Kebab Case Conversion Utilities
 * Handles bidirectional conversion between kebab-case, camelCase, and snake_case
 * Supports text, JSON, and CSV conversions with advanced options
 */

export type TargetCase = 'kebab-case' | 'camelCase' | 'snake_case';
export type SourceFormat = 'auto' | 'camelCase' | 'snake_case' | 'kebab-case' | 'PascalCase' | 'Title Case';

export interface KebabCaseOptions {
  targetCase: TargetCase;
  sourceFormat: SourceFormat;
  preserveAcronyms: boolean;
  treatDigitsAsBoundaries: boolean;
  lowercaseOutput: boolean;
  convertKeysOnly?: boolean;
  deepTransform?: boolean;
  excludePaths?: string[];
  prettyPrint?: boolean;
}

/**
 * Detect if a word is an acronym (2+ consecutive uppercase letters)
 */
function isAcronym(word: string): boolean {
  return /^[A-Z]{2,}$/.test(word);
}

/**
 * Handle acronym preservation based on target case
 */
function handleAcronym(word: string, targetCase: TargetCase, isFirst: boolean): string {
  if (word.length === 0) return word;
  
  if (targetCase === 'kebab-case') {
    return word.toLowerCase();
  } else if (targetCase === 'snake_case') {
    return word.toLowerCase();
  } else if (targetCase === 'camelCase') {
    if (isFirst) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  return word;
}

/**
 * Normalize diacritics and remove non-ASCII characters
 * Currently unused but kept for potential future safe-char filtering
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _safeCharactersOnly(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\x00-\x7F]/g, ''); // Remove non-ASCII
}

/**
 * Detect source format automatically
 */
export function detectSourceFormat(text: string): SourceFormat {
  if (!text) return 'auto';
  
  // Check for hyphens (kebab-case)
  if (text.includes('-')) return 'kebab-case';
  
  // Check for underscores (snake_case)
  if (text.includes('_')) return 'snake_case';
  
  // Check for uppercase letters (camelCase or PascalCase)
  if (/[A-Z]/.test(text)) {
    // PascalCase starts with uppercase
    if (/^[A-Z]/.test(text)) return 'PascalCase';
    return 'camelCase';
  }
  
  // Check for spaces (Title Case)
  if (/\s/.test(text)) return 'Title Case';
  
  return 'auto';
}

/**
 * Split text into words based on source format
 */
function splitIntoWords(text: string, sourceFormat: SourceFormat, treatDigitsAsBoundaries: boolean): string[] {
  let words: string[] = [];
  
  const detectedFormat = sourceFormat === 'auto' ? detectSourceFormat(text) : sourceFormat;
  
  switch (detectedFormat) {
    case 'kebab-case':
      words = text.split('-').filter(w => w.length > 0);
      break;
    
    case 'snake_case':
      words = text.split('_').filter(w => w.length > 0);
      break;
    
    case 'Title Case':
      words = text.split(/\s+/).filter(w => w.length > 0);
      break;
    
    case 'camelCase':
    case 'PascalCase':
      // Split on uppercase letters, but keep acronyms together
      if (treatDigitsAsBoundaries) {
        words = text.split(/(?=[A-Z])|(?=\d)/).filter(w => w.length > 0);
      } else {
        words = text.split(/(?=[A-Z])/).filter(w => w.length > 0);
      }
      break;
    
    default:
      // Fallback: try to split on any boundary
      words = [text];
  }
  
  // Further split on digits if enabled
  if (treatDigitsAsBoundaries && !['kebab-case', 'snake_case'].includes(detectedFormat)) {
    const newWords: string[] = [];
    for (const word of words) {
      const parts = word.split(/(\d+)/).filter(w => w.length > 0);
      newWords.push(...parts);
    }
    words = newWords;
  }
  
  return words;
}

/**
 * Convert words array to target case
 */
function wordsToTargetCase(words: string[], options: KebabCaseOptions): string {
  const { targetCase, preserveAcronyms, lowercaseOutput } = options;
  
  if (targetCase === 'kebab-case') {
    const processed = words.map(word => {
      if (preserveAcronyms && isAcronym(word)) {
        return lowercaseOutput ? word.toLowerCase() : word;
      }
      return lowercaseOutput ? word.toLowerCase() : word;
    });
    return processed.join('-');
  }
  
  if (targetCase === 'snake_case') {
    const processed = words.map(word => {
      if (preserveAcronyms && isAcronym(word)) {
        return lowercaseOutput ? word.toLowerCase() : word.toUpperCase();
      }
      return lowercaseOutput ? word.toLowerCase() : word;
    });
    return processed.join('_');
  }
  
  if (targetCase === 'camelCase') {
    return words.map((word, idx) => {
      if (preserveAcronyms && isAcronym(word)) {
        return handleAcronym(word, targetCase, idx === 0);
      }
      
      const lower = word.toLowerCase();
      if (idx === 0) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join('');
  }
  
  return words.join('-');
}

/**
 * Main text conversion function
 */
export function convertText(text: string, options: KebabCaseOptions): string {
  if (!text) return text;
  
  const words = splitIntoWords(text, options.sourceFormat, options.treatDigitsAsBoundaries);
  return wordsToTargetCase(words, options);
}

/**
 * Check if we should use a worker for large inputs
 */
export function shouldUseWorker(text: string): boolean {
  return text.length > 200000;
}

/**
 * Validate and parse JSON with detailed error reporting
 */
export function validateAndParseJson(text: string): {
  success: boolean;
  data?: unknown;
  error?: { message: string; line?: number; column?: number };
} {
  try {
    const data = JSON.parse(text);
    return { success: true, data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      const match = error.message.match(/position (\d+)/);
      if (match) {
        const pos = parseInt(match[1], 10);
        const lines = text.substring(0, pos).split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        return {
          success: false,
          error: {
            message: error.message,
            line,
            column
          }
        };
      }
      return {
        success: false,
        error: { message: error.message }
      };
    }
    return {
      success: false,
      error: { message: 'Invalid JSON' }
    };
  }
}

/**
 * Check if a JSONPath should be excluded
 */
function shouldExcludePath(currentPath: string, excludePaths?: string[]): boolean {
  if (!excludePaths || excludePaths.length === 0) return false;
  
  return excludePaths.some(pattern => {
    // Simple wildcard matching
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(currentPath);
  });
}

/**
 * Convert JSON keys recursively
 */
export function convertJsonKeys(
  obj: unknown,
  options: KebabCaseOptions,
  currentPath: string = '$'
): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map((item, index) => 
      convertJsonKeys(item, options, `${currentPath}[${index}]`)
    );
  }
  
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newPath = `${currentPath}.${key}`;
      
      // Convert key unless excluded
      const newKey = shouldExcludePath(newPath, options.excludePaths)
        ? key
        : convertText(key, options);
      
      // Recursively convert value if deepTransform is enabled
      if (options.deepTransform && typeof value === 'object' && value !== null) {
        result[newKey] = convertJsonKeys(value, options, newPath);
      } else if (options.convertKeysOnly) {
        result[newKey] = value;
      } else {
        result[newKey] = value;
      }
    }
    
    return result;
  }
  
  return obj;
}

/**
 * Convert CSV headers (first row)
 */
export function convertCsvHeaders(csv: string, options: KebabCaseOptions): string {
  const lines = csv.split('\n');
  if (lines.length === 0) return csv;
  
  const headers = lines[0].split(',');
  const convertedHeaders = headers.map(header => 
    convertText(header.trim(), options)
  );
  
  lines[0] = convertedHeaders.join(',');
  return lines.join('\n');
}

/**
 * Legacy helper functions for specific conversions
 */
export function camelToKebab(text: string): string {
  return convertText(text, {
    targetCase: 'kebab-case',
    sourceFormat: 'camelCase',
    preserveAcronyms: true,
    treatDigitsAsBoundaries: false,
    lowercaseOutput: true
  });
}

export function snakeToKebab(text: string): string {
  return convertText(text, {
    targetCase: 'kebab-case',
    sourceFormat: 'snake_case',
    preserveAcronyms: true,
    treatDigitsAsBoundaries: false,
    lowercaseOutput: true
  });
}

export function kebabToCamel(text: string): string {
  return convertText(text, {
    targetCase: 'camelCase',
    sourceFormat: 'kebab-case',
    preserveAcronyms: true,
    treatDigitsAsBoundaries: false,
    lowercaseOutput: true
  });
}

export function kebabToSnake(text: string): string {
  return convertText(text, {
    targetCase: 'snake_case',
    sourceFormat: 'kebab-case',
    preserveAcronyms: true,
    treatDigitsAsBoundaries: false,
    lowercaseOutput: true
  });
}

export function pascalToKebab(text: string): string {
  return convertText(text, {
    targetCase: 'kebab-case',
    sourceFormat: 'PascalCase',
    preserveAcronyms: true,
    treatDigitsAsBoundaries: false,
    lowercaseOutput: true
  });
}

export function titleToKebab(text: string): string {
  return convertText(text, {
    targetCase: 'kebab-case',
    sourceFormat: 'Title Case',
    preserveAcronyms: true,
    treatDigitsAsBoundaries: false,
    lowercaseOutput: true
  });
}
