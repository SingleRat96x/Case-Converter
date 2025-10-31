/**
 * Snake Case Conversion Utilities
 * Handles text, JSON, and CSV conversions with advanced options
 */

export type ConversionMode = 'camel-to-snake' | 'pascal-to-snake' | 'kebab-to-snake' | 'title-to-snake' | 'reverse';
export type OutputStyle = 'lower_snake_case' | 'UPPER_SNAKE_CASE';

export interface SnakeCaseOptions {
  mode: ConversionMode | null;
  outputStyle: OutputStyle;
  preserveAcronyms: boolean;
  safeCharsOnly: boolean;
  trimWhitespace: boolean;
  convertKeysOnly?: boolean;
  excludePaths?: string[];
  prettyPrint?: boolean;
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
 * Convert camelCase to snake_case
 * Examples: userName → user_name, userID → user_id, XMLHttpRequest → xml_http_request
 */
function camelToSnake(text: string, options: SnakeCaseOptions): string {
  if (!text) return text;
  
  let result = text;
  
  // Handle acronyms: XMLHttp → XML_Http
  result = result.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2');
  
  // Handle normal case: userName → user_Name
  result = result.replace(/([a-z\d])([A-Z])/g, '$1_$2');
  
  // Convert to appropriate case
  if (options.outputStyle === 'UPPER_SNAKE_CASE') {
    result = result.toUpperCase();
  } else {
    result = result.toLowerCase();
  }
  
  return result;
}

/**
 * Convert PascalCase to snake_case
 * Examples: UserName → user_name, OrderTotal → order_total
 */
function pascalToSnake(text: string, options: SnakeCaseOptions): string {
  // PascalCase is essentially camelCase with uppercase first letter
  return camelToSnake(text, options);
}

/**
 * Convert kebab-case to snake_case
 * Examples: user-name → user_name, order-total → order_total
 */
function kebabToSnake(text: string, options: SnakeCaseOptions): string {
  const result = text.replace(/-/g, '_');
  
  if (options.outputStyle === 'UPPER_SNAKE_CASE') {
    return result.toUpperCase();
  }
  return result.toLowerCase();
}

/**
 * Convert Title Case or spaces to snake_case
 * Examples: "User Name" → user_name, "Display Name" → display_name
 */
function titleToSnake(text: string, options: SnakeCaseOptions): string {
  // Replace spaces with underscores and convert
  let result = text.replace(/\s+/g, '_');
  
  // Handle any camelCase within the text
  result = result.replace(/([a-z])([A-Z])/g, '$1_$2');
  
  // Clean up multiple underscores
  result = result.replace(/_+/g, '_');
  
  if (options.outputStyle === 'UPPER_SNAKE_CASE') {
    return result.toUpperCase();
  }
  return result.toLowerCase();
}

/**
 * Reverse: snake_case to camelCase
 * Examples: user_name → userName, api_key → apiKey
 */
function snakeToCamel(text: string): string {
  return text.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Main text conversion function
 */
export function convertTextToSnakeCase(text: string, options: SnakeCaseOptions): string {
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
    case 'camel-to-snake':
      result = camelToSnake(result, options);
      break;
    case 'pascal-to-snake':
      result = pascalToSnake(result, options);
      break;
    case 'kebab-to-snake':
      result = kebabToSnake(result, options);
      break;
    case 'title-to-snake':
      result = titleToSnake(result, options);
      break;
    case 'reverse':
      result = snakeToCamel(result);
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
 * Recursively convert JSON object keys to snake_case
 */
export function convertJsonKeys(
  obj: unknown,
  options: SnakeCaseOptions,
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
      let newKey = key;
      if (!shouldExclude) {
        // Auto-detect the format and convert
        if (key.includes('_')) {
          // Already snake_case
          newKey = options.outputStyle === 'UPPER_SNAKE_CASE' ? key.toUpperCase() : key.toLowerCase();
        } else if (key.includes('-')) {
          // kebab-case
          newKey = convertTextToSnakeCase(key, { ...options, mode: 'kebab-to-snake' });
        } else if (/[A-Z]/.test(key)) {
          // Likely camelCase or PascalCase
          newKey = convertTextToSnakeCase(key, { ...options, mode: 'camel-to-snake' });
        } else {
          // All lowercase or other format
          newKey = key;
        }
      }
      
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
  
  // Primitive values - return as-is
  return obj;
}

/**
 * Convert CSV headers to snake_case
 */
export function convertCsvHeaders(csv: string, options: SnakeCaseOptions): string {
  const lines = csv.split('\n');
  if (lines.length === 0) return csv;
  
  // Process header row
  const headers = lines[0].split(',').map(header => 
    convertTextToSnakeCase(header.trim(), options)
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
      const position = parseInt(positionMatch[1]);
      const { line, column } = getLineColumnFromPosition(text, position);
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
  return text.length > 200000; // 200KB threshold
}
