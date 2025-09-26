# Story 6.2: Documentation & Knowledge Base

## Story Details
- **Stage**: 6 - Post-Launch Tasks
- **Priority**: High
- **Estimated Hours**: 6-8 hours
- **Dependencies**: Core application complete

## Objective
Create comprehensive documentation for developers, users, and content creators. Build a searchable knowledge base with guides, tutorials, API documentation, and FAQs. Implement an in-app help system and interactive onboarding for new users.

## Acceptance Criteria
- [ ] Developer documentation (setup, architecture, contributing)
- [ ] API documentation with interactive examples
- [ ] User guides and tutorials
- [ ] Video tutorials integration
- [ ] Searchable knowledge base
- [ ] In-app help system
- [ ] Interactive onboarding flow
- [ ] FAQ system with categories
- [ ] Changelog and release notes
- [ ] Multi-language documentation
- [ ] Documentation versioning
- [ ] Feedback collection system

## Implementation Steps

### 1. Documentation System Setup

#### Create `src/lib/docs/documentation-loader.ts`
```typescript
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'
import { rehype } from 'rehype'
import rehypePrism from 'rehype-prism-plus'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export interface DocMeta {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  order: number
  lastModified: string
  readingTime: number
  author?: string
  version?: string
}

export interface DocContent extends DocMeta {
  content: string
  tableOfContents: TOCItem[]
  relatedDocs: string[]
}

interface TOCItem {
  id: string
  title: string
  level: number
  children?: TOCItem[]
}

class DocumentationLoader {
  private docsDir = path.join(process.cwd(), 'docs')
  private cache = new Map<string, DocContent>()
  
  async loadDoc(slug: string, locale = 'en'): Promise<DocContent | null> {
    const cacheKey = `${locale}:${slug}`
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }
    
    try {
      // Try locale-specific file first
      let filePath = path.join(this.docsDir, locale, `${slug}.md`)
      let fileContent: string
      
      try {
        fileContent = await fs.readFile(filePath, 'utf-8')
      } catch {
        // Fallback to English
        filePath = path.join(this.docsDir, 'en', `${slug}.md`)
        fileContent = await fs.readFile(filePath, 'utf-8')
      }
      
      // Parse frontmatter
      const { data, content } = matter(fileContent)
      
      // Process markdown
      const processedContent = await this.processMarkdown(content)
      
      // Extract table of contents
      const tableOfContents = this.extractTOC(content)
      
      // Calculate reading time
      const wordCount = content.split(/\s+/).length
      const readingTime = Math.ceil(wordCount / 200) // 200 words per minute
      
      // Get related docs
      const relatedDocs = await this.findRelatedDocs(data.tags || [], slug)
      
      const doc: DocContent = {
        slug,
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags || [],
        order: data.order || 0,
        lastModified: data.lastModified || new Date().toISOString(),
        readingTime,
        author: data.author,
        version: data.version,
        content: processedContent,
        tableOfContents,
        relatedDocs,
      }
      
      // Cache the result
      this.cache.set(cacheKey, doc)
      
      return doc
    } catch (error) {
      console.error(`Failed to load doc: ${slug}`, error)
      return null
    }
  }
  
  async loadCategory(category: string, locale = 'en'): Promise<DocMeta[]> {
    const docsPath = path.join(this.docsDir, locale)
    const files = await fs.readdir(docsPath)
    
    const docs: DocMeta[] = []
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      
      const filePath = path.join(docsPath, file)
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const { data } = matter(fileContent)
      
      if (data.category === category) {
        docs.push({
          slug: file.replace('.md', ''),
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags || [],
          order: data.order || 0,
          lastModified: data.lastModified || new Date().toISOString(),
          readingTime: Math.ceil(fileContent.split(/\s+/).length / 200),
          author: data.author,
          version: data.version,
        })
      }
    }
    
    // Sort by order
    return docs.sort((a, b) => a.order - b.order)
  }
  
  async searchDocs(query: string, locale = 'en'): Promise<DocMeta[]> {
    const docsPath = path.join(this.docsDir, locale)
    const files = await fs.readdir(docsPath)
    
    const results: Array<DocMeta & { score: number }> = []
    const searchTerms = query.toLowerCase().split(/\s+/)
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      
      const filePath = path.join(docsPath, file)
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const { data, content } = matter(fileContent)
      
      // Calculate relevance score
      let score = 0
      const lowerContent = content.toLowerCase()
      const lowerTitle = data.title?.toLowerCase() || ''
      const lowerDescription = data.description?.toLowerCase() || ''
      
      for (const term of searchTerms) {
        // Title matches (highest weight)
        if (lowerTitle.includes(term)) score += 10
        
        // Description matches
        if (lowerDescription.includes(term)) score += 5
        
        // Content matches
        const contentMatches = (lowerContent.match(new RegExp(term, 'g')) || []).length
        score += contentMatches
        
        // Tag matches
        if (data.tags?.some((tag: string) => tag.toLowerCase().includes(term))) {
          score += 3
        }
      }
      
      if (score > 0) {
        results.push({
          slug: file.replace('.md', ''),
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags || [],
          order: data.order || 0,
          lastModified: data.lastModified || new Date().toISOString(),
          readingTime: Math.ceil(content.split(/\s+/).length / 200),
          author: data.author,
          version: data.version,
          score,
        })
      }
    }
    
    // Sort by relevance score
    return results
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...doc }) => doc)
  }
  
  private async processMarkdown(content: string): Promise<string> {
    const result = await remark()
      .use(remarkGfm)
      .use(remarkToc)
      .use(html, { sanitize: false })
      .process(content)
    
    const processedHtml = await rehype()
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, { behavior: 'append' })
      .use(rehypePrism)
      .process(result.toString())
    
    return processedHtml.toString()
  }
  
  private extractTOC(content: string): TOCItem[] {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const toc: TOCItem[] = []
    const stack: TOCItem[] = []
    
    let match
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const title = match[2]
      const id = title.toLowerCase().replace(/[^\w]+/g, '-')
      
      const item: TOCItem = { id, title, level }
      
      // Find parent
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop()
      }
      
      if (stack.length === 0) {
        toc.push(item)
      } else {
        const parent = stack[stack.length - 1]
        parent.children = parent.children || []
        parent.children.push(item)
      }
      
      stack.push(item)
    }
    
    return toc
  }
  
  private async findRelatedDocs(
    tags: string[],
    excludeSlug: string
  ): Promise<string[]> {
    if (tags.length === 0) return []
    
    const allDocs = await this.searchDocs(tags.join(' '))
    
    return allDocs
      .filter(doc => doc.slug !== excludeSlug)
      .slice(0, 5)
      .map(doc => doc.slug)
  }
}

export const docLoader = new DocumentationLoader()
```

### 2. Interactive API Documentation

#### Create `src/components/docs/api-playground.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Editor from '@monaco-editor/react'
import { Play, Copy, RotateCcw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface APIEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  description: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
    example?: any
  }>
  requestBody?: {
    type: string
    example: any
  }
  responses: {
    [status: string]: {
      description: string
      example: any
    }
  }
}

interface APIPlaygroundProps {
  endpoint: APIEndpoint
  baseUrl?: string
}

export function APIPlayground({ 
  endpoint, 
  baseUrl = '/api/v1' 
}: APIPlaygroundProps) {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [response, setResponse] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [requestBody, setRequestBody] = React.useState(
    endpoint.requestBody?.example 
      ? JSON.stringify(endpoint.requestBody.example, null, 2)
      : ''
  )
  const [queryParams, setQueryParams] = React.useState<Record<string, string>>({})
  const [headers, setHeaders] = React.useState<Record<string, string>>({
    'Content-Type': 'application/json',
  })
  
  const executeRequest = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    
    try {
      // Build URL with query parameters
      const url = new URL(baseUrl + endpoint.path, window.location.origin)
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value)
      })
      
      // Prepare request options
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          ...headers,
          'X-API-Playground': 'true', // Identify playground requests
        },
      }
      
      // Add body for POST/PUT requests
      if (['POST', 'PUT'].includes(endpoint.method) && requestBody) {
        try {
          options.body = JSON.stringify(JSON.parse(requestBody))
        } catch {
          throw new Error('Invalid JSON in request body')
        }
      }
      
      // Execute request
      const startTime = performance.now()
      const res = await fetch(url.toString(), options)
      const duration = performance.now() - startTime
      
      // Parse response
      const contentType = res.headers.get('content-type')
      let data
      
      if (contentType?.includes('application/json')) {
        data = await res.json()
      } else {
        data = await res.text()
      }
      
      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data,
        duration: Math.round(duration),
      })
      
      if (!res.ok) {
        setError(`Request failed with status ${res.status}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }
  
  const copyCode = (language: string) => {
    let code = ''
    
    switch (language) {
      case 'curl':
        code = generateCurlCommand()
        break
      case 'javascript':
        code = generateJavaScriptCode()
        break
      case 'python':
        code = generatePythonCode()
        break
    }
    
    navigator.clipboard.writeText(code)
    toast({
      title: 'Copied to clipboard',
      description: `${language} code has been copied`,
    })
  }
  
  const generateCurlCommand = (): string => {
    const url = baseUrl + endpoint.path
    let cmd = `curl -X ${endpoint.method} "${url}"`
    
    // Add headers
    Object.entries(headers).forEach(([key, value]) => {
      cmd += ` \\\n  -H "${key}: ${value}"`
    })
    
    // Add body
    if (requestBody && ['POST', 'PUT'].includes(endpoint.method)) {
      cmd += ` \\\n  -d '${requestBody.replace(/\n/g, '')}'`
    }
    
    return cmd
  }
  
  const generateJavaScriptCode = (): string => {
    return `fetch('${baseUrl + endpoint.path}', {
  method: '${endpoint.method}',
  headers: ${JSON.stringify(headers, null, 2)},${
    requestBody && ['POST', 'PUT'].includes(endpoint.method)
      ? `\n  body: JSON.stringify(${requestBody}),`
      : ''
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`
  }
  
  const generatePythonCode = (): string => {
    return `import requests

url = "${baseUrl + endpoint.path}"
headers = ${JSON.stringify(headers, null, 2).replace(/"/g, "'")}${
    requestBody && ['POST', 'PUT'].includes(endpoint.method)
      ? `\ndata = ${requestBody.replace(/"/g, "'")}`
      : ''
  }

response = requests.${endpoint.method.toLowerCase()}(url, headers=headers${
    requestBody && ['POST', 'PUT'].includes(endpoint.method) ? ', json=data' : ''
  })
print(response.json())`
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={
                endpoint.method === 'GET' ? 'default' :
                endpoint.method === 'POST' ? 'success' :
                endpoint.method === 'PUT' ? 'warning' :
                'destructive'
              }>
                {endpoint.method}
              </Badge>
              <CardTitle className="text-lg font-mono">{endpoint.path}</CardTitle>
            </div>
            <Button onClick={executeRequest} disabled={loading}>
              <Play className="h-4 w-4 mr-2" />
              {loading ? 'Running...' : 'Execute'}
            </Button>
          </div>
          <CardDescription>{endpoint.description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="parameters" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="parameters" className="space-y-4">
              {endpoint.parameters?.map(param => (
                <div key={param.name} className="space-y-2">
                  <Label htmlFor={param.name}>
                    {param.name} 
                    {param.required && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id={param.name}
                    placeholder={param.example?.toString() || param.description}
                    value={queryParams[param.name] || ''}
                    onChange={(e) => setQueryParams({
                      ...queryParams,
                      [param.name]: e.target.value,
                    })}
                  />
                  <p className="text-xs text-muted-foreground">{param.description}</p>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="headers" className="space-y-4">
              <div className="space-y-2">
                <Label>Request Headers</Label>
                <Editor
                  height="200px"
                  language="json"
                  theme="vs-dark"
                  value={JSON.stringify(headers, null, 2)}
                  onChange={(value) => {
                    try {
                      setHeaders(JSON.parse(value || '{}'))
                    } catch {}
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                  }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="body" className="space-y-4">
              {['POST', 'PUT'].includes(endpoint.method) ? (
                <div className="space-y-2">
                  <Label>Request Body</Label>
                  <Editor
                    height="300px"
                    language="json"
                    theme="vs-dark"
                    value={requestBody}
                    onChange={(value) => setRequestBody(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 12,
                    }}
                  />
                </div>
              ) : (
                <p className="text-muted-foreground">
                  This endpoint does not accept a request body.
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="code" className="space-y-4">
              <div className="space-y-4">
                <CodeExample
                  title="cURL"
                  language="bash"
                  code={generateCurlCommand()}
                  onCopy={() => copyCode('curl')}
                />
                <CodeExample
                  title="JavaScript"
                  language="javascript"
                  code={generateJavaScriptCode()}
                  onCopy={() => copyCode('javascript')}
                />
                <CodeExample
                  title="Python"
                  language="python"
                  code={generatePythonCode()}
                  onCopy={() => copyCode('python')}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Response */}
      {(response || error) && (
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            {response && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant={
                  response.status >= 200 && response.status < 300 ? 'success' :
                  response.status >= 400 ? 'destructive' : 'warning'
                }>
                  {response.status} {response.statusText}
                </Badge>
                <span className="text-muted-foreground">
                  {response.duration}ms
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-destructive">{error}</div>
            ) : response ? (
              <Tabs defaultValue="body">
                <TabsList>
                  <TabsTrigger value="body">Body</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="body">
                  <Editor
                    height="300px"
                    language="json"
                    theme="vs-dark"
                    value={
                      typeof response.data === 'string' 
                        ? response.data 
                        : JSON.stringify(response.data, null, 2)
                    }
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 12,
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="headers">
                  <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CodeExample({ 
  title, 
  language, 
  code, 
  onCopy 
}: { 
  title: string
  language: string
  code: string
  onCopy: () => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        <Button size="sm" variant="ghost" onClick={onCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <Editor
        height="150px"
        language={language}
        theme="vs-dark"
        value={code}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 12,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  )
}
```

### 3. Interactive Onboarding System

#### Create `src/components/onboarding/onboarding-flow.tsx`
```typescript
'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, ChevronRight, ChevronLeft, X } from 'lucide-react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

interface OnboardingStep {
  id: string
  title: string
  description: string
  content: React.ReactNode
  action?: {
    label: string
    onClick: () => void | Promise<void>
  }
  validation?: () => boolean
  spotlight?: {
    selector: string
    padding?: number
  }
}

interface OnboardingFlowProps {
  steps: OnboardingStep[]
  onComplete: () => void
  onSkip?: () => void
}

export function OnboardingFlow({ 
  steps, 
  onComplete, 
  onSkip 
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [completedSteps, setCompletedSteps] = useLocalStorage<string[]>(
    'onboarding-completed-steps',
    []
  )
  const [isVisible, setIsVisible] = React.useState(true)
  
  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  
  React.useEffect(() => {
    // Add spotlight effect
    if (step.spotlight) {
      const element = document.querySelector(step.spotlight.selector)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('onboarding-spotlight')
        
        return () => {
          element.classList.remove('onboarding-spotlight')
        }
      }
    }
  }, [step])
  
  const handleNext = async () => {
    // Validate current step
    if (step.validation && !step.validation()) {
      return
    }
    
    // Execute action if provided
    if (step.action) {
      await step.action.onClick()
    }
    
    // Mark step as completed
    setCompletedSteps([...completedSteps, step.id])
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Onboarding complete!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
      
      setTimeout(() => {
        setIsVisible(false)
        onComplete()
      }, 2000)
    }
  }
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const handleSkip = () => {
    setIsVisible(false)
    onSkip?.()
  }
  
  if (!isVisible) return null
  
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleSkip} />
      
      {/* Onboarding Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-4 right-4 z-50 w-full max-w-md"
        >
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{step.title}</CardTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSkip}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{step.description}</CardDescription>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            
            <CardContent>
              {step.content}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      index === currentStep
                        ? "bg-primary"
                        : index < currentStep
                        ? "bg-primary/50"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
              
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? (
                  <>
                    Complete
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
      
      {/* Spotlight styles */}
      <style jsx global>{`
        .onboarding-spotlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  )
}

// Example onboarding steps for text tools
export const textToolOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Text Case Converter! 👋',
    description: 'Let\'s take a quick tour to help you get started.',
    content: (
      <div className="space-y-4">
        <p>
          Text Case Converter offers powerful tools to transform and manipulate text
          in dozens of ways.
        </p>
        <p>
          This quick tour will show you the key features and help you get the most
          out of our tools.
        </p>
      </div>
    ),
  },
  {
    id: 'try-tool',
    title: 'Try Your First Conversion',
    description: 'Let\'s convert some text to uppercase',
    content: (
      <div className="space-y-4">
        <p>
          Type or paste any text in the input box on the left, and watch it
          transform instantly!
        </p>
        <div className="bg-muted p-4 rounded-lg">
          <code>Example: hello world → HELLO WORLD</code>
        </div>
      </div>
    ),
    spotlight: {
      selector: '[data-testid="tool-input"]',
      padding: 20,
    },
    validation: () => {
      const input = document.querySelector<HTMLTextAreaElement>(
        '[data-testid="tool-input"]'
      )
      return !!input?.value
    },
  },
  {
    id: 'copy-output',
    title: 'Copy Your Results',
    description: 'One click to copy transformed text',
    content: (
      <div className="space-y-4">
        <p>
          Click the copy button to instantly copy your converted text to the
          clipboard.
        </p>
        <p>
          You can also download the results as a text file or share them directly.
        </p>
      </div>
    ),
    spotlight: {
      selector: '[data-testid="copy-button"]',
    },
    action: {
      label: 'Copy Text',
      onClick: () => {
        const button = document.querySelector<HTMLButtonElement>(
          '[data-testid="copy-button"]'
        )
        button?.click()
      },
    },
  },
  {
    id: 'explore-tools',
    title: 'Explore More Tools',
    description: 'Discover our full suite of text tools',
    content: (
      <div className="space-y-4">
        <p>We offer over 30 different text transformation tools:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Case converters (Title Case, camelCase, snake_case, etc.)</li>
          <li>Text formatters (Remove spaces, sort lines, find & replace)</li>
          <li>Encoders/Decoders (Base64, URL, HTML entities)</li>
          <li>Generators (Lorem Ipsum, passwords, UUIDs)</li>
          <li>And much more!</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🎉',
    description: 'Start transforming your text',
    content: (
      <div className="space-y-4">
        <p>
          You now know the basics of using Text Case Converter. Explore our tools
          and transform your text with ease!
        </p>
        <p className="text-sm text-muted-foreground">
          Tip: Press <kbd>Ctrl+K</kbd> to quickly search for any tool.
        </p>
      </div>
    ),
  },
]
```

### 4. In-App Help System

#### Create `src/components/help/help-widget.tsx`
```typescript
'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { HelpCircle, Search, BookOpen, MessageCircle, Video, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from '@/hooks/use-debounce'

interface HelpResource {
  id: string
  type: 'article' | 'video' | 'faq'
  title: string
  description: string
  url: string
  tags: string[]
}

export function HelpWidget() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  const { data: resources, isLoading } = useQuery({
    queryKey: ['help-resources', debouncedSearch, selectedCategory],
    queryFn: () => fetchHelpResources(debouncedSearch, selectedCategory),
  })
  
  const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'tools', label: 'Using Tools', icon: HelpCircle },
    { id: 'api', label: 'API Documentation', icon: MessageCircle },
    { id: 'videos', label: 'Video Tutorials', icon: Video },
  ]
  
  return (
    <>
      {/* Help Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 rounded-full shadow-lg"
            size="icon"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent
          side="top"
          align="end"
          className="w-96 p-0"
          sideOffset={20}
        >
          <Card className="border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Help & Resources</CardTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Categories */}
              <div className="flex gap-2 px-4 pb-3">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    size="sm"
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )}
                  >
                    <category.icon className="h-3 w-3 mr-1" />
                    {category.label}
                  </Button>
                ))}
              </div>
              
              {/* Resources */}
              <ScrollArea className="h-[300px] px-4 pb-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : resources?.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No resources found. Try a different search.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {resources?.map(resource => (
                      <HelpResourceCard
                        key={resource.id}
                        resource={resource}
                        onClick={() => {
                          window.open(resource.url, '_blank')
                          trackEvent('Help Resource Clicked', {
                            resource: resource.id,
                            type: resource.type,
                          })
                        }}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              {/* Footer */}
              <div className="border-t p-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsOpen(false)
                    startOnboarding()
                  }}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Interactive Tour
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    window.open('/contact', '_blank')
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
      
      {/* Contextual Help Tooltips */}
      <ContextualHelp />
    </>
  )
}

function HelpResourceCard({ 
  resource, 
  onClick 
}: { 
  resource: HelpResource
  onClick: () => void 
}) {
  const Icon = 
    resource.type === 'video' ? Video :
    resource.type === 'faq' ? HelpCircle :
    BookOpen
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
    >
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div className="flex-1">
          <h4 className="text-sm font-medium">{resource.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {resource.description}
          </p>
        </div>
      </div>
    </motion.button>
  )
}

// Contextual help system
function ContextualHelp() {
  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null)
  
  React.useEffect(() => {
    // Add help icons to elements with data-help attribute
    const elements = document.querySelectorAll('[data-help]')
    
    elements.forEach(element => {
      const helpText = element.getAttribute('data-help')
      const helpId = element.getAttribute('data-help-id') || 
        Math.random().toString(36).substr(2, 9)
      
      // Create help icon
      const helpIcon = document.createElement('button')
      helpIcon.className = 'inline-flex items-center justify-center w-4 h-4 ml-1 text-muted-foreground hover:text-foreground'
      helpIcon.innerHTML = '<svg>...</svg>' // Help icon SVG
      helpIcon.onclick = () => setActiveTooltip(
        activeTooltip === helpId ? null : helpId
      )
      
      // Insert after element
      element.parentNode?.insertBefore(helpIcon, element.nextSibling)
      
      // Store help text
      helpIcon.setAttribute('data-tooltip', helpText || '')
      helpIcon.setAttribute('data-tooltip-id', helpId)
    })
    
    return () => {
      // Cleanup
      document.querySelectorAll('[data-tooltip]').forEach(el => el.remove())
    }
  }, [])
  
  return (
    <AnimatePresence>
      {activeTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed z-50 max-w-xs rounded-lg bg-popover p-3 shadow-lg"
          style={{
            // Position near the help icon
          }}
        >
          <p className="text-sm">{/* Tooltip content */}</p>
          <Button
            size="sm"
            variant="link"
            onClick={() => {
              // Open detailed help
            }}
          >
            Learn more →
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// API
async function fetchHelpResources(
  search?: string,
  category?: string | null
): Promise<HelpResource[]> {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (category) params.append('category', category)
  
  const response = await fetch(`/api/help/resources?${params}`)
  return response.json()
}

function startOnboarding() {
  // Trigger onboarding flow
  window.dispatchEvent(new CustomEvent('start-onboarding'))
}
```

### 5. Knowledge Base Search

#### Create `src/app/[locale]/help/page.tsx`
```typescript
'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Search, BookOpen, Video, FileQuestion, Code, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useDebounce } from '@/hooks/use-debounce'
import { useQuery } from '@tanstack/react-query'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['help-search', debouncedSearch],
    queryFn: () => searchHelp(debouncedSearch),
    enabled: debouncedSearch.length > 0,
  })
  
  const popularArticles = [
    {
      title: 'Getting Started with Text Case Converter',
      description: 'Learn the basics of using our text transformation tools',
      category: 'Getting Started',
      url: '/help/getting-started',
    },
    {
      title: 'API Documentation',
      description: 'Integrate our tools into your applications',
      category: 'Developer',
      url: '/help/api-docs',
    },
    {
      title: 'Keyboard Shortcuts',
      description: 'Master productivity with keyboard shortcuts',
      category: 'Tips & Tricks',
      url: '/help/keyboard-shortcuts',
    },
  ]
  
  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'New to Text Case Converter? Start here',
      icon: BookOpen,
      articles: 12,
    },
    {
      id: 'tools-guide',
      title: 'Tools Guide',
      description: 'Detailed guides for each tool',
      icon: Code,
      articles: 32,
    },
    {
      id: 'api-docs',
      title: 'API Documentation',
      description: 'For developers and integrations',
      icon: Code,
      articles: 8,
    },
    {
      id: 'video-tutorials',
      title: 'Video Tutorials',
      description: 'Visual guides and walkthroughs',
      icon: Video,
      articles: 15,
    },
    {
      id: 'faq',
      title: 'FAQ',
      description: 'Frequently asked questions',
      icon: FileQuestion,
      articles: 24,
    },
  ]
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">How can we help you?</h1>
        <p className="text-xl text-muted-foreground">
          Search our knowledge base or browse by category
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for help articles, guides, or tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 h-12 text-lg"
          />
        </div>
      </div>
      
      {/* Search Results */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold">
            Search Results {searchResults && `(${searchResults.length})`}
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : searchResults?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No results found for "{searchQuery}"
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try different keywords or browse categories below
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {searchResults?.map(result => (
                <SearchResultCard key={result.id} result={result} />
              ))}
            </div>
          )}
        </motion.div>
      )}
      
      {/* Categories */}
      {!searchQuery && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
          
          {/* Popular Articles */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Popular Articles</h2>
            <div className="grid gap-4">
              {popularArticles.map((article, index) => (
                <ArticleCard key={index} article={article} />
              ))}
            </div>
          </div>
          
          {/* Contact Support */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="text-center py-8">
              <h3 className="text-xl font-semibold mb-2">
                Can't find what you're looking for?
              </h3>
              <p className="text-muted-foreground mb-4">
                Our support team is here to help
              </p>
              <Button asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function CategoryCard({ category }: { category: any }) {
  const Icon = category.icon
  
  return (
    <Link href={`/help/category/${category.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{category.title}</CardTitle>
              <Badge variant="secondary" className="mt-1">
                {category.articles} articles
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>{category.description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}

function ArticleCard({ article }: { article: any }) {
  return (
    <Link href={article.url}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <h3 className="font-medium">{article.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {article.description}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  )
}

function SearchResultCard({ result }: { result: any }) {
  return (
    <Link href={result.url}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{result.category}</Badge>
                {result.type === 'video' && (
                  <Badge variant="secondary">
                    <Video className="h-3 w-3 mr-1" />
                    Video
                  </Badge>
                )}
              </div>
              <h3 className="font-medium">{result.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {result.excerpt}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

async function searchHelp(query: string) {
  const response = await fetch(`/api/help/search?q=${encodeURIComponent(query)}`)
  return response.json()
}
```

## Testing & Verification

1. Test documentation loading and rendering
2. Verify API playground functionality
3. Test onboarding flow completion
4. Check help widget search
5. Verify knowledge base navigation
6. Test multi-language documentation

## Success Indicators
- ✅ Documentation system implemented
- ✅ Interactive API playground working
- ✅ Onboarding flow guides new users
- ✅ In-app help easily accessible
- ✅ Knowledge base searchable
- ✅ User feedback collected

## Next Steps
Proceed to Story 6.3: User Feedback & Support System

## Notes
- Keep documentation up to date
- Add more interactive examples
- Create video tutorials
- Monitor help article usage
- Regular documentation reviews