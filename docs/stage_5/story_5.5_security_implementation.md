# Story 5.5: Security Implementation

## Story Details
- **Stage**: 5 - Integration, Testing & Performance
- **Priority**: Critical
- **Estimated Hours**: 6-8 hours
- **Dependencies**: Story 5.4 (SEO Enhancement)

## Objective
Implement comprehensive security measures including input sanitization, CSRF protection, rate limiting, content security policies, and security monitoring. Ensure the application is protected against common web vulnerabilities and meets security best practices.

## Acceptance Criteria
- [ ] Input validation and sanitization
- [ ] XSS (Cross-Site Scripting) prevention
- [ ] CSRF (Cross-Site Request Forgery) protection
- [ ] SQL injection prevention
- [ ] Content Security Policy (CSP) headers
- [ ] Security headers implementation
- [ ] Rate limiting and DDoS protection
- [ ] Authentication and authorization
- [ ] Secure session management
- [ ] API security with JWT
- [ ] Security monitoring and alerting
- [ ] Vulnerability scanning integration

## Implementation Steps

### 1. Input Validation and Sanitization

#### Create `src/lib/security/validation.ts`
```typescript
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'
import validator from 'validator'

// Text input validation schemas
export const textInputSchemas = {
  // Basic text input (for conversion tools)
  basicText: z.string()
    .min(1, 'Text is required')
    .max(100000, 'Text is too long (max 100,000 characters)')
    .refine(
      (text) => !containsMaliciousPatterns(text),
      'Input contains potentially malicious content'
    ),
  
  // Email validation
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email is too long'),
  
  // URL validation
  url: z.string()
    .url('Invalid URL')
    .max(2048, 'URL is too long')
    .refine(
      (url) => isValidUrl(url),
      'URL contains invalid characters or protocol'
    ),
  
  // JSON validation
  json: z.string()
    .refine(
      (str) => {
        try {
          JSON.parse(str)
          return true
        } catch {
          return false
        }
      },
      'Invalid JSON format'
    )
    .refine(
      (str) => !containsJSONBomb(str),
      'JSON contains potentially malicious nested structures'
    ),
  
  // File name validation
  fileName: z.string()
    .max(255, 'File name is too long')
    .refine(
      (name) => /^[\w\-. ]+$/.test(name),
      'File name contains invalid characters'
    )
    .refine(
      (name) => !containsPathTraversal(name),
      'File name contains path traversal attempt'
    ),
  
  // API key validation
  apiKey: z.string()
    .length(32, 'Invalid API key length')
    .regex(/^[a-zA-Z0-9]+$/, 'Invalid API key format'),
}

// Malicious pattern detection
function containsMaliciousPatterns(text: string): boolean {
  const patterns = [
    // Script injection attempts
    /<script[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers
    
    // SQL injection patterns
    /(\b(union|select|insert|update|delete|drop|create)\b.*\b(from|where|table)\b)/gi,
    /(\b(or|and)\b.*=.*)/gi,
    
    // Command injection
    /[;&|`$]/g,
    
    // LDAP injection
    /[()&|!]/g,
  ]
  
  return patterns.some(pattern => pattern.test(text))
}

// URL validation
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Only allow http(s) protocols
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// JSON bomb detection
function containsJSONBomb(jsonStr: string): boolean {
  let depth = 0
  let inString = false
  let escaped = false
  
  for (const char of jsonStr) {
    if (!escaped) {
      if (char === '"') inString = !inString
      else if (!inString) {
        if (char === '{' || char === '[') depth++
        else if (char === '}' || char === ']') depth--
      }
    }
    escaped = !escaped && char === '\\'
    
    // Detect excessive nesting
    if (depth > 100) return true
  }
  
  // Check for excessive array/object sizes
  const arrayMatches = jsonStr.match(/\[[\s\S]*?\]/g) || []
  const objectMatches = jsonStr.match(/\{[\s\S]*?\}/g) || []
  
  return arrayMatches.some(m => m.length > 1000000) || 
         objectMatches.some(m => m.length > 1000000)
}

// Path traversal detection
function containsPathTraversal(path: string): boolean {
  const patterns = [
    /\.\./g,
    /\.\.%2F/gi,
    /\.\.%5C/gi,
    /%2E%2E/gi,
  ]
  
  return patterns.some(pattern => pattern.test(path))
}

// HTML sanitization
export function sanitizeHTML(html: string, options?: any): string {
  const defaultOptions = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ...options,
  }
  
  return DOMPurify.sanitize(html, defaultOptions)
}

// Input sanitization middleware
export function sanitizeInput<T extends Record<string, any>>(
  input: T,
  schema: z.ZodSchema<T>
): T {
  // Validate with Zod
  const validated = schema.parse(input)
  
  // Additional sanitization for string values
  const sanitized: any = {}
  
  for (const [key, value] of Object.entries(validated)) {
    if (typeof value === 'string') {
      // Remove null bytes
      let clean = value.replace(/\0/g, '')
      
      // Trim whitespace
      clean = clean.trim()
      
      // Escape HTML entities for display
      clean = validator.escape(clean)
      
      sanitized[key] = clean
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized as T
}

// File upload validation
export async function validateFileUpload(file: File): Promise<{
  valid: boolean
  error?: string
}> {
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size exceeds 10MB limit' }
  }
  
  // Check file type
  const allowedTypes = [
    'text/plain',
    'text/csv',
    'application/json',
    'application/xml',
    'text/xml',
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' }
  }
  
  // Check file extension
  const allowedExtensions = ['.txt', '.csv', '.json', '.xml']
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: 'File extension not allowed' }
  }
  
  // Scan file content for malicious patterns
  const content = await file.text()
  if (containsMaliciousPatterns(content)) {
    return { valid: false, error: 'File contains potentially malicious content' }
  }
  
  return { valid: true }
}
```

### 2. CSRF Protection

#### Create `src/lib/security/csrf.ts`
```typescript
import { createHash, randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

// Generate CSRF token
export function generateCSRFToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

// Create CSRF token hash
export function hashCSRFToken(token: string, secret: string): string {
  return createHash('sha256')
    .update(`${token}:${secret}`)
    .digest('hex')
}

// Set CSRF cookie
export async function setCSRFCookie(token: string): Promise<void> {
  const cookieStore = cookies()
  
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

// Verify CSRF token
export async function verifyCSRFToken(request: NextRequest): Promise<boolean> {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true
  }
  
  const cookieStore = cookies()
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  const bodyToken = await getBodyToken(request)
  
  // Token must be present in both cookie and header/body
  if (!cookieToken || (!headerToken && !bodyToken)) {
    return false
  }
  
  const providedToken = headerToken || bodyToken
  
  // Constant-time comparison
  return timingSafeEqual(cookieToken, providedToken)
}

// Get token from request body
async function getBodyToken(request: NextRequest): Promise<string | null> {
  try {
    const contentType = request.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      const body = await request.json()
      return body._csrf || null
    }
    
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const text = await request.text()
      const params = new URLSearchParams(text)
      return params.get('_csrf')
    }
    
    return null
  } catch {
    return null
  }
}

// Timing-safe string comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

// CSRF middleware
export async function csrfMiddleware(request: NextRequest): Promise<Response | null> {
  const isValid = await verifyCSRFToken(request)
  
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  
  return null
}

// React hook for CSRF token
export function useCSRFToken(): { token: string; header: string } {
  const [token, setToken] = React.useState('')
  
  React.useEffect(() => {
    // Get token from cookie or generate new one
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith(CSRF_COOKIE_NAME))
      ?.split('=')[1]
    
    if (cookieToken) {
      setToken(cookieToken)
    } else {
      // Request new token from server
      fetch('/api/csrf-token')
        .then(res => res.json())
        .then(data => setToken(data.token))
    }
  }, [])
  
  return { token, header: CSRF_HEADER_NAME }
}
```

### 3. Security Headers Implementation

#### Update `src/middleware.ts`
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { handleRedirects } from './middleware/redirects'
import { csrfMiddleware } from './lib/security/csrf'
import { rateLimitMiddleware } from './lib/security/rate-limit'

export async function middleware(request: NextRequest) {
  // Handle redirects
  const redirectResponse = handleRedirects(request)
  if (redirectResponse) return redirectResponse
  
  // Apply rate limiting
  const rateLimitResponse = await rateLimitMiddleware(request)
  if (rateLimitResponse) return rateLimitResponse
  
  // Apply CSRF protection
  const csrfResponse = await csrfMiddleware(request)
  if (csrfResponse) return csrfResponse
  
  // Create response
  const response = NextResponse.next()
  
  // Security headers
  const securityHeaders = {
    // Prevent XSS
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    
    // HSTS (Strict Transport Security)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Content Security Policy
    'Content-Security-Policy': generateCSP(request),
    
    // Additional security headers
    'X-DNS-Prefetch-Control': 'on',
    'X-Permitted-Cross-Domain-Policies': 'none',
  }
  
  // Apply headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

function generateCSP(request: NextRequest): string {
  const isDev = process.env.NODE_ENV === 'development'
  const nonce = generateNonce()
  
  // Store nonce for use in components
  request.headers.set('x-nonce', nonce)
  
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      'https://*.googletagmanager.com',
      'https://*.google-analytics.com',
      'https://pagead2.googlesyndication.com',
      'https://*.grow.me',
      isDev && "'unsafe-eval'",
    ].filter(Boolean),
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind
      'https://fonts.googleapis.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://*.googleusercontent.com',
      'https://*.google-analytics.com',
      'https://*.doubleclick.net',
    ],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      'https://*.google-analytics.com',
      'https://*.doubleclick.net',
      'https://*.googleapis.com',
      'wss://*.textcaseconverter.com',
      isDev && 'ws://localhost:*',
    ].filter(Boolean),
    'media-src': ["'none'"],
    'object-src': ["'none'"],
    'child-src': ["'self'"],
    'frame-src': [
      "'self'",
      'https://fundingchoicesmessages.google.com',
    ],
    'frame-ancestors': ["'none'"],
    'form-action': ["'self'"],
    'base-uri': ["'self'"],
    'manifest-src': ["'self'"],
    'upgrade-insecure-requests': !isDev ? [''] : undefined,
    'block-all-mixed-content': !isDev ? [''] : undefined,
  }
  
  return Object.entries(directives)
    .filter(([_, values]) => values !== undefined)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64')
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 4. Authentication and Session Management

#### Create `src/lib/auth/session.ts`
```typescript
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import * as argon2 from 'argon2'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const SESSION_COOKIE = 'session'
const REFRESH_COOKIE = 'refresh'

interface SessionPayload {
  userId: string
  email: string
  role: 'user' | 'admin'
  exp: number
  iat: number
}

// Create session tokens
export async function createSession(user: {
  id: string
  email: string
  role: 'user' | 'admin'
}): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET)
  
  const refreshToken = await new SignJWT({
    userId: user.id,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
  
  return { accessToken, refreshToken }
}

// Set session cookies
export async function setSessionCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = cookies()
  
  cookieStore.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15, // 15 minutes
    path: '/',
  })
  
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

// Verify session
export async function verifySession(
  request: NextRequest
): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    
    if (!token) return null
    
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as SessionPayload
  } catch {
    // Try to refresh token
    return refreshSession(request)
  }
}

// Refresh session
async function refreshSession(
  request: NextRequest
): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value
    
    if (!refreshToken) return null
    
    const { payload } = await jwtVerify(refreshToken, JWT_SECRET)
    
    if (payload.type !== 'refresh') return null
    
    // Get user from database
    const user = await getUserById(payload.userId as string)
    if (!user) return null
    
    // Create new session
    const { accessToken, refreshToken: newRefreshToken } = await createSession(user)
    await setSessionCookies(accessToken, newRefreshToken)
    
    // Return user data
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 15 * 60 * 1000,
      iat: Date.now(),
    }
  } catch {
    return null
  }
}

// Logout
export async function logout(): Promise<void> {
  const cookieStore = cookies()
  cookieStore.delete(SESSION_COOKIE)
  cookieStore.delete(REFRESH_COOKIE)
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  })
}

// Password verification
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch {
    return false
  }
}

// Session validation middleware
export function requireAuth(
  handler: (req: NextRequest, session: SessionPayload) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    const session = await verifySession(req)
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    return handler(req, session)
  }
}

// Role-based access control
export function requireRole(
  role: 'user' | 'admin',
  handler: (req: NextRequest, session: SessionPayload) => Promise<Response>
) {
  return requireAuth(async (req, session) => {
    if (session.role !== role && session.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    
    return handler(req, session)
  })
}
```

### 5. API Security

#### Create `src/lib/security/api-security.ts`
```typescript
import { createHash, randomBytes } from 'crypto'
import { NextRequest } from 'next/server'
import { z } from 'zod'

// API key management
interface APIKey {
  id: string
  key: string
  name: string
  permissions: string[]
  rateLimit: number
  expiresAt?: Date
  lastUsedAt?: Date
}

// Generate API key
export function generateAPIKey(): string {
  return randomBytes(32).toString('hex')
}

// Hash API key for storage
export function hashAPIKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

// Validate API key
export async function validateAPIKey(
  key: string
): Promise<APIKey | null> {
  const hashedKey = hashAPIKey(key)
  
  // Get API key from database
  const apiKey = await db.apiKey.findUnique({
    where: { hashedKey },
    include: { permissions: true },
  })
  
  if (!apiKey) return null
  
  // Check expiration
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null
  }
  
  // Update last used
  await db.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })
  
  return {
    id: apiKey.id,
    key,
    name: apiKey.name,
    permissions: apiKey.permissions.map(p => p.name),
    rateLimit: apiKey.rateLimit,
    expiresAt: apiKey.expiresAt,
    lastUsedAt: apiKey.lastUsedAt,
  }
}

// API authentication middleware
export async function authenticateAPI(
  request: NextRequest
): Promise<{ authenticated: boolean; apiKey?: APIKey; error?: string }> {
  const authHeader = request.headers.get('authorization')
  const apiKeyHeader = request.headers.get('x-api-key')
  
  // Check Bearer token
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const apiKey = await validateAPIKey(token)
    
    if (!apiKey) {
      return { authenticated: false, error: 'Invalid API key' }
    }
    
    return { authenticated: true, apiKey }
  }
  
  // Check X-API-Key header
  if (apiKeyHeader) {
    const apiKey = await validateAPIKey(apiKeyHeader)
    
    if (!apiKey) {
      return { authenticated: false, error: 'Invalid API key' }
    }
    
    return { authenticated: true, apiKey }
  }
  
  return { authenticated: false, error: 'API key required' }
}

// Permission checking
export function hasPermission(
  apiKey: APIKey,
  requiredPermission: string
): boolean {
  return (
    apiKey.permissions.includes('*') ||
    apiKey.permissions.includes(requiredPermission)
  )
}

// Request signing for webhooks
export function signRequest(
  payload: any,
  secret: string
): { signature: string; timestamp: number } {
  const timestamp = Date.now()
  const message = `${timestamp}.${JSON.stringify(payload)}`
  const signature = createHash('sha256')
    .update(`${message}.${secret}`)
    .digest('hex')
  
  return { signature, timestamp }
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: any,
  signature: string,
  timestamp: number,
  secret: string
): boolean {
  // Check timestamp (5 minute window)
  if (Math.abs(Date.now() - timestamp) > 5 * 60 * 1000) {
    return false
  }
  
  const message = `${timestamp}.${JSON.stringify(payload)}`
  const expectedSignature = createHash('sha256')
    .update(`${message}.${secret}`)
    .digest('hex')
  
  // Timing-safe comparison
  return timingSafeEqual(signature, expectedSignature)
}

// Input validation schemas for API
export const apiSchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(['asc', 'desc']).default('desc'),
    sortBy: z.string().optional(),
  }),
  
  // Date range
  dateRange: z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }).refine(
    (data) => {
      if (data.from && data.to) {
        return data.from <= data.to
      }
      return true
    },
    { message: 'From date must be before to date' }
  ),
  
  // Search
  search: z.object({
    q: z.string().min(1).max(100),
    fields: z.array(z.string()).optional(),
    fuzzy: z.boolean().optional(),
  }),
}

// API response helpers
export function apiResponse<T>(
  data: T,
  meta?: Record<string, any>
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      ...(meta && { meta }),
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  )
}

export function apiError(
  message: string,
  status = 500,
  code?: string
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        message,
        ...(code && { code }),
      },
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
      },
    }
  )
}

// Timing-safe string comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}
```

### 6. Security Monitoring

#### Create `src/lib/security/monitoring.ts`
```typescript
import { NextRequest } from 'next/server'
import winston from 'winston'
import { WebClient } from '@slack/web-api'

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
})

// Initialize Slack client for alerts
const slack = new WebClient(process.env.SLACK_TOKEN)
const SECURITY_CHANNEL = process.env.SLACK_SECURITY_CHANNEL || '#security-alerts'

// Security event types
export enum SecurityEventType {
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  MALICIOUS_INPUT = 'MALICIOUS_INPUT',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  API_ABUSE = 'API_ABUSE',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  PATH_TRAVERSAL_ATTEMPT = 'PATH_TRAVERSAL_ATTEMPT',
}

// Log security event
export async function logSecurityEvent(
  type: SecurityEventType,
  request: NextRequest,
  details: Record<string, any> = {}
): Promise<void> {
  const event = {
    type,
    timestamp: new Date().toISOString(),
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent'),
    url: request.url,
    method: request.method,
    ...details,
  }
  
  // Log to file
  logger.warn('Security Event', event)
  
  // Store in database
  await storeSecurityEvent(event)
  
  // Send alerts for critical events
  if (shouldAlert(type)) {
    await sendSecurityAlert(event)
  }
  
  // Check for patterns
  await analyzeSecurityPatterns(event)
}

// Store security event in database
async function storeSecurityEvent(event: any): Promise<void> {
  try {
    await db.securityEvent.create({
      data: {
        type: event.type,
        ip: event.ip,
        userAgent: event.userAgent,
        url: event.url,
        method: event.method,
        details: event,
        createdAt: new Date(event.timestamp),
      },
    })
  } catch (error) {
    logger.error('Failed to store security event', error)
  }
}

// Determine if event should trigger alert
function shouldAlert(type: SecurityEventType): boolean {
  const criticalEvents = [
    SecurityEventType.SQL_INJECTION_ATTEMPT,
    SecurityEventType.XSS_ATTEMPT,
    SecurityEventType.PATH_TRAVERSAL_ATTEMPT,
    SecurityEventType.SUSPICIOUS_ACTIVITY,
  ]
  
  return criticalEvents.includes(type)
}

// Send security alert
async function sendSecurityAlert(event: any): Promise<void> {
  try {
    await slack.chat.postMessage({
      channel: SECURITY_CHANNEL,
      text: `🚨 Security Alert: ${event.type}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚨 Security Alert: ${event.type}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Time:*\n${event.timestamp}`,
            },
            {
              type: 'mrkdwn',
              text: `*IP:*\n${event.ip}`,
            },
            {
              type: 'mrkdwn',
              text: `*URL:*\n${event.url}`,
            },
            {
              type: 'mrkdwn',
              text: `*Method:*\n${event.method}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Details:*\n\`\`\`${JSON.stringify(event.details, null, 2)}\`\`\``,
          },
        },
      ],
    })
  } catch (error) {
    logger.error('Failed to send security alert', error)
  }
}

// Analyze security patterns
async function analyzeSecurityPatterns(event: any): Promise<void> {
  const recentEvents = await db.securityEvent.count({
    where: {
      ip: event.ip,
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      },
    },
  })
  
  // Block IP if too many security events
  if (recentEvents > 10) {
    await blockIP(event.ip)
    await logSecurityEvent(
      SecurityEventType.SUSPICIOUS_ACTIVITY,
      event.request,
      { reason: 'Too many security events', blockedIP: event.ip }
    )
  }
}

// IP blocking
const blockedIPs = new Set<string>()

export async function blockIP(ip: string): Promise<void> {
  blockedIPs.add(ip)
  
  // Store in database
  await db.blockedIP.create({
    data: {
      ip,
      reason: 'Automated security block',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  })
  
  logger.info(`Blocked IP: ${ip}`)
}

export function isIPBlocked(ip: string): boolean {
  return blockedIPs.has(ip)
}

// Security metrics
export async function getSecurityMetrics(): Promise<{
  events24h: number
  topEventTypes: Array<{ type: string; count: number }>
  topIPs: Array<{ ip: string; count: number }>
  blockedIPs: number
}> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  const events = await db.securityEvent.findMany({
    where: { createdAt: { gte: since } },
  })
  
  // Aggregate by type
  const typeCount = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topEventTypes = Object.entries(typeCount)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  // Aggregate by IP
  const ipCount = events.reduce((acc, event) => {
    acc[event.ip] = (acc[event.ip] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topIPs = Object.entries(ipCount)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  return {
    events24h: events.length,
    topEventTypes,
    topIPs,
    blockedIPs: blockedIPs.size,
  }
}
```

## Testing & Verification

1. Test input validation with malicious inputs
2. Verify CSRF protection on all forms
3. Check security headers in response
4. Test rate limiting
5. Verify authentication flows
6. Scan for vulnerabilities

## Success Indicators
- ✅ All inputs validated and sanitized
- ✅ CSRF protection on all state-changing operations
- ✅ Security headers present on all responses
- ✅ Authentication and authorization working
- ✅ Security monitoring active
- ✅ No critical vulnerabilities found

## Next Steps
Proceed to Story 5.6: Deployment & CI/CD Setup

## Notes
- Regular security audits needed
- Keep dependencies updated
- Monitor security advisories
- Implement bug bounty program
- Regular penetration testing