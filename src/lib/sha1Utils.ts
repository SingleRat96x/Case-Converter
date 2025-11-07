import crypto from 'crypto';

/**
 * Generate SHA-1 hash from text
 */
export function generateSHA1Hash(text: string): string {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string');
  }
  
  return crypto.createHash('sha1').update(text, 'utf8').digest('hex');
}

/**
 * Generate SHA-1 hash from file buffer (for file upload)
 */
export function generateSHA1HashFromBuffer(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  const hash = crypto.createHash('sha1');
  hash.update(uint8Array);
  return hash.digest('hex');
}

/**
 * SHA-1 hash output formats
 */
export interface SHA1HashFormats {
  lowercase: string;
  uppercase: string;
  colonSeparated: string;
  spaceSeparated: string;
}

/**
 * Convert SHA-1 hash to different formats
 */
export function formatSHA1Hash(hash: string): SHA1HashFormats {
  const lowercase = hash.toLowerCase();
  const uppercase = hash.toUpperCase();
  
  // Add colons every 2 characters
  const colonSeparated = lowercase.replace(/(.{2})/g, '$1:').slice(0, -1);
  
  // Add spaces every 2 characters
  const spaceSeparated = lowercase.replace(/(.{2})/g, '$1 ').trim();
  
  return {
    lowercase,
    uppercase,
    colonSeparated,
    spaceSeparated
  };
}

/**
 * Validate if a string is a valid SHA-1 hash
 */
export function isValidSHA1Hash(hash: string): boolean {
  const sha1Regex = /^[a-fA-F0-9]{40}$/;
  return sha1Regex.test(hash);
}

/**
 * Calculate SHA-1 hash analytics
 */
export interface SHA1Analytics {
  inputLength: number;
  hashLength: number;
  isValidHash: boolean;
  encoding: string;
}

export function calculateSHA1Analytics(input: string, hash: string): SHA1Analytics {
  return {
    inputLength: input.length,
    hashLength: hash.length,
    isValidHash: isValidSHA1Hash(hash),
    encoding: 'UTF-8'
  };
}

/**
 * Build SHA-1 hash report for download
 */
export function buildSHA1Report(
  input: string, 
  hash: string, 
  formats: SHA1HashFormats,
  analytics: SHA1Analytics,
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

Security Notice:
SHA-1 is no longer recommended for cryptographic security.
For secure applications, use SHA-256 or SHA-512 instead.

${baseUrl ? `Generated with: ${baseUrl}/tools/sha1-hash-generator` : ''}
`;
}

/**
 * Generate sample SHA-1 hashes for examples
 */
export const SHA1_EXAMPLES = [
  {
    input: 'Hello World',
    output: '0a4d55a8d778e5022fab701977c5d840bbc486d0'
  },
  {
    input: 'The quick brown fox jumps over the lazy dog',
    output: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12'
  },
  {
    input: 'password123',
    output: 'cbfdac6008f9cab4083784cbd1874f76618d2a97'
  }
];
