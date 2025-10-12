export interface HashOptions {
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
  encoding: 'hex' | 'base64' | 'binary';
  uppercase: boolean;
  hmacKey?: string;
}

export interface HashResult {
  hash: string;
  algorithm: string;
  length: number;
  bitLength: number;
  timestamp: Date;
  processingTime: number;
}

export interface HashComparison {
  matches: boolean;
  algorithm: string;
  original: string;
  comparison: string;
}

// Convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer, uppercase: boolean = false): string {
  const byteArray = new Uint8Array(buffer);
  const hexString = Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
  return uppercase ? hexString.toUpperCase() : hexString;
}

// Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  let binary = '';
  byteArray.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

// Convert ArrayBuffer to binary string
function arrayBufferToBinary(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map(byte => byte.toString(2).padStart(8, '0'))
    .join('');
}

// Get algorithm parameters
function getAlgorithmInfo(algorithm: HashOptions['algorithm']) {
  const info = {
    'SHA-1': { name: 'SHA-1', bitLength: 160 },
    'SHA-256': { name: 'SHA-256', bitLength: 256 },
    'SHA-384': { name: 'SHA-384', bitLength: 384 },
    'SHA-512': { name: 'SHA-512', bitLength: 512 },
  };
  return info[algorithm];
}

// Generate SHA hash using Web Crypto API
export async function generateSHAHash(
  input: string,
  options: HashOptions
): Promise<HashResult> {
  const startTime = performance.now();
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const algorithmInfo = getAlgorithmInfo(options.algorithm);
  
  let hashBuffer: ArrayBuffer;
  
  if (options.hmacKey) {
    // Generate HMAC
    const keyData = encoder.encode(options.hmacKey);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: algorithmInfo.name },
      false,
      ['sign']
    );
    hashBuffer = await crypto.subtle.sign('HMAC', key, data);
  } else {
    // Generate regular hash
    hashBuffer = await crypto.subtle.digest(algorithmInfo.name, data);
  }
  
  let hash: string;
  switch (options.encoding) {
    case 'hex':
      hash = arrayBufferToHex(hashBuffer, options.uppercase);
      break;
    case 'base64':
      hash = arrayBufferToBase64(hashBuffer);
      break;
    case 'binary':
      hash = arrayBufferToBinary(hashBuffer);
      break;
    default:
      hash = arrayBufferToHex(hashBuffer, options.uppercase);
  }
  
  const endTime = performance.now();
  
  return {
    hash,
    algorithm: options.algorithm,
    length: hash.length,
    bitLength: algorithmInfo.bitLength,
    timestamp: new Date(),
    processingTime: endTime - startTime,
  };
}

// Generate hash from file
export async function generateSHAHashFromFile(
  file: File,
  options: HashOptions
): Promise<HashResult> {
  const startTime = performance.now();
  const arrayBuffer = await file.arrayBuffer();
  const algorithmInfo = getAlgorithmInfo(options.algorithm);
  
  let hashBuffer: ArrayBuffer;
  
  if (options.hmacKey) {
    // Generate HMAC for file
    const encoder = new TextEncoder();
    const keyData = encoder.encode(options.hmacKey);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: algorithmInfo.name },
      false,
      ['sign']
    );
    hashBuffer = await crypto.subtle.sign('HMAC', key, arrayBuffer);
  } else {
    // Generate regular hash
    hashBuffer = await crypto.subtle.digest(algorithmInfo.name, arrayBuffer);
  }
  
  let hash: string;
  switch (options.encoding) {
    case 'hex':
      hash = arrayBufferToHex(hashBuffer, options.uppercase);
      break;
    case 'base64':
      hash = arrayBufferToBase64(hashBuffer);
      break;
    case 'binary':
      hash = arrayBufferToBinary(hashBuffer);
      break;
    default:
      hash = arrayBufferToHex(hashBuffer, options.uppercase);
  }
  
  const endTime = performance.now();
  
  return {
    hash,
    algorithm: options.algorithm,
    length: hash.length,
    bitLength: algorithmInfo.bitLength,
    timestamp: new Date(),
    processingTime: endTime - startTime,
  };
}

// Compare two hashes
export function compareHashes(
  originalHash: string,
  comparisonHash: string,
  algorithm: string
): HashComparison {
  // Normalize hashes for comparison (remove spaces, convert to lowercase)
  const normalizedOriginal = originalHash.trim().toLowerCase();
  const normalizedComparison = comparisonHash.trim().toLowerCase();
  
  return {
    matches: normalizedOriginal === normalizedComparison,
    algorithm,
    original: originalHash,
    comparison: comparisonHash,
  };
}

// Batch hash generation
export async function generateBatchHashes(
  inputs: string[],
  options: HashOptions
): Promise<HashResult[]> {
  const results = await Promise.all(
    inputs.map(input => generateSHAHash(input, options))
  );
  return results;
}

// Validate hash format
export function validateHashFormat(
  hash: string,
  algorithm: HashOptions['algorithm'],
  encoding: HashOptions['encoding']
): boolean {
  const expectedLengths = {
    'SHA-1': { hex: 40, base64: 28, binary: 160 },
    'SHA-256': { hex: 64, base64: 44, binary: 256 },
    'SHA-384': { hex: 96, base64: 64, binary: 384 },
    'SHA-512': { hex: 128, base64: 88, binary: 512 },
  };
  
  const expectedLength = expectedLengths[algorithm][encoding];
  
  if (hash.length !== expectedLength) {
    return false;
  }
  
  // Validate format based on encoding
  switch (encoding) {
    case 'hex':
      return /^[0-9a-fA-F]+$/.test(hash);
    case 'base64':
      return /^[A-Za-z0-9+/]+=*$/.test(hash);
    case 'binary':
      return /^[01]+$/.test(hash);
    default:
      return false;
  }
}

// Get hash security information
export function getHashSecurityInfo(algorithm: HashOptions['algorithm']) {
  const securityInfo = {
    'SHA-1': {
      secure: false,
      deprecated: true,
      recommendation: 'SHA-1 is cryptographically broken and should not be used for security-critical applications. Use SHA-256 or SHA-512 instead.',
      useCase: 'Legacy systems, non-security checksums',
    },
    'SHA-256': {
      secure: true,
      deprecated: false,
      recommendation: 'SHA-256 is currently secure and recommended for most cryptographic applications.',
      useCase: 'Digital signatures, certificates, blockchain, password hashing (with salt)',
    },
    'SHA-384': {
      secure: true,
      deprecated: false,
      recommendation: 'SHA-384 provides additional security margin over SHA-256.',
      useCase: 'High-security applications, government systems',
    },
    'SHA-512': {
      secure: true,
      deprecated: false,
      recommendation: 'SHA-512 provides the highest security in the SHA-2 family.',
      useCase: 'Maximum security requirements, large file integrity',
    },
  };
  
  return securityInfo[algorithm];
}

// Format hash for display (add spacing for readability)
export function formatHashForDisplay(hash: string, groupSize: number = 8): string {
  const regex = new RegExp(`.{1,${groupSize}}`, 'g');
  const groups = hash.match(regex) || [];
  return groups.join(' ');
}

// Calculate estimated collision probability (simplified)
export function getCollisionProbability(bitLength: number, numHashes: number): string {
  // Using birthday paradox approximation
  // P(collision) ≈ n² / 2^(bitLength + 1)
  const probability = Math.pow(numHashes, 2) / Math.pow(2, bitLength + 1);
  
  if (probability < 1e-15) {
    return 'Virtually impossible';
  } else if (probability < 1e-9) {
    return 'Extremely unlikely';
  } else if (probability < 1e-6) {
    return 'Very unlikely';
  } else if (probability < 0.001) {
    return 'Unlikely';
  } else if (probability < 0.01) {
    return 'Possible but rare';
  } else {
    return 'Possible';
  }
}