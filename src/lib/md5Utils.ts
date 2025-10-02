import crypto from 'crypto';

/**
 * Generate MD5 hash from text
 */
export function generateMD5Hash(text: string): string {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string');
  }
  
  return crypto.createHash('md5').update(text, 'utf8').digest('hex');
}

/**
 * Generate MD5 hash from file buffer (for file upload)
 */
export function generateMD5HashFromBuffer(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  const hash = crypto.createHash('md5');
  hash.update(uint8Array);
  return hash.digest('hex');
}

/**
 * MD5 hash output formats
 */
export interface MD5HashFormats {
  lowercase: string;
  uppercase: string;
  colonSeparated: string;
  spaceSeparated: string;
}

/**
 * Convert MD5 hash to different formats
 */
export function formatMD5Hash(hash: string): MD5HashFormats {
  const lowercase = hash.toLowerCase();
  const uppercase = hash.toUpperCase();
  
  // Add colons every 2 characters: 5d:41:40:2a:bc:4b:2a:76:b9:71:9d:91:10:17:c5:92
  const colonSeparated = lowercase.replace(/(.{2})/g, '$1:').slice(0, -1);
  
  // Add spaces every 2 characters: 5d 41 40 2a bc 4b 2a 76 b9 71 9d 91 10 17 c5 92
  const spaceSeparated = lowercase.replace(/(.{2})/g, '$1 ').trim();
  
  return {
    lowercase,
    uppercase,
    colonSeparated,
    spaceSeparated
  };
}

/**
 * Validate if a string is a valid MD5 hash
 */
export function isValidMD5Hash(hash: string): boolean {
  const md5Regex = /^[a-fA-F0-9]{32}$/;
  return md5Regex.test(hash);
}

/**
 * Calculate MD5 hash analytics
 */
export interface MD5Analytics {
  inputLength: number;
  hashLength: number;
  isValidHash: boolean;
  encoding: string;
}

export function calculateMD5Analytics(input: string, hash: string): MD5Analytics {
  return {
    inputLength: input.length,
    hashLength: hash.length,
    isValidHash: isValidMD5Hash(hash),
    encoding: 'UTF-8'
  };
}

/**
 * Build MD5 hash report for download
 */
export function buildMD5Report(
  input: string, 
  hash: string, 
  formats: MD5HashFormats,
  analytics: MD5Analytics,
  labels: {
    reportTitle: string;
    generatedAt: string;
    originalText: string;
    hashResults: string;
    analytics: {
      inputLength: string;
      hashLength: string;
      encoding: string;
    };
  },
  baseUrl?: string
): string {
  const timestamp = new Date().toLocaleString();
  
  return `${labels.reportTitle}
${labels.generatedAt}: ${timestamp}

${labels.originalText}:
${input}

${labels.hashResults}:
Standard (lowercase): ${formats.lowercase}
Uppercase: ${formats.uppercase}
Colon-separated: ${formats.colonSeparated}
Space-separated: ${formats.spaceSeparated}

Analytics:
${labels.analytics.inputLength}: ${analytics.inputLength} characters
${labels.analytics.hashLength}: ${analytics.hashLength} characters
${labels.analytics.encoding}: ${analytics.encoding}

${baseUrl ? `Generated with: ${baseUrl}/tools/md5-hash` : ''}
`;
}

/**
 * Generate sample MD5 hashes for examples
 */
export const MD5_EXAMPLES = [
  {
    input: 'Hello World',
    output: 'b10a8db164e0754105b7a99be72e3fe5'
  },
  {
    input: 'The quick brown fox jumps over the lazy dog',
    output: '9e107d9d372bb6826bd81d3542a419d6'
  },
  {
    input: 'password123',
    output: '482c811da5d5b4bc6d497ffa98491e38'
  }
];