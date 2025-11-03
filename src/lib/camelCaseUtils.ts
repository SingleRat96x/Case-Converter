/**
 * Camel Case Conversion Utilities
 * Handles text, JSON, and CSV conversions with advanced options
 */

export type ConversionMode = 'snake-to-camel' | 'kebab-to-camel' | 'title-to-camel' | 'reverse';
export type CaseStyle = 'camelCase' | 'PascalCase';

export interface CamelCaseOptions {
  mode: ConversionMode | null;
  caseStyle: CaseStyle;
  preserveAcronyms: boolean;
  safeCharsOnly: boolean;
  trimWhitespace: boolean;
  convertKeysOnly?: boolean;
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
 * Preserve acronyms by keeping them uppercase but adjusting first letter for camelCase
 */
function handleAcronym(word: string, isFirst: boolean, caseStyle: CaseStyle): string {
  if (word.length === 0) return word;
  
  if (caseStyle === 'PascalCase' || !isFirst) {
    // Keep acronym as-is or with first letter uppercase
    return word.charAt(0).toUpperCase() + word.slice(1).toUpperCase();
  } else {
    // camelCase: first acronym should be lowercase
    return word.toLowerCase();
  }
}

/**
 * Normalize diacritics and remove non-ASCII characters
 */
function safeCharactersOnly(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\x00-\x7F]/g, ''); // Remove non-ASCII
}

/**
 * Convert a single word/identifier to camelCase or PascalCase
 */
function convertWord(word: string, isFirst: boolean, options: CamelCaseOptions): string {
  if (!word) return word;
  
  // Handle acronyms
  if (options.preserveAcronyms && isAcronym(word)) {
    return handleAcronym(word, isFirst, options.caseStyle);
  }
  
  // Standard word conversion
  const lower = word.toLowerCase();
  if (isFirst && options.caseStyle === 'camelCase') {
    return lower;
  }
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/**
 * Convert snake_case to camelCase
 */
function snakeToCamel(text: string, options: CamelCaseOptions): string {
  const words = text.split('_').filter(w => w.length > 0);
  return words.map((word, idx) => convertWord(word, idx === 0, options)).join('');
}

/**
 * Convert kebab-case to camelCase
 */
function kebabToCamel(text: string, options: CamelCaseOptions): string {
  const words = text.split('-').filter(w => w.length > 0);
  return words.map((word, idx) => convertWord(word, idx === 0, options)).join('');
}

/**
 * Convert Title Case or spaces to camelCase
 */
function titleToCamel(text: string, options: CamelCaseOptions): string {
  // Split on whitespace
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return words.map((word, idx) => convertWord(word, idx === 0, options)).join('');
}

/**
 * Reverse: camelCase to snake_case
 */
function camelToSnake(text: string): string {
  return text
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2') // Handle acronyms: XMLHttp -> XML_Http
    .replace(/([a-z\d])([A-Z])/g, '$1_$2') // Handle normal case: userName -> user_Name
    .toLowerCase();
}

/**
 * Main text conversion function
 */
export function convertTextToCamelCase(text: string, options: CamelCaseOptions): string {
  if (!text || !options.mode) return text;
  
  let result = text;
  
  // Apply whitespace trimming
  if (options.trimWhitespace) {
    result = result.trim().replace(/\s+/g, ' ');
  }
  
  // Apply safe characters filter
  if (options.safeCharsOnly) {
    result = safeCharactersOnly(result);
  }
  
  // Apply conversion based on mode
  switch (options.mode) {
    case 'snake-to-camel':
      result = snakeToCamel(result, options);
      break;
    case 'kebab-to-camel':
      result = kebabToCamel(result, options);
      break;
    case 'title-to-camel':
      result = titleToCamel(result, options);
      break;
    case 'reverse':
      result = camelToSnake(result);
      break;
  }
  
  return result;
}

/**
 * Check if a path should be excluded
 */
function shouldExcludePath(path: string, excludePaths: string[]): boolean {
  return excludePaths.some(excludePath => {
    // Simple path matching (exact or wildcard)
    if (excludePath.includes('*')) {
      const pattern = excludePath.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    }
    return path === excludePath || path.startsWith(excludePath + '.');
  });
}

/**
 * Recursively convert JSON object keys to camelCase
 */
export function convertJsonKeys(
  obj: unknown,
  options: CamelCaseOptions,
  currentPath = '$'
): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item, index) => 
      convertJsonKeys(item, options, `${currentPath}[${index}]`)
    );
  }
  
  // Handle objects
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newPath = currentPath === '$' ? `$.${key}` : `${currentPath}.${key}`;
      
      // Check if this path should be excluded
      const shouldExclude = options.excludePaths && 
        shouldExcludePath(newPath, options.excludePaths);
      
      // Convert key or keep original
      const newKey = shouldExclude ? key : convertTextToCamelCase(key, {
        ...options,
        mode: options.mode === 'reverse' ? 'reverse' : 'snake-to-camel' // Auto-detect for JSON
      });
      
      // Recursively process value (or keep as-is if convertKeysOnly)
      if (options.convertKeysOnly) {
        // Only convert keys, keep values unchanged
        result[newKey] = typeof value === 'object' ? 
          convertJsonKeys(value, options, newPath) : 
          value;
      } else {
        result[newKey] = convertJsonKeys(value, options, newPath);
      }
    }
    
    return result;
  }
  
  // Primitive values - return as-is unless we're converting values too
  if (!options.convertKeysOnly && typeof obj === 'string') {
    // Could optionally convert string values here
    return obj;
  }
  
  return obj;
}

/**
 * Convert CSV headers to camelCase
 */
export function convertCsvHeaders(csv: string, options: CamelCaseOptions): string {
  const lines = csv.split('\n');
  if (lines.length === 0) return csv;
  
  // Process header row
  const headers = lines[0].split(',').map(header => 
    convertTextToCamelCase(header.trim(), options)
  );
  
  // Reconstruct CSV
  lines[0] = headers.join(',');
  return lines.join('\n');
}

/**
 * Parse validation error and extract line/column
 */
export function parseValidationError(error: unknown): { 
  message: string; 
  line?: number; 
  column?: number; 
} {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Try to extract position from JSON parse errors
  const positionMatch = errorMessage.match(/position (\d+)/i);
  if (positionMatch && error instanceof Error && error.stack) {
    // This is a simplified version - actual implementation would need the source text
    return {
      message: errorMessage,
      line: undefined,
      column: undefined
    };
  }
  
  // Try to extract line and column from error message
  const lineColMatch = errorMessage.match(/line (\d+).*column (\d+)/i);
  if (lineColMatch) {
    return {
      message: errorMessage,
      line: parseInt(lineColMatch[1]),
      column: parseInt(lineColMatch[2])
    };
  }
  
  return { message: errorMessage };
}

/**
 * Calculate line and column from position in text
 */
export function getLineColumnFromPosition(text: string, position: number): { 
  line: number; 
  column: number; 
} {
  const lines = text.substring(0, position).split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  };
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
    const errorInfo = parseValidationError(error);
    
    // Try to get position for better error reporting
    const positionMatch = error instanceof Error && error.message?.match(/position (\d+)/);
    if (positionMatch) {
      const pos = parseInt(positionMatch[1]);
      const { line, column } = getLineColumnFromPosition(text, pos);
      errorInfo.line = line;
      errorInfo.column = column;
    }
    
    return { 
      success: false, 
      error: errorInfo
    };
  }
}

/**
 * Estimate if input is large enough to warrant worker processing
 */
export function shouldUseWorker(text: string): boolean {
  return text.length > 10000; // 10KB threshold
}
