# Story 6.1: Analytics & User Tracking Implementation

## Story Details
- **Stage**: 6 - Post-Launch Tasks
- **Priority**: High
- **Estimated Hours**: 4-6 hours
- **Dependencies**: Stage 5 Complete

## Objective
Implement comprehensive analytics and user tracking to understand user behavior, track conversions, and measure the success of text tools. Set up Google Analytics 4, custom events, conversion tracking, and privacy-compliant user tracking.

## Acceptance Criteria
- [ ] Google Analytics 4 integration
- [ ] Custom event tracking for all tools
- [ ] Conversion funnel tracking
- [ ] User behavior analytics
- [ ] Real User Monitoring (RUM)
- [ ] Privacy-compliant tracking (GDPR/CCPA)
- [ ] Analytics dashboard
- [ ] A/B testing framework
- [ ] Heatmap integration
- [ ] Error tracking and reporting
- [ ] Performance analytics
- [ ] Multi-language analytics

## Implementation Steps

### 1. Google Analytics 4 Setup

#### Create `src/lib/analytics/google-analytics.ts`
```typescript
import { gtag } from '@/types/gtag'

declare global {
  interface Window {
    gtag: gtag
    dataLayer: any[]
  }
}

// GA4 Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Initialize Google Analytics
export function initializeGA(): void {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) return
  
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: window.location.pathname,
    cookie_flags: 'SameSite=None;Secure',
    anonymize_ip: true, // GDPR compliance
  })
}

// Page view tracking
export function trackPageView(url: string): void {
  if (typeof window === 'undefined' || !window.gtag) return
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  })
}

// Custom event tracking
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number,
  additionalParams?: Record<string, any>
): void {
  if (typeof window === 'undefined' || !window.gtag) return
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...additionalParams,
  })
}

// Enhanced ecommerce events (for tool usage as "products")
export function trackToolUsage(
  toolId: string,
  toolName: string,
  category: string,
  action: 'view' | 'use' | 'complete'
): void {
  const eventMap = {
    view: 'view_item',
    use: 'add_to_cart',
    complete: 'purchase',
  }
  
  window.gtag('event', eventMap[action], {
    currency: 'USD',
    value: 0,
    items: [
      {
        item_id: toolId,
        item_name: toolName,
        item_category: category,
        quantity: 1,
        price: 0,
      },
    ],
  })
}

// User properties
export function setUserProperties(properties: Record<string, any>): void {
  if (typeof window === 'undefined' || !window.gtag) return
  
  window.gtag('set', 'user_properties', properties)
}

// Conversion tracking
export function trackConversion(
  conversionId: string,
  value?: number,
  currency = 'USD'
): void {
  if (typeof window === 'undefined' || !window.gtag) return
  
  window.gtag('event', 'conversion', {
    send_to: `${GA_MEASUREMENT_ID}/${conversionId}`,
    value,
    currency,
  })
}

// Exception tracking
export function trackException(
  description: string,
  fatal = false
): void {
  if (typeof window === 'undefined' || !window.gtag) return
  
  window.gtag('event', 'exception', {
    description,
    fatal,
  })
}

// Timing events
export function trackTiming(
  name: string,
  value: number,
  category?: string,
  label?: string
): void {
  if (typeof window === 'undefined' || !window.gtag) return
  
  window.gtag('event', 'timing_complete', {
    name,
    value,
    event_category: category,
    event_label: label,
  })
}
```

### 2. Custom Analytics Provider

#### Create `src/providers/analytics-provider.tsx`
```typescript
'use client'

import * as React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initializeGA, trackPageView, setUserProperties } from '@/lib/analytics/google-analytics'
import { initializeHotjar } from '@/lib/analytics/hotjar'
import { initializeMixpanel } from '@/lib/analytics/mixpanel'
import { useConsent } from '@/hooks/use-consent'

interface AnalyticsContextValue {
  trackEvent: (name: string, properties?: Record<string, any>) => void
  trackToolUsage: (toolId: string, action: string, metadata?: any) => void
  trackError: (error: Error, context?: any) => void
  trackPerformance: (metric: string, value: number) => void
  setUserTraits: (traits: Record<string, any>) => void
}

const AnalyticsContext = React.createContext<AnalyticsContextValue | null>(null)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { hasConsent, consentPreferences } = useConsent()
  const [userId, setUserId] = React.useState<string | null>(null)
  
  // Initialize analytics on mount
  React.useEffect(() => {
    if (!hasConsent('analytics')) return
    
    initializeGA()
    initializeHotjar()
    initializeMixpanel()
    
    // Set user ID from localStorage or generate new
    const storedUserId = localStorage.getItem('analytics_user_id')
    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      const newUserId = generateUserId()
      localStorage.setItem('analytics_user_id', newUserId)
      setUserId(newUserId)
    }
  }, [hasConsent])
  
  // Track page views
  React.useEffect(() => {
    if (!hasConsent('analytics')) return
    
    const url = pathname + searchParams.toString()
    trackPageView(url)
    
    // Track in other analytics platforms
    if (window.mixpanel) {
      window.mixpanel.track('Page View', {
        path: pathname,
        url,
        referrer: document.referrer,
      })
    }
  }, [pathname, searchParams, hasConsent])
  
  // Set user properties when userId changes
  React.useEffect(() => {
    if (!userId || !hasConsent('analytics')) return
    
    const userProperties = {
      user_id: userId,
      first_seen: new Date().toISOString(),
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
    
    setUserProperties(userProperties)
    
    if (window.mixpanel) {
      window.mixpanel.identify(userId)
      window.mixpanel.people.set(userProperties)
    }
  }, [userId, hasConsent])
  
  const trackEvent = React.useCallback(
    (name: string, properties?: Record<string, any>) => {
      if (!hasConsent('analytics')) return
      
      // Google Analytics
      trackEvent(name, properties?.category || 'General', properties?.label, properties?.value)
      
      // Mixpanel
      if (window.mixpanel) {
        window.mixpanel.track(name, {
          ...properties,
          timestamp: new Date().toISOString(),
          session_id: getSessionId(),
        })
      }
      
      // Custom analytics endpoint
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, properties, userId }),
      }).catch(() => {}) // Silent fail
    },
    [hasConsent, userId]
  )
  
  const trackToolUsage = React.useCallback(
    (toolId: string, action: string, metadata?: any) => {
      if (!hasConsent('analytics')) return
      
      const eventName = `Tool ${action}`
      const properties = {
        tool_id: toolId,
        tool_name: metadata?.name,
        tool_category: metadata?.category,
        input_length: metadata?.inputLength,
        output_length: metadata?.outputLength,
        processing_time: metadata?.processingTime,
        options_used: metadata?.options,
      }
      
      trackEvent(eventName, properties)
      
      // Track conversion if tool was used successfully
      if (action === 'complete') {
        trackConversion('tool_usage_complete')
      }
    },
    [trackEvent, hasConsent]
  )
  
  const trackError = React.useCallback(
    (error: Error, context?: any) => {
      if (!hasConsent('analytics')) return
      
      trackException(error.message, false)
      
      // Send to error tracking service
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          contexts: { analytics: context },
        })
      }
      
      // Log to custom endpoint
      fetch('/api/analytics/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
          },
          context,
          userId,
        }),
      }).catch(() => {})
    },
    [hasConsent, userId]
  )
  
  const trackPerformance = React.useCallback(
    (metric: string, value: number) => {
      if (!hasConsent('analytics')) return
      
      trackTiming(metric, value, 'Performance')
      
      // Send to performance monitoring
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric,
          value,
          timestamp: Date.now(),
          userId,
        }),
      }).catch(() => {})
    },
    [hasConsent, userId]
  )
  
  const setUserTraits = React.useCallback(
    (traits: Record<string, any>) => {
      if (!hasConsent('analytics')) return
      
      setUserProperties(traits)
      
      if (window.mixpanel) {
        window.mixpanel.people.set(traits)
      }
    },
    [hasConsent]
  )
  
  const value: AnalyticsContextValue = {
    trackEvent,
    trackToolUsage,
    trackError,
    trackPerformance,
    setUserTraits,
  }
  
  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = React.useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider')
  }
  return context
}

// Helper functions
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('session_id', sessionId)
  }
  return sessionId
}
```

### 3. Tool Usage Analytics Hook

#### Create `src/hooks/use-tool-analytics.ts`
```typescript
import * as React from 'react'
import { useAnalytics } from '@/providers/analytics-provider'
import { usePerformanceObserver } from '@/hooks/use-performance-observer'

interface ToolAnalyticsOptions {
  toolId: string
  toolName: string
  category: string
}

export function useToolAnalytics({ toolId, toolName, category }: ToolAnalyticsOptions) {
  const { trackToolUsage, trackPerformance } = useAnalytics()
  const startTimeRef = React.useRef<number>(0)
  const interactionCountRef = React.useRef<number>(0)
  const { metrics } = usePerformanceObserver()
  
  // Track tool view
  React.useEffect(() => {
    trackToolUsage(toolId, 'view', { name: toolName, category })
  }, [toolId, toolName, category, trackToolUsage])
  
  // Track tool start
  const trackStart = React.useCallback(
    (input: string, options?: any) => {
      startTimeRef.current = performance.now()
      interactionCountRef.current++
      
      trackToolUsage(toolId, 'start', {
        name: toolName,
        category,
        inputLength: input.length,
        options,
        interactionNumber: interactionCountRef.current,
      })
    },
    [toolId, toolName, category, trackToolUsage]
  )
  
  // Track tool completion
  const trackComplete = React.useCallback(
    (input: string, output: string, options?: any) => {
      const processingTime = performance.now() - startTimeRef.current
      
      trackToolUsage(toolId, 'complete', {
        name: toolName,
        category,
        inputLength: input.length,
        outputLength: output.length,
        processingTime,
        options,
        interactionNumber: interactionCountRef.current,
      })
      
      // Track performance metric
      trackPerformance(`tool_${toolId}_processing_time`, processingTime)
    },
    [toolId, toolName, category, trackToolUsage, trackPerformance]
  )
  
  // Track errors
  const trackError = React.useCallback(
    (error: Error, context?: any) => {
      trackToolUsage(toolId, 'error', {
        name: toolName,
        category,
        error: error.message,
        ...context,
      })
    },
    [toolId, toolName, category, trackToolUsage]
  )
  
  // Track specific features
  const trackFeature = React.useCallback(
    (featureName: string, value?: any) => {
      trackToolUsage(toolId, 'feature_use', {
        name: toolName,
        category,
        feature: featureName,
        value,
      })
    },
    [toolId, toolName, category, trackToolUsage]
  )
  
  // Report performance metrics on unmount
  React.useEffect(() => {
    return () => {
      if (metrics && interactionCountRef.current > 0) {
        trackPerformance(`tool_${toolId}_lcp`, metrics.lcp || 0)
        trackPerformance(`tool_${toolId}_fid`, metrics.fid || 0)
        trackPerformance(`tool_${toolId}_cls`, metrics.cls || 0)
      }
    }
  }, [metrics, toolId, trackPerformance])
  
  return {
    trackStart,
    trackComplete,
    trackError,
    trackFeature,
  }
}
```

### 4. Privacy-Compliant Consent Manager

#### Create `src/components/consent/consent-manager.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Cookie, Shield, BarChart3 } from 'lucide-react'
import { useConsent } from '@/hooks/use-consent'
import { cn } from '@/lib/utils'

export function ConsentManager() {
  const { 
    showBanner, 
    consentPreferences, 
    updateConsent, 
    acceptAll, 
    rejectAll 
  } = useConsent()
  
  const [showDetails, setShowDetails] = React.useState(false)
  
  if (!showBanner) return null
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <Card className={cn(
        "mx-auto max-w-4xl shadow-lg",
        "backdrop-blur-md bg-background/95"
      )}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            <CardTitle>Privacy & Cookie Settings</CardTitle>
          </div>
          <CardDescription>
            We use cookies and similar technologies to enhance your experience, 
            analyze site traffic, and for marketing purposes.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!showDetails ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button 
                variant="link" 
                onClick={() => setShowDetails(true)}
                className="justify-start p-0"
              >
                Manage preferences
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={rejectAll}>
                  Reject All
                </Button>
                <Button onClick={acceptAll}>
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="cookies">Cookies</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <ConsentToggle
                  id="necessary"
                  title="Necessary"
                  description="Required for the website to function properly"
                  icon={Shield}
                  checked={true}
                  disabled={true}
                />
                
                <ConsentToggle
                  id="analytics"
                  title="Analytics"
                  description="Help us understand how visitors use our website"
                  icon={BarChart3}
                  checked={consentPreferences.analytics}
                  onCheckedChange={(checked) => updateConsent('analytics', checked)}
                />
                
                <ConsentToggle
                  id="marketing"
                  title="Marketing"
                  description="Used to show you relevant ads"
                  icon={Cookie}
                  checked={consentPreferences.marketing}
                  onCheckedChange={(checked) => updateConsent('marketing', checked)}
                />
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Analytics Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    We use Google Analytics, Mixpanel, and Hotjar to understand 
                    how you use our website. This helps us improve our services.
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    <li>Page views and navigation paths</li>
                    <li>Tool usage and interaction patterns</li>
                    <li>Performance metrics</li>
                    <li>Geographic location (country level)</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Marketing Cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    These cookies help us show you relevant advertisements and 
                    measure the effectiveness of our marketing campaigns.
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    <li>Google Ads conversion tracking</li>
                    <li>Facebook Pixel</li>
                    <li>LinkedIn Insights</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="cookies" className="space-y-4">
                <div className="rounded-lg border p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2">Cookie Name</th>
                        <th className="text-left pb-2">Purpose</th>
                        <th className="text-left pb-2">Expiry</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      <tr>
                        <td className="py-2">_ga</td>
                        <td>Google Analytics</td>
                        <td>2 years</td>
                      </tr>
                      <tr>
                        <td className="py-2">_fbp</td>
                        <td>Facebook Pixel</td>
                        <td>3 months</td>
                      </tr>
                      <tr>
                        <td className="py-2">mp_*</td>
                        <td>Mixpanel Analytics</td>
                        <td>1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        
        {showDetails && (
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={rejectAll}>
                Reject All
              </Button>
              <Button onClick={() => {
                updateConsent('save')
                setShowDetails(false)
              }}>
                Save Preferences
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

function ConsentToggle({
  id,
  title,
  description,
  icon: Icon,
  checked,
  disabled,
  onCheckedChange,
}: {
  id: string
  title: string
  description: string
  icon: React.ElementType
  checked: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex items-center space-x-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div className="space-y-0.5">
          <Label htmlFor={id} className="text-base font-medium">
            {title}
          </Label>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}
```

### 5. Analytics Dashboard

#### Create `src/app/[locale]/admin/analytics/page.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { BarChart, LineChart, PieChart } from '@/components/charts'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  })
  
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => fetchAnalytics(dateRange),
  })
  
  if (isLoading) return <div>Loading analytics...</div>
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <DatePickerWithRange
          value={dateRange}
          onChange={setDateRange}
        />
      </div>
      
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={analytics?.metrics.totalUsers || 0}
          change={analytics?.metrics.userChange}
          format="number"
        />
        <MetricCard
          title="Page Views"
          value={analytics?.metrics.pageViews || 0}
          change={analytics?.metrics.pageViewChange}
          format="number"
        />
        <MetricCard
          title="Avg. Session Duration"
          value={analytics?.metrics.avgSessionDuration || 0}
          change={analytics?.metrics.sessionDurationChange}
          format="duration"
        />
        <MetricCard
          title="Tool Conversions"
          value={analytics?.metrics.toolConversions || 0}
          change={analytics?.metrics.conversionChange}
          format="number"
        />
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={analytics?.traffic || []}
                  xKey="date"
                  yKeys={['users', 'sessions', 'pageViews']}
                  height={300}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={analytics?.topPages || []}
                  xKey="page"
                  yKey="views"
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={analytics?.sources || []}
                  dataKey="value"
                  nameKey="source"
                  height={200}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={analytics?.devices || []}
                  dataKey="value"
                  nameKey="device"
                  height={200}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={analytics?.languages || []}
                  dataKey="value"
                  nameKey="language"
                  height={200}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tools" className="space-y-4">
          <ToolAnalytics data={analytics?.tools} />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <UserAnalytics data={analytics?.users} />
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <PerformanceAnalytics data={analytics?.performance} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Fetch analytics data
async function fetchAnalytics(dateRange: any) {
  const params = new URLSearchParams({
    from: format(dateRange.from, 'yyyy-MM-dd'),
    to: format(dateRange.to, 'yyyy-MM-dd'),
  })
  
  const response = await fetch(`/api/admin/analytics?${params}`)
  return response.json()
}

function MetricCard({ 
  title, 
  value, 
  change, 
  format 
}: { 
  title: string
  value: number
  change?: number
  format: 'number' | 'duration' | 'percentage'
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'number':
        return val.toLocaleString()
      case 'duration':
        const minutes = Math.floor(val / 60)
        const seconds = val % 60
        return `${minutes}m ${seconds}s`
      case 'percentage':
        return `${val.toFixed(1)}%`
      default:
        return val.toString()
    }
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <p className={cn(
            "text-xs",
            change > 0 ? "text-green-600" : "text-red-600"
          )}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}% from previous period
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

### 6. A/B Testing Framework

#### Create `src/lib/analytics/ab-testing.ts`
```typescript
import { cookies } from 'next/headers'

interface Experiment {
  id: string
  name: string
  variants: {
    id: string
    name: string
    weight: number
  }[]
  goals: string[]
  status: 'draft' | 'running' | 'paused' | 'completed'
}

class ABTestingService {
  private experiments: Map<string, Experiment> = new Map()
  
  // Get user's variant for an experiment
  async getVariant(experimentId: string, userId?: string): Promise<string | null> {
    const experiment = this.experiments.get(experimentId)
    if (!experiment || experiment.status !== 'running') {
      return null
    }
    
    // Check if user already has a variant assigned
    const cookieStore = cookies()
    const assignedVariant = cookieStore.get(`exp_${experimentId}`)?.value
    
    if (assignedVariant) {
      return assignedVariant
    }
    
    // Assign variant based on weights
    const variant = this.assignVariant(experiment, userId)
    
    // Store assignment
    cookieStore.set(`exp_${experimentId}`, variant.id, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })
    
    // Track assignment
    await this.trackAssignment(experimentId, variant.id, userId)
    
    return variant.id
  }
  
  // Assign variant based on weights
  private assignVariant(experiment: Experiment, userId?: string) {
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0)
    const random = userId 
      ? this.hashUserId(userId, experiment.id) 
      : Math.random()
    
    let cumulativeWeight = 0
    for (const variant of experiment.variants) {
      cumulativeWeight += variant.weight / totalWeight
      if (random <= cumulativeWeight) {
        return variant
      }
    }
    
    return experiment.variants[0]
  }
  
  // Consistent hashing for user assignment
  private hashUserId(userId: string, salt: string): number {
    let hash = 0
    const str = userId + salt
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash) / 2147483647
  }
  
  // Track experiment assignment
  private async trackAssignment(
    experimentId: string,
    variantId: string,
    userId?: string
  ) {
    await fetch('/api/analytics/experiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'assignment',
        experimentId,
        variantId,
        userId,
        timestamp: new Date().toISOString(),
      }),
    })
  }
  
  // Track goal conversion
  async trackGoal(
    experimentId: string,
    goalName: string,
    userId?: string
  ) {
    const cookieStore = cookies()
    const variantId = cookieStore.get(`exp_${experimentId}`)?.value
    
    if (!variantId) return
    
    await fetch('/api/analytics/experiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'conversion',
        experimentId,
        variantId,
        goalName,
        userId,
        timestamp: new Date().toISOString(),
      }),
    })
  }
  
  // React hook for A/B testing
  useExperiment(experimentId: string) {
    const [variant, setVariant] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(true)
    
    React.useEffect(() => {
      this.getVariant(experimentId).then(v => {
        setVariant(v)
        setLoading(false)
      })
    }, [experimentId])
    
    const trackGoal = React.useCallback(
      (goalName: string) => {
        this.trackGoal(experimentId, goalName)
      },
      [experimentId]
    )
    
    return { variant, loading, trackGoal }
  }
}

export const abTesting = new ABTestingService()

// React component for A/B testing
export function ABTest({
  experimentId,
  children,
}: {
  experimentId: string
  children: (variant: string | null) => React.ReactNode
}) {
  const { variant, loading } = abTesting.useExperiment(experimentId)
  
  if (loading) return null
  
  return <>{children(variant)}</>
}
```

## Testing & Verification

1. Verify GA4 tracking is working
2. Test custom event tracking
3. Check consent manager functionality
4. Verify privacy compliance
5. Test A/B testing framework
6. Check analytics dashboard data

## Success Indicators
- ✅ Analytics tracking implemented
- ✅ Privacy-compliant consent system
- ✅ Custom events for all tools
- ✅ A/B testing framework ready
- ✅ Analytics dashboard functional
- ✅ Real user monitoring active

## Next Steps
Proceed to Story 6.2: Documentation & Knowledge Base

## Notes
- Regular review of analytics data
- Update privacy policy
- Monitor GDPR/CCPA compliance
- Set up custom alerts
- Create monthly reports