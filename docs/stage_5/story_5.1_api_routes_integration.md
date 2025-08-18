# Story 5.1: API Routes & Server Integration

## Story Details
- **Stage**: 5 - Integration, Testing & Performance
- **Priority**: Critical
- **Estimated Hours**: 6-8 hours
- **Dependencies**: Stage 4 Complete (Core Tools)

## Objective
Create API routes for server-side text processing, integrate with existing tools, and implement rate limiting, caching, and error handling. This will enable programmatic access to all text tools and improve performance for heavy operations.

## Acceptance Criteria
- [ ] RESTful API endpoints for all text tools
- [ ] Input validation and sanitization
- [ ] Rate limiting per IP/API key
- [ ] Response caching for common operations
- [ ] Error handling with proper HTTP status codes
- [ ] API documentation with OpenAPI/Swagger
- [ ] CORS configuration
- [ ] Request/response logging
- [ ] Performance monitoring
- [ ] Batch processing endpoints
- [ ] WebSocket support for real-time processing
- [ ] API versioning strategy

## Implementation Steps

### 1. Create API Route Structure

#### Create `src/app/api/v1/route.ts` (API Version Info)
```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    version: '1.0.0',
    name: 'Text Case Converter API',
    description: 'RESTful API for text manipulation tools',
    endpoints: {
      case: '/api/v1/case',
      format: '/api/v1/format',
      encode: '/api/v1/encode',
      generate: '/api/v1/generate',
      analyze: '/api/v1/analyze',
      advanced: '/api/v1/advanced',
    },
    rateLimit: {
      requests: 100,
      window: '15 minutes',
    },
    documentation: '/api/v1/docs',
  })
}
```

### 2. Create Base API Utilities

#### Create `src/lib/api/middleware.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { RateLimiter } from './rate-limiter'
import { z } from 'zod'
import { createHash } from 'crypto'

// Initialize rate limiter
const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
})

// Request validation middleware
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ data?: T; error?: NextResponse }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: NextResponse.json(
          {
            error: 'Validation Error',
            details: error.errors,
          },
          { status: 400 }
        ),
      }
    }
    return {
      error: NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      ),
    }
  }
}

// Rate limiting middleware
export async function checkRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const identifier = request.headers.get('x-api-key') || ip
  
  const { success, remaining, reset } = await rateLimiter.check(identifier)
  
  if (!success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: reset,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }
  
  return null
}

// Response caching
export function getCacheKey(endpoint: string, params: any): string {
  const hash = createHash('md5')
    .update(`${endpoint}:${JSON.stringify(params)}`)
    .digest('hex')
  return `api:cache:${hash}`
}

// Error response helper
export function errorResponse(
  message: string,
  status: number = 500,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status }
  )
}

// Success response helper
export function successResponse<T>(
  data: T,
  meta?: Record<string, any>
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta }),
  })
}

// Request logging
export async function logRequest(
  request: NextRequest,
  response: NextResponse,
  duration: number
): Promise<void> {
  const log = {
    timestamp: new Date().toISOString(),
    method: request.method,
    path: request.nextUrl.pathname,
    status: response.status,
    duration: `${duration}ms`,
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent'),
  }
  
  // In production, send to logging service
  if (process.env.NODE_ENV === 'production') {
    // await sendToLoggingService(log)
  } else {
    console.log('[API]', log)
  }
}
```

#### Create `src/lib/api/rate-limiter.ts`
```typescript
interface RateLimiterOptions {
  windowMs: number
  max: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export class RateLimiter {
  private store: Map<string, { count: number; reset: number }> = new Map()
  private windowMs: number
  private max: number
  
  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs
    this.max = options.max
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000)
  }
  
  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const record = this.store.get(identifier)
    
    if (!record || now > record.reset) {
      // Create new record
      const reset = now + this.windowMs
      this.store.set(identifier, { count: 1, reset })
      return { success: true, remaining: this.max - 1, reset }
    }
    
    if (record.count >= this.max) {
      return { success: false, remaining: 0, reset: record.reset }
    }
    
    // Increment count
    record.count++
    return {
      success: true,
      remaining: this.max - record.count,
      reset: record.reset,
    }
  }
  
  private cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.store.entries()) {
      if (now > record.reset) {
        this.store.delete(key)
      }
    }
  }
}
```

### 3. Create Case Conversion API Routes

#### Create `src/app/api/v1/case/route.ts`
```typescript
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { caseConverters } from '@/lib/text-case/converters'
import {
  validateRequest,
  checkRateLimit,
  successResponse,
  errorResponse,
  logRequest,
} from '@/lib/api/middleware'

// Request schema
const CaseConversionSchema = z.object({
  text: z.string().min(1).max(100000),
  type: z.enum([
    'uppercase',
    'lowercase',
    'titleCase',
    'sentenceCase',
    'camelCase',
    'pascalCase',
    'snakeCase',
    'kebabCase',
    'alternatingCase',
    'inverseCase',
    'constantCase',
    'dotCase',
    'trainCase',
  ]),
  options: z
    .object({
      minorWords: z.boolean().optional(),
      startWithUpper: z.boolean().optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  const start = Date.now()
  
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse
  
  // Validate request
  const { data, error } = await validateRequest(request, CaseConversionSchema)
  if (error) return error
  
  try {
    const { text, type, options } = data!
    
    // Apply conversion
    let result: string
    
    switch (type) {
      case 'titleCase':
        result = caseConverters.titleCase(text, options)
        break
      case 'alternatingCase':
        result = caseConverters.alternatingCase(text, options?.startWithUpper)
        break
      default:
        result = caseConverters[type](text)
    }
    
    const response = successResponse(
      { 
        original: text,
        converted: result,
        type,
      },
      {
        length: result.length,
        processingTime: Date.now() - start,
      }
    )
    
    // Log request
    await logRequest(request, response, Date.now() - start)
    
    return response
  } catch (error) {
    return errorResponse('Failed to convert text', 500, error)
  }
}

// Batch conversion endpoint
export async function PUT(request: NextRequest) {
  const start = Date.now()
  
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse
  
  const BatchSchema = z.object({
    texts: z.array(z.string()).min(1).max(100),
    type: CaseConversionSchema.shape.type,
    options: CaseConversionSchema.shape.options,
  })
  
  const { data, error } = await validateRequest(request, BatchSchema)
  if (error) return error
  
  try {
    const { texts, type, options } = data!
    
    const results = texts.map(text => {
      switch (type) {
        case 'titleCase':
          return caseConverters.titleCase(text, options)
        case 'alternatingCase':
          return caseConverters.alternatingCase(text, options?.startWithUpper)
        default:
          return caseConverters[type](text)
      }
    })
    
    const response = successResponse(
      {
        results,
        type,
      },
      {
        count: results.length,
        processingTime: Date.now() - start,
      }
    )
    
    await logRequest(request, response, Date.now() - start)
    
    return response
  } catch (error) {
    return errorResponse('Failed to convert texts', 500, error)
  }
}

// Get available case types
export async function GET(request: NextRequest) {
  const types = Object.keys(caseConverters).map(key => ({
    type: key,
    name: key.replace(/([A-Z])/g, ' $1').trim(),
    example: getExample(key),
  }))
  
  return successResponse({ types })
}

function getExample(type: string): string {
  const text = 'hello world'
  try {
    return caseConverters[type as keyof typeof caseConverters](text)
  } catch {
    return text
  }
}
```

### 4. Create Text Analysis API Routes

#### Create `src/app/api/v1/analyze/route.ts`
```typescript
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { analyzers } from '@/lib/analysis/text-analyzers'
import {
  validateRequest,
  checkRateLimit,
  successResponse,
  errorResponse,
  logRequest,
  getCacheKey,
} from '@/lib/api/middleware'
import { cache } from '@/lib/cache'

const AnalysisSchema = z.object({
  text: z.string().min(1).max(100000),
  options: z
    .object({
      includeReadability: z.boolean().optional(),
      includeWordFrequency: z.boolean().optional(),
      includeCharacterAnalysis: z.boolean().optional(),
      wordFrequencyLimit: z.number().min(1).max(100).optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  const start = Date.now()
  
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(request)
  if (rateLimitResponse) return rateLimitResponse
  
  // Validate request
  const { data, error } = await validateRequest(request, AnalysisSchema)
  if (error) return error
  
  try {
    const { text, options = {} } = data!
    
    // Check cache
    const cacheKey = getCacheKey('analyze', { text, options })
    const cached = await cache.get(cacheKey)
    if (cached) {
      return successResponse(cached, { cached: true })
    }
    
    // Perform analysis
    const analysis: any = {
      basicStats: {
        characters: analyzers.basicStats.countCharacters(text),
        charactersNoSpaces: analyzers.basicStats.countCharacters(text, false),
        words: analyzers.basicStats.countWords(text),
        sentences: analyzers.basicStats.countSentences(text),
        paragraphs: analyzers.basicStats.countParagraphs(text),
        lines: analyzers.basicStats.countLines(text),
        averageWordLength: analyzers.basicStats.averageWordLength(text),
        averageSentenceLength: analyzers.basicStats.averageSentenceLength(text),
      },
      readingTime: analyzers.readingTime.estimate(text),
      language: analyzers.language.detect(text),
    }
    
    if (options.includeReadability !== false) {
      analysis.readability = {
        fleschReadingEase: analyzers.readability.fleschReadingEase(text),
        fleschKincaidGrade: analyzers.readability.fleschKincaidGrade(text),
        gunningFog: analyzers.readability.gunningFog(text),
        colemanLiau: analyzers.readability.colemanLiau(text),
      }
    }
    
    if (options.includeWordFrequency) {
      analysis.wordFrequency = analyzers.wordFrequency.analyze(text, {
        maxResults: options.wordFrequencyLimit || 20,
      })
    }
    
    if (options.includeCharacterAnalysis) {
      analysis.characterTypes = analyzers.characterFrequency.getCharacterTypes(text)
      analysis.characterFrequency = analyzers.characterFrequency.analyze(text)
    }
    
    // Cache result
    await cache.set(cacheKey, analysis, 3600) // Cache for 1 hour
    
    const response = successResponse(analysis, {
      processingTime: Date.now() - start,
    })
    
    await logRequest(request, response, Date.now() - start)
    
    return response
  } catch (error) {
    return errorResponse('Failed to analyze text', 500, error)
  }
}

// Keyword density analysis
export async function PUT(request: NextRequest) {
  const KeywordSchema = z.object({
    text: z.string().min(1).max(100000),
    keywords: z.array(z.string()).min(1).max(50),
  })
  
  const { data, error } = await validateRequest(request, KeywordSchema)
  if (error) return error
  
  try {
    const { text, keywords } = data!
    const results = analyzers.keywordDensity.analyze(text, keywords)
    
    return successResponse({
      keywords: results,
      totalWords: analyzers.basicStats.countWords(text),
    })
  } catch (error) {
    return errorResponse('Failed to analyze keywords', 500, error)
  }
}
```

### 5. Create WebSocket Support for Real-time Processing

#### Create `src/app/api/v1/ws/route.ts`
```typescript
import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import { parse } from 'url'
import { caseConverters } from '@/lib/text-case/converters'
import { analyzers } from '@/lib/analysis/text-analyzers'

let wss: WebSocketServer | null = null

export function GET(request: Request) {
  if (!wss) {
    const server = createServer()
    wss = new WebSocketServer({ server })
    
    wss.on('connection', (ws, req) => {
      const { query } = parse(req.url || '', true)
      const apiKey = query.apiKey as string
      
      // Validate API key
      if (!validateApiKey(apiKey)) {
        ws.close(1008, 'Invalid API key')
        return
      }
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString())
          
          switch (message.type) {
            case 'case':
              handleCaseConversion(ws, message)
              break
            case 'analyze':
              handleAnalysis(ws, message)
              break
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong' }))
              break
            default:
              ws.send(JSON.stringify({ 
                type: 'error', 
                error: 'Unknown message type' 
              }))
          }
        } catch (error) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            error: 'Invalid message format' 
          }))
        }
      })
      
      ws.send(JSON.stringify({ 
        type: 'connected', 
        message: 'WebSocket connected' 
      }))
    })
    
    server.listen(3001)
  }
  
  return new Response('WebSocket server running', { status: 200 })
}

function handleCaseConversion(ws: any, message: any) {
  const { text, caseType } = message.payload
  
  try {
    const result = caseConverters[caseType as keyof typeof caseConverters](text)
    ws.send(JSON.stringify({
      type: 'case-result',
      result,
      original: text,
      caseType,
    }))
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Failed to convert text',
    }))
  }
}

function handleAnalysis(ws: any, message: any) {
  const { text } = message.payload
  
  try {
    // Send progress updates for long texts
    ws.send(JSON.stringify({
      type: 'analysis-progress',
      progress: 0,
      message: 'Starting analysis...',
    }))
    
    const stats = {
      characters: analyzers.basicStats.countCharacters(text),
      words: analyzers.basicStats.countWords(text),
      sentences: analyzers.basicStats.countSentences(text),
    }
    
    ws.send(JSON.stringify({
      type: 'analysis-progress',
      progress: 50,
      message: 'Calculating readability...',
    }))
    
    const readability = {
      fleschReadingEase: analyzers.readability.fleschReadingEase(text),
      fleschKincaidGrade: analyzers.readability.fleschKincaidGrade(text),
    }
    
    ws.send(JSON.stringify({
      type: 'analysis-result',
      stats,
      readability,
    }))
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Failed to analyze text',
    }))
  }
}

function validateApiKey(apiKey: string | undefined): boolean {
  // Implement API key validation
  return !!apiKey
}
```

### 6. Create API Documentation

#### Create `src/app/api/v1/docs/route.ts`
```typescript
import { NextResponse } from 'next/server'

const apiDocumentation = {
  openapi: '3.0.0',
  info: {
    title: 'Text Case Converter API',
    version: '1.0.0',
    description: 'API for text manipulation and analysis tools',
    contact: {
      email: 'api@textcaseconverter.com',
    },
  },
  servers: [
    {
      url: 'https://textcaseconverter.com/api/v1',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server',
    },
  ],
  paths: {
    '/case': {
      post: {
        summary: 'Convert text case',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  text: {
                    type: 'string',
                    description: 'Text to convert',
                  },
                  type: {
                    type: 'string',
                    enum: [
                      'uppercase',
                      'lowercase',
                      'titleCase',
                      'sentenceCase',
                      'camelCase',
                      'pascalCase',
                      'snakeCase',
                      'kebabCase',
                    ],
                  },
                },
                required: ['text', 'type'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Successful conversion',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        original: { type: 'string' },
                        converted: { type: 'string' },
                        type: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request',
          },
          429: {
            description: 'Rate limit exceeded',
          },
        },
      },
    },
    '/analyze': {
      post: {
        summary: 'Analyze text',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  text: {
                    type: 'string',
                    description: 'Text to analyze',
                  },
                  options: {
                    type: 'object',
                    properties: {
                      includeReadability: { type: 'boolean' },
                      includeWordFrequency: { type: 'boolean' },
                    },
                  },
                },
                required: ['text'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Analysis results',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      },
    },
  },
  security: [
    {
      ApiKeyAuth: [],
    },
  ],
}

export async function GET() {
  return NextResponse.json(apiDocumentation)
}
```

### 7. Create API Client SDK

#### Create `src/lib/api/client.ts`
```typescript
/**
 * Text Case Converter API Client
 */

export class TextConverterAPI {
  private baseURL: string
  private apiKey?: string
  
  constructor(options?: { baseURL?: string; apiKey?: string }) {
    this.baseURL = options?.baseURL || '/api/v1'
    this.apiKey = options?.apiKey
  }
  
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'X-API-Key': this.apiKey }),
      ...options?.headers,
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'API request failed')
    }
    
    return response.json()
  }
  
  // Case conversion
  async convertCase(text: string, type: string, options?: any) {
    return this.request('/case', {
      method: 'POST',
      body: JSON.stringify({ text, type, options }),
    })
  }
  
  async batchConvertCase(texts: string[], type: string, options?: any) {
    return this.request('/case', {
      method: 'PUT',
      body: JSON.stringify({ texts, type, options }),
    })
  }
  
  // Text analysis
  async analyzeText(text: string, options?: any) {
    return this.request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ text, options }),
    })
  }
  
  async analyzeKeywords(text: string, keywords: string[]) {
    return this.request('/analyze', {
      method: 'PUT',
      body: JSON.stringify({ text, keywords }),
    })
  }
  
  // Text formatting
  async formatText(text: string, operation: string, options?: any) {
    return this.request('/format', {
      method: 'POST',
      body: JSON.stringify({ text, operation, options }),
    })
  }
  
  // Encoding/Decoding
  async encode(text: string, type: string, options?: any) {
    return this.request('/encode', {
      method: 'POST',
      body: JSON.stringify({ text, type, options }),
    })
  }
  
  async decode(text: string, type: string, options?: any) {
    return this.request('/encode', {
      method: 'PUT',
      body: JSON.stringify({ text, type, options }),
    })
  }
  
  // WebSocket connection
  connectWebSocket(apiKey?: string): WebSocket {
    const wsUrl = this.baseURL.replace(/^http/, 'ws') + '/ws'
    const ws = new WebSocket(`${wsUrl}?apiKey=${apiKey || this.apiKey}`)
    
    return ws
  }
}

// Export singleton instance
export const api = new TextConverterAPI()
```

## Testing & Verification

1. Test all API endpoints with various inputs
2. Verify rate limiting works correctly
3. Test caching mechanism
4. Check WebSocket real-time updates
5. Validate error handling
6. Test batch operations
7. Verify API documentation accuracy

## Success Indicators
- ✅ All API endpoints functional
- ✅ Rate limiting prevents abuse
- ✅ Caching improves performance
- ✅ WebSocket provides real-time updates
- ✅ Proper error handling and status codes
- ✅ API documentation complete

## Next Steps
Proceed to Story 5.2: Unit and Integration Testing

## Notes
- Consider adding GraphQL endpoint
- Implement API key management system
- Add request queuing for heavy operations
- Consider adding webhook support
- Monitor API usage metrics