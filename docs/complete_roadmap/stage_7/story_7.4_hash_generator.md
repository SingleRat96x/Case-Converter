# Story 7.4: Hash Generator (MD5, SHA, etc.)

## Story Details
- **Stage**: 7 - Encoding/Decoding Tools
- **Priority**: High
- **Estimated Hours**: 4 hours
- **Dependencies**: Stage 2 Complete (Core Components)

## Objective
Create a comprehensive hash generator supporting multiple algorithms (MD5, SHA family, BLAKE, etc.) with features for file hashing, HMAC generation, hash comparison, and security recommendations.

## Acceptance Criteria
- [ ] Support MD5, SHA-1, SHA-256, SHA-384, SHA-512
- [ ] Support modern algorithms (SHA-3, BLAKE2, BLAKE3)
- [ ] File hashing with progress indicator
- [ ] HMAC (Hash-based Message Authentication Code)
- [ ] Hash comparison and verification
- [ ] Batch hashing for multiple inputs
- [ ] Performance benchmarking
- [ ] Security warnings for weak algorithms
- [ ] Export hash results in various formats
- [ ] Hash chaining and iterations

## Implementation Steps

### 1. Create Hash Generator Logic

#### Create `src/lib/encoding/hash-generator.ts`
```typescript
import { createHash, createHmac, getHashes } from 'crypto'

export interface HashAlgorithm {
  id: string
  name: string
  family: 'md' | 'sha' | 'sha3' | 'blake' | 'other'
  outputLength: number // bits
  securityLevel: 'broken' | 'weak' | 'acceptable' | 'strong'
  description: string
  warning?: string
}

export interface HashOptions {
  algorithm: string
  encoding: 'hex' | 'base64' | 'base64url' | 'binary'
  iterations?: number
  hmacKey?: string
  uppercase?: boolean
}

export interface HashResult {
  hash?: string
  algorithm: string
  encoding: string
  inputSize: number
  outputSize: number
  timeMs?: number
  isValid: boolean
  error?: string
  security?: {
    level: string
    warning?: string
  }
}

export interface FileHashProgress {
  bytesProcessed: number
  totalBytes: number
  percentage: number
}

export class HashGenerator {
  // Available hash algorithms with metadata
  private static readonly ALGORITHMS: Record<string, HashAlgorithm> = {
    'md5': {
      id: 'md5',
      name: 'MD5',
      family: 'md',
      outputLength: 128,
      securityLevel: 'broken',
      description: 'Message-Digest Algorithm 5',
      warning: 'MD5 is cryptographically broken and should not be used for security purposes',
    },
    'sha1': {
      id: 'sha1',
      name: 'SHA-1',
      family: 'sha',
      outputLength: 160,
      securityLevel: 'weak',
      description: 'Secure Hash Algorithm 1',
      warning: 'SHA-1 is deprecated for security use due to collision vulnerabilities',
    },
    'sha256': {
      id: 'sha256',
      name: 'SHA-256',
      family: 'sha',
      outputLength: 256,
      securityLevel: 'strong',
      description: 'SHA-2 family, 256-bit output',
    },
    'sha384': {
      id: 'sha384',
      name: 'SHA-384',
      family: 'sha',
      outputLength: 384,
      securityLevel: 'strong',
      description: 'SHA-2 family, 384-bit output',
    },
    'sha512': {
      id: 'sha512',
      name: 'SHA-512',
      family: 'sha',
      outputLength: 512,
      securityLevel: 'strong',
      description: 'SHA-2 family, 512-bit output',
    },
    'sha3-256': {
      id: 'sha3-256',
      name: 'SHA3-256',
      family: 'sha3',
      outputLength: 256,
      securityLevel: 'strong',
      description: 'SHA-3 family (Keccak), 256-bit output',
    },
    'sha3-384': {
      id: 'sha3-384',
      name: 'SHA3-384',
      family: 'sha3',
      outputLength: 384,
      securityLevel: 'strong',
      description: 'SHA-3 family (Keccak), 384-bit output',
    },
    'sha3-512': {
      id: 'sha3-512',
      name: 'SHA3-512',
      family: 'sha3',
      outputLength: 512,
      securityLevel: 'strong',
      description: 'SHA-3 family (Keccak), 512-bit output',
    },
    'blake2b512': {
      id: 'blake2b512',
      name: 'BLAKE2b-512',
      family: 'blake',
      outputLength: 512,
      securityLevel: 'strong',
      description: 'BLAKE2b with 512-bit output',
    },
    'blake2s256': {
      id: 'blake2s256',
      name: 'BLAKE2s-256',
      family: 'blake',
      outputLength: 256,
      securityLevel: 'strong',
      description: 'BLAKE2s with 256-bit output',
    },
  }
  
  // Generate hash
  static hash(
    input: string | Buffer,
    options: Partial<HashOptions> = {}
  ): HashResult {
    const {
      algorithm = 'sha256',
      encoding = 'hex',
      iterations = 1,
      hmacKey,
      uppercase = false,
    } = options
    
    const startTime = Date.now()
    
    try {
      // Validate algorithm
      if (!this.isAlgorithmSupported(algorithm)) {
        throw new Error(`Unsupported algorithm: ${algorithm}`)
      }
      
      // Get algorithm info
      const algorithmInfo = this.ALGORITHMS[algorithm]
      
      // Convert string to buffer if needed
      const inputBuffer = typeof input === 'string' 
        ? Buffer.from(input, 'utf8')
        : input
      
      let hash: string
      
      if (hmacKey) {
        // Generate HMAC
        hash = this.generateHMAC(inputBuffer, algorithm, hmacKey, encoding)
      } else {
        // Generate regular hash
        hash = this.generateHash(inputBuffer, algorithm, encoding, iterations)
      }
      
      // Apply uppercase if requested
      if (uppercase && encoding === 'hex') {
        hash = hash.toUpperCase()
      }
      
      const timeMs = Date.now() - startTime
      
      return {
        hash,
        algorithm,
        encoding,
        inputSize: inputBuffer.length,
        outputSize: hash.length,
        timeMs,
        isValid: true,
        security: algorithmInfo ? {
          level: algorithmInfo.securityLevel,
          warning: algorithmInfo.warning,
        } : undefined,
      }
    } catch (error) {
      return {
        algorithm,
        encoding,
        inputSize: 0,
        outputSize: 0,
        isValid: false,
        error: error instanceof Error ? error.message : 'Hashing failed',
      }
    }
  }
  
  // Hash file with progress
  static async hashFile(
    file: File,
    options: Partial<HashOptions> = {},
    onProgress?: (progress: FileHashProgress) => void
  ): Promise<HashResult> {
    const {
      algorithm = 'sha256',
      encoding = 'hex',
      hmacKey,
      uppercase = false,
    } = options
    
    const startTime = Date.now()
    
    try {
      // Validate algorithm
      if (!this.isAlgorithmSupported(algorithm)) {
        throw new Error(`Unsupported algorithm: ${algorithm}`)
      }
      
      const algorithmInfo = this.ALGORITHMS[algorithm]
      
      // Read file in chunks
      const chunkSize = 1024 * 1024 // 1MB chunks
      const chunks: Buffer[] = []
      let bytesProcessed = 0
      
      const reader = new FileReader()
      
      for (let offset = 0; offset < file.size; offset += chunkSize) {
        const chunk = file.slice(offset, Math.min(offset + chunkSize, file.size))
        
        await new Promise<void>((resolve, reject) => {
          reader.onload = (e) => {
            if (e.target?.result) {
              const buffer = Buffer.from(e.target.result as ArrayBuffer)
              chunks.push(buffer)
              bytesProcessed += buffer.length
              
              if (onProgress) {
                onProgress({
                  bytesProcessed,
                  totalBytes: file.size,
                  percentage: (bytesProcessed / file.size) * 100,
                })
              }
            }
            resolve()
          }
          
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsArrayBuffer(chunk)
        })
      }
      
      // Combine chunks
      const fileBuffer = Buffer.concat(chunks)
      
      // Generate hash
      let hash: string
      
      if (hmacKey) {
        hash = this.generateHMAC(fileBuffer, algorithm, hmacKey, encoding)
      } else {
        hash = this.generateHash(fileBuffer, algorithm, encoding)
      }
      
      // Apply uppercase if requested
      if (uppercase && encoding === 'hex') {
        hash = hash.toUpperCase()
      }
      
      const timeMs = Date.now() - startTime
      
      return {
        hash,
        algorithm,
        encoding,
        inputSize: file.size,
        outputSize: hash.length,
        timeMs,
        isValid: true,
        security: algorithmInfo ? {
          level: algorithmInfo.securityLevel,
          warning: algorithmInfo.warning,
        } : undefined,
      }
    } catch (error) {
      return {
        algorithm,
        encoding,
        inputSize: 0,
        outputSize: 0,
        isValid: false,
        error: error instanceof Error ? error.message : 'File hashing failed',
      }
    }
  }
  
  // Batch hash multiple inputs
  static batchHash(
    inputs: string[],
    options: Partial<HashOptions> = {}
  ): HashResult[] {
    return inputs.map(input => this.hash(input, options))
  }
  
  // Compare two hashes
  static compareHashes(hash1: string, hash2: string): {
    match: boolean
    algorithm?: string
    differences?: number
  } {
    // Normalize hashes (remove spaces, lowercase)
    const normalized1 = hash1.trim().toLowerCase().replace(/\s+/g, '')
    const normalized2 = hash2.trim().toLowerCase().replace(/\s+/g, '')
    
    const match = normalized1 === normalized2
    
    // Try to detect algorithm by hash length
    let algorithm: string | undefined
    
    if (normalized1.length === normalized2.length) {
      const length = normalized1.length
      
      // Hex encoding detection
      if (/^[a-f0-9]+$/.test(normalized1)) {
        switch (length) {
          case 32: algorithm = 'MD5'; break
          case 40: algorithm = 'SHA-1'; break
          case 64: algorithm = 'SHA-256'; break
          case 96: algorithm = 'SHA-384'; break
          case 128: algorithm = 'SHA-512'; break
        }
      }
    }
    
    // Count character differences
    let differences = 0
    if (!match && normalized1.length === normalized2.length) {
      for (let i = 0; i < normalized1.length; i++) {
        if (normalized1[i] !== normalized2[i]) {
          differences++
        }
      }
    }
    
    return {
      match,
      algorithm,
      differences: match ? 0 : differences,
    }
  }
  
  // Verify hash against input
  static verify(
    input: string,
    expectedHash: string,
    options: Partial<HashOptions> = {}
  ): boolean {
    const result = this.hash(input, options)
    
    if (!result.isValid || !result.hash) {
      return false
    }
    
    const comparison = this.compareHashes(result.hash, expectedHash)
    return comparison.match
  }
  
  // Get all available algorithms
  static getAvailableAlgorithms(): HashAlgorithm[] {
    return Object.values(this.ALGORITHMS)
  }
  
  // Get algorithms by family
  static getAlgorithmsByFamily(family: HashAlgorithm['family']): HashAlgorithm[] {
    return Object.values(this.ALGORITHMS).filter(algo => algo.family === family)
  }
  
  // Get secure algorithms only
  static getSecureAlgorithms(): HashAlgorithm[] {
    return Object.values(this.ALGORITHMS).filter(
      algo => algo.securityLevel === 'strong' || algo.securityLevel === 'acceptable'
    )
  }
  
  // Benchmark algorithms
  static async benchmark(
    input: string,
    algorithms?: string[]
  ): Promise<Array<{
    algorithm: string
    timeMs: number
    hashesPerSecond: number
  }>> {
    const algos = algorithms || Object.keys(this.ALGORITHMS)
    const iterations = 10000
    const results: Array<{
      algorithm: string
      timeMs: number
      hashesPerSecond: number
    }> = []
    
    for (const algorithm of algos) {
      if (!this.isAlgorithmSupported(algorithm)) continue
      
      const startTime = Date.now()
      
      for (let i = 0; i < iterations; i++) {
        this.hash(input + i, { algorithm })
      }
      
      const timeMs = Date.now() - startTime
      const hashesPerSecond = Math.round((iterations / timeMs) * 1000)
      
      results.push({
        algorithm,
        timeMs,
        hashesPerSecond,
      })
    }
    
    return results.sort((a, b) => b.hashesPerSecond - a.hashesPerSecond)
  }
  
  // Generate checksum file content
  static generateChecksumFile(
    files: Array<{ name: string; hash: string }>,
    algorithm: string,
    format: 'md5sum' | 'sha256sum' | 'bsd' = 'sha256sum'
  ): string {
    const lines: string[] = []
    
    switch (format) {
      case 'md5sum':
      case 'sha256sum':
        // GNU coreutils format: hash  filename
        files.forEach(file => {
          lines.push(`${file.hash}  ${file.name}`)
        })
        break
        
      case 'bsd':
        // BSD format: ALGORITHM (filename) = hash
        files.forEach(file => {
          lines.push(`${algorithm.toUpperCase()} (${file.name}) = ${file.hash}`)
        })
        break
    }
    
    return lines.join('\n')
  }
  
  // Helper methods
  private static generateHash(
    input: Buffer,
    algorithm: string,
    encoding: string,
    iterations: number = 1
  ): string {
    let hash = input
    
    for (let i = 0; i < iterations; i++) {
      const hasher = createHash(algorithm)
      hasher.update(hash)
      hash = hasher.digest()
    }
    
    return hash.toString(encoding as any)
  }
  
  private static generateHMAC(
    input: Buffer,
    algorithm: string,
    key: string,
    encoding: string
  ): string {
    const hmac = createHmac(algorithm, key)
    hmac.update(input)
    return hmac.digest(encoding as any)
  }
  
  private static isAlgorithmSupported(algorithm: string): boolean {
    try {
      const supportedHashes = getHashes()
      return supportedHashes.includes(algorithm)
    } catch {
      // Fallback to known algorithms
      return algorithm in this.ALGORITHMS
    }
  }
}

// Export convenience functions
export const generateHash = (input: string, options?: Partial<HashOptions>) =>
  HashGenerator.hash(input, options)

export const hashFile = (file: File, options?: Partial<HashOptions>, onProgress?: (progress: FileHashProgress) => void) =>
  HashGenerator.hashFile(file, options, onProgress)

export const verifyHash = (input: string, expectedHash: string, options?: Partial<HashOptions>) =>
  HashGenerator.verify(input, expectedHash, options)

export const compareHashes = (hash1: string, hash2: string) =>
  HashGenerator.compareHashes(hash1, hash2)
```

### 2. Create Hash Generator Tool Component

#### Create `src/components/tools/encoding/hash-generator-tool.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import {
  Copy,
  Download,
  RefreshCw,
  Hash,
  Upload,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Key,
  FileUp
} from 'lucide-react'
import {
  HashGenerator,
  HashOptions,
  HashResult,
  HashAlgorithm,
  FileHashProgress,
  generateHash,
  hashFile,
  verifyHash,
  compareHashes
} from '@/lib/encoding/hash-generator'
import { useToolAnalytics } from '@/hooks/use-tool-analytics'
import { CounterDisplay } from '@/components/ui/counter-display'
import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'

export function HashGeneratorTool() {
  const [input, setInput] = React.useState('')
  const [algorithm, setAlgorithm] = React.useState('sha256')
  const [encoding, setEncoding] = React.useState<HashOptions['encoding']>('hex')
  const [uppercase, setUppercase] = React.useState(false)
  const [iterations, setIterations] = React.useState(1)
  const [hmacKey, setHmacKey] = React.useState('')
  const [useHmac, setUseHmac] = React.useState(false)
  const [result, setResult] = React.useState<HashResult | null>(null)
  const [file, setFile] = React.useState<File | null>(null)
  const [fileProgress, setFileProgress] = React.useState<FileHashProgress | null>(null)
  const [compareHash1, setCompareHash1] = React.useState('')
  const [compareHash2, setCompareHash2] = React.useState('')
  const [verifyInput, setVerifyInput] = React.useState('')
  const [verifyHash, setVerifyHash] = React.useState('')
  const [benchmarkResults, setBenchmarkResults] = React.useState<any[]>([])
  const [selectedFamily, setSelectedFamily] = React.useState<string>('all')
  
  const { toast } = useToast()
  const { trackStart, trackComplete, trackFeature } = useToolAnalytics({
    toolId: 'hash-generator',
    toolName: 'Hash Generator',
    category: 'encoding',
  })
  
  // Get available algorithms
  const algorithms = React.useMemo(() => {
    const all = HashGenerator.getAvailableAlgorithms()
    
    if (selectedFamily === 'all') return all
    if (selectedFamily === 'secure') return HashGenerator.getSecureAlgorithms()
    
    return HashGenerator.getAlgorithmsByFamily(selectedFamily as any)
  }, [selectedFamily])
  
  // Generate hash
  React.useEffect(() => {
    if (!input && !file) {
      setResult(null)
      return
    }
    
    if (file) return // File hashing handled separately
    
    trackStart(input)
    
    const options: Partial<HashOptions> = {
      algorithm,
      encoding,
      uppercase,
      iterations,
      hmacKey: useHmac ? hmacKey : undefined,
    }
    
    const result = generateHash(input, options)
    setResult(result)
    
    if (result.isValid) {
      trackComplete(input, result.hash!)
    }
  }, [input, algorithm, encoding, uppercase, iterations, hmacKey, useHmac, trackStart, trackComplete])
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    
    setFile(selectedFile)
    setInput('') // Clear text input
    setFileProgress(null)
    
    trackFeature('file_hash', {
      fileType: selectedFile.type,
      fileSize: selectedFile.size,
    })
    
    const options: Partial<HashOptions> = {
      algorithm,
      encoding,
      uppercase,
      hmacKey: useHmac ? hmacKey : undefined,
    }
    
    const result = await hashFile(
      selectedFile,
      options,
      (progress) => setFileProgress(progress)
    )
    
    setResult(result)
    setFileProgress(null)
    
    if (result.isValid) {
      toast({
        title: 'File hashed successfully',
        description: `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`,
      })
    }
  }
  
  const handleCompare = () => {
    if (!compareHash1 || !compareHash2) return
    
    const comparison = compareHashes(compareHash1, compareHash2)
    
    trackFeature('compare_hashes', { match: comparison.match })
    
    toast({
      title: comparison.match ? 'Hashes match!' : 'Hashes do not match',
      description: comparison.algorithm 
        ? `Detected algorithm: ${comparison.algorithm}`
        : comparison.differences 
        ? `${comparison.differences} character differences`
        : undefined,
      variant: comparison.match ? 'default' : 'destructive',
    })
  }
  
  const handleVerify = () => {
    if (!verifyInput || !verifyHash) return
    
    const options: Partial<HashOptions> = {
      algorithm,
      encoding,
      uppercase,
    }
    
    const isValid = verifyHash(verifyInput, verifyHash, options)
    
    trackFeature('verify_hash', { valid: isValid })
    
    toast({
      title: isValid ? 'Verification passed!' : 'Verification failed',
      description: isValid 
        ? 'The input matches the expected hash'
        : 'The input does not match the expected hash',
      variant: isValid ? 'default' : 'destructive',
    })
  }
  
  const runBenchmark = async () => {
    trackFeature('run_benchmark')
    
    toast({
      title: 'Running benchmark...',
      description: 'This may take a few seconds',
    })
    
    const results = await HashGenerator.benchmark('The quick brown fox jumps over the lazy dog')
    setBenchmarkResults(results)
  }
  
  const downloadChecksum = () => {
    if (!result?.hash) return
    
    const content = HashGenerator.generateChecksumFile(
      [{ name: file?.name || 'input.txt', hash: result.hash }],
      algorithm,
      algorithm.includes('md5') ? 'md5sum' : 'sha256sum'
    )
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${algorithm}sum.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    trackFeature('download_checksum')
  }
  
  const clearAll = () => {
    setInput('')
    setFile(null)
    setResult(null)
    setFileProgress(null)
    setCompareHash1('')
    setCompareHash2('')
    setVerifyInput('')
    setVerifyHash('')
  }
  
  const families = [
    { value: 'all', label: 'All Algorithms' },
    { value: 'secure', label: 'Secure Only' },
    { value: 'md', label: 'MD Family' },
    { value: 'sha', label: 'SHA Family' },
    { value: 'sha3', label: 'SHA-3 Family' },
    { value: 'blake', label: 'BLAKE Family' },
  ]
  
  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Hash Generator
          </CardTitle>
          <CardDescription>
            Generate cryptographic hashes using various algorithms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="text" className="w-full">
            <TabsList>
              <TabsTrigger value="text">
                <FileText className="h-4 w-4 mr-2" />
                Text
              </TabsTrigger>
              <TabsTrigger value="file">
                <FileUp className="h-4 w-4 mr-2" />
                File
              </TabsTrigger>
              <TabsTrigger value="compare">
                Compare
              </TabsTrigger>
              <TabsTrigger value="verify">
                Verify
              </TabsTrigger>
              <TabsTrigger value="benchmark">
                <Zap className="h-4 w-4 mr-2" />
                Benchmark
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">Text to hash</Label>
                <Textarea
                  id="input"
                  placeholder="Enter text to generate hash..."
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    setFile(null)
                  }}
                  className="min-h-[150px] font-mono"
                />
                <CounterDisplay
                  current={input.length}
                  label="characters"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select file to hash</Label>
                <div className="flex items-center gap-4">
                  <Label htmlFor="file-input" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted">
                      <Upload className="h-4 w-4" />
                      Choose File
                    </div>
                    <Input
                      id="file-input"
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </Label>
                  {file && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{file.name}</Badge>
                      <Badge variant="outline">{(file.size / 1024).toFixed(2)} KB</Badge>
                    </div>
                  )}
                </div>
                
                {fileProgress && (
                  <div className="space-y-2">
                    <Progress value={fileProgress.percentage} />
                    <p className="text-sm text-muted-foreground">
                      Processing: {(fileProgress.bytesProcessed / 1024).toFixed(0)} KB / {(fileProgress.totalBytes / 1024).toFixed(0)} KB
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="compare" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hash1">First hash</Label>
                  <Input
                    id="hash1"
                    placeholder="Enter first hash..."
                    value={compareHash1}
                    onChange={(e) => setCompareHash1(e.target.value)}
                    className="font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hash2">Second hash</Label>
                  <Input
                    id="hash2"
                    placeholder="Enter second hash..."
                    value={compareHash2}
                    onChange={(e) => setCompareHash2(e.target.value)}
                    className="font-mono"
                  />
                </div>
                
                <Button onClick={handleCompare} className="w-full">
                  Compare Hashes
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="verify" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify-input">Input text</Label>
                  <Textarea
                    id="verify-input"
                    placeholder="Enter text to verify..."
                    value={verifyInput}
                    onChange={(e) => setVerifyInput(e.target.value)}
                    className="min-h-[100px] font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="verify-hash">Expected hash</Label>
                  <Input
                    id="verify-hash"
                    placeholder="Enter expected hash..."
                    value={verifyHash}
                    onChange={(e) => setVerifyHash(e.target.value)}
                    className="font-mono"
                  />
                </div>
                
                <Button onClick={handleVerify} className="w-full">
                  Verify Hash
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="benchmark" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Benchmark different hash algorithms to compare their performance
                </p>
                
                <Button onClick={runBenchmark} className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Run Performance Benchmark
                </Button>
                
                {benchmarkResults.length > 0 && (
                  <ScrollArea className="h-[300px] w-full rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Algorithm</TableHead>
                          <TableHead className="text-right">Time (ms)</TableHead>
                          <TableHead className="text-right">Hashes/sec</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {benchmarkResults.map((result) => (
                          <TableRow key={result.algorithm}>
                            <TableCell className="font-mono">{result.algorithm}</TableCell>
                            <TableCell className="text-right">{result.timeMs}</TableCell>
                            <TableCell className="text-right">
                              {result.hashesPerSecond.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="algorithm">Hash Algorithm</Label>
                <div className="space-y-2">
                  <Select value={selectedFamily} onValueChange={setSelectedFamily}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {families.map(family => (
                        <SelectItem key={family.value} value={family.value}>
                          {family.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={algorithm} onValueChange={setAlgorithm}>
                    <SelectTrigger id="algorithm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {algorithms.map(algo => (
                        <SelectItem key={algo.id} value={algo.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{algo.name}</span>
                            {algo.securityLevel === 'broken' && (
                              <Badge variant="destructive" className="ml-2">Broken</Badge>
                            )}
                            {algo.securityLevel === 'weak' && (
                              <Badge variant="secondary" className="ml-2">Weak</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="encoding">Output Encoding</Label>
                <Select value={encoding} onValueChange={setEncoding as any}>
                  <SelectTrigger id="encoding">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hex">Hexadecimal</SelectItem>
                    <SelectItem value="base64">Base64</SelectItem>
                    <SelectItem value="base64url">Base64 URL-Safe</SelectItem>
                    <SelectItem value="binary">Binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="uppercase" className="font-normal">
                  Uppercase output (hex only)
                </Label>
                <Switch
                  id="uppercase"
                  checked={uppercase}
                  onCheckedChange={setUppercase}
                  disabled={encoding !== 'hex'}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="hmac" className="font-normal">
                  Use HMAC (Hash-based Message Authentication Code)
                </Label>
                <Switch
                  id="hmac"
                  checked={useHmac}
                  onCheckedChange={setUseHmac}
                />
              </div>
              
              {useHmac && (
                <div className="space-y-2">
                  <Label htmlFor="hmac-key">HMAC Secret Key</Label>
                  <Input
                    id="hmac-key"
                    type="password"
                    placeholder="Enter secret key..."
                    value={hmacKey}
                    onChange={(e) => setHmacKey(e.target.value)}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="iterations">Iterations (for key stretching)</Label>
                <Input
                  id="iterations"
                  type="number"
                  min={1}
                  max={100000}
                  value={iterations}
                  onChange={(e) => setIterations(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Hash Result</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {result.algorithm.toUpperCase()}
                </Badge>
                {result.timeMs && (
                  <Badge variant="outline">
                    {result.timeMs}ms
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.security?.warning && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Security Warning</AlertTitle>
                <AlertDescription>
                  {result.security.warning}
                </AlertDescription>
              </Alert>
            )}
            
            {result.hash && (
              <div className="space-y-2">
                <div className="p-4 bg-muted rounded-md font-mono text-sm break-all">
                  {result.hash}
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Input: {result.inputSize} bytes → Output: {result.outputSize} characters
                  </span>
                  {useHmac && (
                    <Badge variant="secondary">
                      <Key className="h-3 w-3 mr-1" />
                      HMAC
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {result.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {result.error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <CopyButton
                text={result.hash || ''}
                disabled={!result.hash}
                onCopy={() => trackFeature('copy_hash')}
              />
              {file && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadChecksum}
                  disabled={!result.hash}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Checksum
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={clearAll}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>
    </div>
  )
}
```

### 3. Create Page

#### Create `src/app/[locale]/tools/hash-generator/page.tsx`
```typescript
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { HashGeneratorTool } from '@/components/tools/encoding/hash-generator-tool'
import { ToolLayout } from '@/components/tools/tool-layout'
import { generateToolMetadata } from '@/lib/seo/tool-metadata'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.hashGenerator' })
  
  return generateToolMetadata({
    title: t('title'),
    description: t('description'),
    keywords: ['hash generator', 'md5', 'sha256', 'sha512', 'hmac', 'checksum'],
    locale,
    path: '/tools/hash-generator',
  })
}

export default function HashGeneratorPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  return (
    <ToolLayout
      toolId="hash-generator"
      locale={locale}
    >
      <HashGeneratorTool />
    </ToolLayout>
  )
}
```

## Testing & Verification

1. Test all hash algorithms
2. Verify file hashing with progress
3. Test HMAC generation
4. Check hash comparison
5. Verify security warnings
6. Test performance benchmarking

## Notes
- Support for modern algorithms (SHA-3, BLAKE)
- Security warnings for weak algorithms
- File hashing with progress indicator
- HMAC support for authentication
- Performance benchmarking tool