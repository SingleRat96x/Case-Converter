/**
 * JSON Formatter & Validator Utilities
 * 
 * Provides comprehensive JSON parsing, validation, formatting, and transformation utilities.
 * Supports standard JSON, NDJSON (newline-delimited JSON), and various formatting options.
 */

export interface JsonFormatterOptions {
  indentSize: 2 | 4 | 8 | number;
  sortKeys: boolean;
  unescapeStrings: boolean;
  minify: boolean;
  ndjsonMode: boolean;
}

export interface ValidationError {
  message: string;
  line?: number;
  column?: number;
  position?: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: ValidationError;
  data?: unknown;
}

export interface FormatResult {
  success: boolean;
  formatted?: string;
  error?: ValidationError;
  stats?: {
    keys: number;
    arrays: number;
    objects: number;
    primitives: number;
    size: number;
  };
}

export interface NdjsonResult {
  success: boolean;
  results: FormatResult[];
  validCount: number;
  errorCount: number;
}

/**
 * Parse JSON and extract detailed error information
 */
export function parseJSONWithError(jsonString: string): ValidationResult {
  if (!jsonString || jsonString.trim() === '') {
    return {
      valid: false,
      error: {
        message: 'Input is empty',
        line: 1,
        column: 1
      }
    };
  }

  try {
    const data = JSON.parse(jsonString);
    return {
      valid: true,
      data
    };
  } catch (err) {
    if (err instanceof SyntaxError) {
      // Extract line and column from error message
      const match = err.message.match(/position (\d+)/i) || 
                   err.message.match(/at position (\d+)/i) ||
                   err.message.match(/column (\d+)/i);
      
      let position: number | undefined;
      let line: number | undefined;
      let column: number | undefined;

      if (match && match[1]) {
        position = parseInt(match[1], 10);
        // Calculate line and column from position
        const beforeError = jsonString.substring(0, position);
        const lines = beforeError.split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }

      return {
        valid: false,
        error: {
          message: err.message.replace(/^JSON\.parse: /, '').replace(/^Unexpected /, 'Unexpected '),
          line,
          column,
          position
        }
      };
    }

    return {
      valid: false,
      error: {
        message: err instanceof Error ? err.message : 'Unknown parsing error'
      }
    };
  }
}

/**
 * Sort object keys recursively
 */
function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  } else if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    Object.keys(obj as Record<string, unknown>)
      .sort()
      .forEach(key => {
        sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
      });
    return sorted;
  }
  return obj;
}

/**
 * Unescape JSON strings (convert escape sequences to actual characters)
 */
function unescapeJsonString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\'/g, "'")
    .replace(/\\0/g, '\0');
}

/**
 * Recursively unescape all strings in a JSON structure
 */
function unescapeJsonValues(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return unescapeJsonString(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(unescapeJsonValues);
  } else if (obj !== null && typeof obj === 'object') {
    const unescaped: Record<string, unknown> = {};
    Object.keys(obj as Record<string, unknown>).forEach(key => {
      unescaped[key] = unescapeJsonValues((obj as Record<string, unknown>)[key]);
    });
    return unescaped;
  }
  return obj;
}

/**
 * Calculate statistics about JSON structure
 */
function calculateJsonStats(obj: unknown): FormatResult['stats'] {
  let keys = 0;
  let arrays = 0;
  let objects = 0;
  let primitives = 0;

  function traverse(value: unknown): void {
    if (Array.isArray(value)) {
      arrays++;
      value.forEach(traverse);
    } else if (value !== null && typeof value === 'object') {
      objects++;
      Object.keys(value as Record<string, unknown>).forEach(key => {
        keys++;
        traverse((value as Record<string, unknown>)[key]);
      });
    } else {
      primitives++;
    }
  }

  traverse(obj);

  return {
    keys,
    arrays,
    objects,
    primitives,
    size: JSON.stringify(obj).length
  };
}

/**
 * Format JSON with specified options
 */
export function formatJSON(
  jsonString: string,
  options: JsonFormatterOptions
): FormatResult {
  // Validate input
  const validation = parseJSONWithError(jsonString);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }

  try {
    let data = validation.data;

    // Sort keys if requested
    if (options.sortKeys) {
      data = sortObjectKeys(data);
    }

    // Unescape strings if requested
    if (options.unescapeStrings) {
      data = unescapeJsonValues(data);
    }

    // Format based on minify option
    const indent = options.minify ? 0 : options.indentSize;
    const formatted = JSON.stringify(data, null, indent);

    // Calculate stats
    const stats = calculateJsonStats(data);

    return {
      success: true,
      formatted,
      stats
    };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : 'Formatting error'
      }
    };
  }
}

/**
 * Format NDJSON (newline-delimited JSON)
 * Each line is validated and formatted independently
 */
export function formatNDJSON(
  ndjsonString: string,
  options: JsonFormatterOptions
): NdjsonResult {
  const lines = ndjsonString.split('\n');
  const results: FormatResult[] = [];
  let validCount = 0;
  let errorCount = 0;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (trimmedLine === '') {
      results.push({
        success: true,
        formatted: '',
        stats: {
          keys: 0,
          arrays: 0,
          objects: 0,
          primitives: 0,
          size: 0
        }
      });
      return;
    }

    // Format this line
    const result = formatJSON(trimmedLine, options);
    
    if (result.success) {
      validCount++;
    } else {
      errorCount++;
      // Add line number to error message
      if (result.error) {
        result.error.message = `Line ${index + 1}: ${result.error.message}`;
      }
    }
    
    results.push(result);
  });

  return {
    success: errorCount === 0,
    results,
    validCount,
    errorCount
  };
}

/**
 * Minify JSON (remove all whitespace)
 */
export function minifyJSON(jsonString: string): FormatResult {
  return formatJSON(jsonString, {
    indentSize: 0,
    sortKeys: false,
    unescapeStrings: false,
    minify: true,
    ndjsonMode: false
  });
}

/**
 * Check if input is valid JSON
 */
export function isValidJSON(jsonString: string): boolean {
  const result = parseJSONWithError(jsonString);
  return result.valid;
}

/**
 * Pretty print JSON with default options
 */
export function prettyPrintJSON(jsonString: string, indent = 2): FormatResult {
  return formatJSON(jsonString, {
    indentSize: indent,
    sortKeys: false,
    unescapeStrings: false,
    minify: false,
    ndjsonMode: false
  });
}

/**
 * Check if file size is within acceptable limits
 * @param size File size in bytes
 * @returns true if size is acceptable
 */
export function isFileSizeAcceptable(size: number): boolean {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  return size <= MAX_SIZE;
}

/**
 * Estimate JSON complexity (for performance warnings)
 */
export function estimateComplexity(jsonString: string): 'low' | 'medium' | 'high' {
  const size = jsonString.length;
  
  if (size < 100_000) return 'low';      // < 100KB
  if (size < 1_000_000) return 'medium'; // < 1MB
  return 'high';                          // >= 1MB
}

/**
 * Truncate large JSON for preview
 */
export function truncateForPreview(jsonString: string, maxLength = 50000): string {
  if (jsonString.length <= maxLength) {
    return jsonString;
  }
  return jsonString.substring(0, maxLength) + '\n... (truncated)';
}

/**
 * Clean JSON string (remove comments, trailing commas if possible)
 */
export function cleanJSON(jsonString: string): string {
  // Remove single-line comments
  let cleaned = jsonString.replace(/\/\/.*$/gm, '');
  
  // Remove multi-line comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  
  return cleaned;
}

/**
 * Escape special characters in JSON string values
 */
export function escapeJsonString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\b/g, '\\b')
    .replace(/\f/g, '\\f');
}

/**
 * Convert JSON to compact single-line format
 */
export function compactJSON(jsonString: string): FormatResult {
  const validation = parseJSONWithError(jsonString);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }

  try {
    const formatted = JSON.stringify(validation.data);
    return {
      success: true,
      formatted,
      stats: calculateJsonStats(validation.data)
    };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : 'Compacting error'
      }
    };
  }
}
