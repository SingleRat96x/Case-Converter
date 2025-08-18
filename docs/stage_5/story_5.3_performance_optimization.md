# Story 5.3: Performance Optimization

## Story Details
- **Stage**: 5 - Integration, Testing & Performance
- **Priority**: High
- **Estimated Hours**: 6-8 hours
- **Dependencies**: Story 5.2 (Testing)

## Objective
Optimize application performance through code splitting, lazy loading, caching strategies, and resource optimization. Achieve Lighthouse scores of 90+ across all metrics and ensure smooth performance even with large text inputs.

## Acceptance Criteria
- [ ] Lighthouse Performance score 90+
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size optimization (< 200KB initial)
- [ ] Image optimization and lazy loading
- [ ] Code splitting for tools
- [ ] Service Worker implementation
- [ ] CDN integration
- [ ] Database query optimization
- [ ] Memory leak prevention
- [ ] Virtual scrolling for large lists
- [ ] Web Workers for heavy computations

## Implementation Steps

### 1. Bundle Size Optimization

#### Update `next.config.mjs`
```javascript
import { withSentryConfig } from '@sentry/nextjs'
import withBundleAnalyzer from '@next/bundle-analyzer'

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable modularize imports for smaller bundles
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
    'lodash': {
      transform: 'lodash/{{member}}',
    },
  },
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/*', 'lucide-react'],
  },
  
  // Compression
  compress: true,
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  webpack: (config, { dev, isServer }) => {
    // Tree shaking optimization
    if (!dev && !isServer) {
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
    }
    
    return config
  },
}

export default bundleAnalyzer(nextConfig)
```

### 2. Code Splitting and Lazy Loading

#### Create `src/components/tools/tool-loader.tsx`
```typescript
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Loading component
const ToolSkeleton = () => (
  <Card className="w-full">
    <CardHeader>
      <Skeleton className="h-8 w-64" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </CardContent>
  </Card>
)

// Lazy load tools with custom loading states
export const tools = {
  // Case converters
  uppercase: dynamic(
    () => import('./case-converters/uppercase-tool').then(mod => mod.UppercaseTool),
    { loading: () => <ToolSkeleton />, ssr: false }
  ),
  
  multiCase: dynamic(
    () => import('./case-converters/multi-case-tool').then(mod => mod.MultiCaseTool),
    { loading: () => <ToolSkeleton />, ssr: false }
  ),
  
  batchCase: dynamic(
    () => import('./case-converters/batch-case-tool').then(mod => mod.BatchCaseTool),
    { loading: () => <ToolSkeleton />, ssr: false }
  ),
  
  // Text formatters
  removeSpaces: dynamic(
    () => import('./text-format/remove-spaces-tool').then(mod => mod.RemoveSpacesTool),
    { loading: () => <ToolSkeleton />, ssr: false }
  ),
  
  sortLines: dynamic(
    () => import('./text-format/sort-lines-tool').then(mod => mod.SortLinesTool),
    { loading: () => <ToolSkeleton />, ssr: false }
  ),
  
  // Encoding tools
  base64: dynamic(
    () => import('./encoding/base64-tool').then(mod => mod.Base64Tool),
    { loading: () => <ToolSkeleton />, ssr: false }
  ),
  
  // Generators
  loremIpsum: dynamic(
    () => import('./generators/lorem-ipsum-tool').then(mod => mod.LoremIpsumTool),
    { loading: () => <ToolSkeleton />, ssr: false }
  ),
  
  passwordGenerator: dynamic(
    () => import('./generators/password-generator-tool').then(mod => mod.PasswordGeneratorTool),
    { loading: () => <ToolSkeleton />, ssr: false }
  ),
  
  // Analysis tools
  textStatistics: dynamic(
    () => import('./analysis/text-statistics-tool').then(mod => mod.TextStatisticsTool),
    { loading: () => <ToolSkeleton />, ssr: false }
  ),
  
  // Advanced tools
  textDiff: dynamic(
    () => import('./advanced/text-diff-tool').then(mod => mod.TextDiffTool),
    { loading: () => <ToolSkeleton />, ssr: false }
  ),
  
  jsonFormatter: dynamic(
    () => import('./advanced/json-formatter-tool').then(mod => mod.JsonFormatterTool),
    { loading: () => <ToolSkeleton />, ssr: false }
  ),
}

// Preload critical tools
export const preloadCriticalTools = () => {
  // Preload most commonly used tools
  const criticalTools = ['uppercase', 'multiCase', 'base64', 'jsonFormatter']
  
  criticalTools.forEach(toolName => {
    if (tools[toolName as keyof typeof tools]) {
      tools[toolName as keyof typeof tools].preload()
    }
  })
}
```

### 3. Web Workers for Heavy Computations

#### Create `src/workers/text-processor.worker.ts`
```typescript
import { caseConverters } from '@/lib/text-case/converters'
import { analyzers } from '@/lib/analysis/text-analyzers'
import { advancedManipulators } from '@/lib/advanced/text-manipulators'

// Message types
interface WorkerMessage {
  id: string
  type: 'case' | 'analyze' | 'diff' | 'batch'
  payload: any
}

interface WorkerResponse {
  id: string
  result?: any
  error?: string
}

// Handle messages
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data
  
  try {
    let result: any
    
    switch (type) {
      case 'case':
        result = await processCase(payload)
        break
      
      case 'analyze':
        result = await processAnalysis(payload)
        break
      
      case 'diff':
        result = await processDiff(payload)
        break
      
      case 'batch':
        result = await processBatch(payload)
        break
      
      default:
        throw new Error(`Unknown message type: ${type}`)
    }
    
    self.postMessage({ id, result } as WorkerResponse)
  } catch (error) {
    self.postMessage({ 
      id, 
      error: error instanceof Error ? error.message : 'Processing failed' 
    } as WorkerResponse)
  }
})

async function processCase(payload: any) {
  const { text, caseType, options } = payload
  
  // Add progress reporting for large texts
  if (text.length > 10000) {
    // Split into chunks for progress reporting
    const chunkSize = 1000
    const chunks = Math.ceil(text.length / chunkSize)
    let processed = ''
    
    for (let i = 0; i < chunks; i++) {
      const chunk = text.slice(i * chunkSize, (i + 1) * chunkSize)
      processed += caseConverters[caseType as keyof typeof caseConverters](chunk)
      
      // Report progress
      self.postMessage({
        id: 'progress',
        result: { progress: ((i + 1) / chunks) * 100 }
      })
    }
    
    return processed
  }
  
  return caseConverters[caseType as keyof typeof caseConverters](text, options)
}

async function processAnalysis(payload: any) {
  const { text, options } = payload
  return analyzers.fullAnalysis(text)
}

async function processDiff(payload: any) {
  const { text1, text2, type } = payload
  
  switch (type) {
    case 'lines':
      return advancedManipulators.diff.compareLines(text1, text2)
    case 'words':
      return advancedManipulators.diff.compareWords(text1, text2)
    case 'chars':
      return advancedManipulators.diff.compareChars(text1, text2)
    default:
      throw new Error(`Unknown diff type: ${type}`)
  }
}

async function processBatch(payload: any) {
  const { texts, operation, options } = payload
  const results: any[] = []
  
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i]
    let result: any
    
    switch (operation.type) {
      case 'case':
        result = caseConverters[operation.caseType as keyof typeof caseConverters](text)
        break
      default:
        result = text
    }
    
    results.push(result)
    
    // Report progress
    self.postMessage({
      id: 'progress',
      result: { progress: ((i + 1) / texts.length) * 100 }
    })
  }
  
  return results
}
```

#### Create `src/hooks/useWebWorker.ts`
```typescript
import { useEffect, useRef, useState, useCallback } from 'react'

interface UseWebWorkerOptions {
  onProgress?: (progress: number) => void
  onError?: (error: string) => void
}

export function useWebWorker(options?: UseWebWorkerOptions) {
  const workerRef = useRef<Worker | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const messageIdRef = useRef(0)
  const pendingMessagesRef = useRef<Map<string, (result: any) => void>>(new Map())

  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL('../workers/text-processor.worker.ts', import.meta.url)
    )

    // Handle messages
    workerRef.current.addEventListener('message', (event) => {
      const { id, result, error } = event.data

      if (id === 'progress' && options?.onProgress) {
        options.onProgress(result.progress)
        return
      }

      const handler = pendingMessagesRef.current.get(id)
      if (handler) {
        if (error) {
          options?.onError?.(error)
        } else {
          handler(result)
        }
        pendingMessagesRef.current.delete(id)
      }
    })

    return () => {
      workerRef.current?.terminate()
    }
  }, [options])

  const process = useCallback(
    async <T = any>(type: string, payload: any): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'))
          return
        }

        const id = String(++messageIdRef.current)
        pendingMessagesRef.current.set(id, resolve)

        setIsProcessing(true)
        workerRef.current.postMessage({ id, type, payload })

        // Cleanup after processing
        setTimeout(() => {
          setIsProcessing(false)
          pendingMessagesRef.current.delete(id)
        }, 30000) // 30 second timeout
      })
    },
    []
  )

  return { process, isProcessing }
}
```

### 4. React Query for Data Caching

#### Create `src/lib/query-client.ts`
```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      
      // Retry failed requests
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false
        return failureCount < 3
      },
      
      // Refetch on window focus in production
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    },
  },
})

// Prefetch common data
export const prefetchCommonData = async () => {
  // Prefetch tool metadata
  await queryClient.prefetchQuery({
    queryKey: ['tools', 'metadata'],
    queryFn: async () => {
      const response = await fetch('/api/v1/tools')
      return response.json()
    },
  })
  
  // Prefetch translations for current locale
  const locale = document.documentElement.lang || 'en'
  await queryClient.prefetchQuery({
    queryKey: ['translations', locale],
    queryFn: async () => {
      const response = await fetch(`/api/v1/translations/${locale}`)
      return response.json()
    },
  })
}
```

### 5. Service Worker Implementation

#### Create `public/sw.js`
```javascript
const CACHE_NAME = 'text-converter-v1'
const STATIC_CACHE_NAME = 'text-converter-static-v1'
const DYNAMIC_CACHE_NAME = 'text-converter-dynamic-v1'

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/fonts/inter-var.woff2',
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName.startsWith('text-converter-') &&
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME
            )
          })
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )
  self.clients.claim()
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API calls - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone()
          
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })
          
          return response
        })
        .catch(() => {
          return caches.match(request)
        })
    )
    return
  }

  // Static assets - Cache first, network fallback
  if (request.destination === 'image' || 
      request.destination === 'font' ||
      url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((response) => {
          return caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, response.clone())
            return response
          })
        })
      })
    )
    return
  }

  // HTML pages - Network first, cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, response.clone())
            return response
          })
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || caches.match('/offline.html')
          })
        })
    )
    return
  }

  // Default - Network first
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request)
    })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-conversions') {
    event.waitUntil(syncOfflineConversions())
  }
})

async function syncOfflineConversions() {
  const db = await openDB()
  const tx = db.transaction('pending-conversions', 'readonly')
  const store = tx.objectStore('pending-conversions')
  const conversions = await store.getAll()
  
  for (const conversion of conversions) {
    try {
      await fetch('/api/v1/case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversion),
      })
      
      // Remove from pending
      const deleteTx = db.transaction('pending-conversions', 'readwrite')
      await deleteTx.objectStore('pending-conversions').delete(conversion.id)
    } catch (error) {
      console.error('Failed to sync conversion:', error)
    }
  }
}
```

### 6. Memory Management and Virtual Scrolling

#### Create `src/components/ui/virtual-list.tsx`
```typescript
import * as React from 'react'
import { useVirtual } from '@tanstack/react-virtual'

interface VirtualListProps<T> {
  items: T[]
  height: number
  itemHeight: number | ((index: number) => number)
  renderItem: (item: T, index: number) => React.ReactNode
  overscan?: number
  className?: string
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className,
}: VirtualListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null)
  
  const rowVirtualizer = useVirtual({
    size: items.length,
    parentRef,
    estimateSize: React.useCallback(
      (index) => {
        return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight
      },
      [itemHeight]
    ),
    overscan,
  })

  return (
    <div
      ref={parentRef}
      className={className}
      style={{ height, overflow: 'auto' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.virtualItems.map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  )
}

// Usage example for word frequency list
export function WordFrequencyList({ words }: { words: Array<{ word: string; count: number }> }) {
  return (
    <VirtualList
      items={words}
      height={400}
      itemHeight={40}
      renderItem={(item) => (
        <div className="flex items-center justify-between p-2 border-b">
          <span>{item.word}</span>
          <span className="text-muted-foreground">{item.count}</span>
        </div>
      )}
    />
  )
}
```

### 7. Image Optimization

#### Create `src/components/ui/optimized-image.tsx`
```typescript
import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  onLoad?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  onLoad,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {error ? (
        <div className="flex items-center justify-center h-full bg-muted">
          <span className="text-muted-foreground">Failed to load image</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          onLoadingComplete={() => {
            setIsLoading(false)
            onLoad?.()
          }}
          onError={() => {
            setIsLoading(false)
            setError(true)
          }}
          className={cn(
            'duration-700 ease-in-out',
            isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'
          )}
        />
      )}
    </div>
  )
}

// Lazy load images in viewport
export function LazyImage(props: OptimizedImageProps) {
  const [isInView, setIsInView] = useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref}>
      {isInView ? (
        <OptimizedImage {...props} />
      ) : (
        <div className={cn('bg-muted', props.className)} />
      )}
    </div>
  )
}
```

### 8. Performance Monitoring

#### Create `src/lib/performance.ts`
```typescript
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals'

interface PerformanceMetrics {
  cls?: number
  fid?: number
  lcp?: number
  fcp?: number
  ttfb?: number
  [key: string]: number | undefined
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private observers: Array<() => void> = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeVitals()
      this.measureCustomMetrics()
    }
  }

  private initializeVitals() {
    getCLS((metric) => this.updateMetric('cls', metric.value))
    getFID((metric) => this.updateMetric('fid', metric.value))
    getLCP((metric) => this.updateMetric('lcp', metric.value))
    getFCP((metric) => this.updateMetric('fcp', metric.value))
    getTTFB((metric) => this.updateMetric('ttfb', metric.value))
  }

  private updateMetric(name: string, value: number) {
    this.metrics[name] = value
    this.notifyObservers()
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'web_vitals', {
        event_category: 'performance',
        event_label: name,
        value: Math.round(value),
      })
    }
  }

  private measureCustomMetrics() {
    // Time to first tool interaction
    if (window.performance && window.performance.mark) {
      window.addEventListener('tool-interaction', () => {
        window.performance.mark('first-tool-interaction')
        window.performance.measure(
          'time-to-first-tool-interaction',
          'navigationStart',
          'first-tool-interaction'
        )
        
        const measure = window.performance.getEntriesByName(
          'time-to-first-tool-interaction'
        )[0]
        
        if (measure) {
          this.updateMetric('firstToolInteraction', measure.duration)
        }
      }, { once: true })
    }
  }

  public subscribe(callback: () => void) {
    this.observers.push(callback)
    return () => {
      this.observers = this.observers.filter(cb => cb !== callback)
    }
  }

  private notifyObservers() {
    this.observers.forEach(callback => callback())
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  public measureOperation<T>(
    name: string,
    operation: () => T | Promise<T>
  ): T | Promise<T> {
    const start = performance.now()
    
    try {
      const result = operation()
      
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - start
          this.updateMetric(`operation.${name}`, duration)
        })
      }
      
      const duration = performance.now() - start
      this.updateMetric(`operation.${name}`, duration)
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.updateMetric(`operation.${name}.error`, duration)
      throw error
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()

// React hook for performance metrics
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = React.useState(performanceMonitor.getMetrics())
  
  React.useEffect(() => {
    return performanceMonitor.subscribe(() => {
      setMetrics(performanceMonitor.getMetrics())
    })
  }, [])
  
  return metrics
}

// Performance optimization utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Memory leak prevention
export function useCleanup(cleanup: () => void) {
  React.useEffect(() => {
    return cleanup
  }, [cleanup])
}
```

## Testing & Verification

1. Run Lighthouse audits
2. Test with slow 3G throttling
3. Verify bundle sizes
4. Check memory usage over time
5. Test with large datasets
6. Verify service worker functionality

## Success Indicators
- ✅ Lighthouse scores 90+ across all metrics
- ✅ Initial bundle < 200KB
- ✅ FCP < 1.5s, TTI < 3s
- ✅ No memory leaks detected
- ✅ Smooth scrolling with 10k+ items
- ✅ Offline functionality working

## Next Steps
Proceed to Story 5.4: SEO Enhancement & Monitoring

## Notes
- Monitor real user metrics (RUM)
- Consider edge caching with Vercel
- Add resource hints (preconnect, prefetch)
- Implement progressive enhancement
- Monitor Core Web Vitals