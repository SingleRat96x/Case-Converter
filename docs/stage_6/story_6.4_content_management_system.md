# Story 6.4: Content Management System

## Story Details
- **Stage**: 6 - Post-Launch Tasks
- **Priority**: Medium
- **Estimated Hours**: 6-8 hours
- **Dependencies**: Core application complete

## Objective
Implement a lightweight content management system for managing static content, tool descriptions, FAQs, and marketing pages without requiring code changes. Create an admin interface for content editors to update text, images, and metadata across the multi-language site.

## Acceptance Criteria
- [ ] Admin dashboard for content management
- [ ] Rich text editor with preview
- [ ] Image upload and management
- [ ] Multi-language content support
- [ ] Version history and rollback
- [ ] Content scheduling
- [ ] SEO metadata management
- [ ] Content templates
- [ ] Bulk operations
- [ ] Content search and filtering
- [ ] Role-based access control
- [ ] Content workflow (draft/review/publish)

## Implementation Steps

### 1. Content Models and Database Schema

#### Create `src/lib/cms/content-types.ts`
```typescript
import { z } from 'zod'

// Content status workflow
export const ContentStatus = z.enum(['draft', 'review', 'scheduled', 'published', 'archived'])

// Content types
export const ContentType = z.enum(['page', 'tool', 'faq', 'guide', 'announcement', 'legal'])

// Base content schema
export const ContentSchema = z.object({
  id: z.string(),
  type: ContentType,
  status: ContentStatus,
  slug: z.string().regex(/^[a-z0-9-]+$/),
  locale: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  content: z.string(),
  excerpt: z.string().max(300).optional(),
  featuredImage: z.string().url().optional(),
  seo: z.object({
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().url().optional(),
    noIndex: z.boolean().optional(),
  }).optional(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
  }),
  publishedAt: z.date().optional(),
  scheduledAt: z.date().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  version: z.number(),
  parentId: z.string().optional(), // For translations
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Tool-specific content
export const ToolContentSchema = ContentSchema.extend({
  type: z.literal('tool'),
  toolId: z.string(),
  features: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    description: z.string(),
  })).optional(),
  examples: z.array(z.object({
    input: z.string(),
    output: z.string(),
    description: z.string().optional(),
  })).optional(),
  relatedTools: z.array(z.string()).optional(),
  apiEndpoint: z.string().optional(),
})

// FAQ content
export const FAQContentSchema = ContentSchema.extend({
  type: z.literal('faq'),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    answer: z.string(),
    order: z.number(),
  })),
  category: z.string(),
})

// Content revision schema
export const ContentRevisionSchema = z.object({
  id: z.string(),
  contentId: z.string(),
  version: z.number(),
  changes: z.record(z.any()),
  author: z.object({
    id: z.string(),
    name: z.string(),
  }),
  message: z.string().optional(),
  createdAt: z.date(),
})

// Content template schema
export const ContentTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ContentType,
  description: z.string().optional(),
  structure: z.record(z.any()),
  fields: z.array(z.object({
    name: z.string(),
    type: z.enum(['text', 'textarea', 'richtext', 'image', 'select', 'boolean']),
    label: z.string(),
    required: z.boolean().optional(),
    options: z.array(z.any()).optional(),
    validation: z.any().optional(),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Content = z.infer<typeof ContentSchema>
export type ToolContent = z.infer<typeof ToolContentSchema>
export type FAQContent = z.infer<typeof FAQContentSchema>
export type ContentRevision = z.infer<typeof ContentRevisionSchema>
export type ContentTemplate = z.infer<typeof ContentTemplateSchema>
```

### 2. Content Management Service

#### Create `src/lib/cms/content-service.ts`
```typescript
import { cache } from 'react'
import { notFound } from 'next/navigation'
import DOMPurify from 'isomorphic-dompurify'
import { marked } from 'marked'
import { ContentSchema, ContentStatus, ContentType } from './content-types'
import type { Content, ContentRevision } from './content-types'

export class ContentService {
  // Get content by slug and locale
  async getContent(
    slug: string,
    locale: string,
    options?: { 
      includeUnpublished?: boolean
      version?: number 
    }
  ): Promise<Content | null> {
    const { includeUnpublished = false, version } = options || {}
    
    let query = db.content.findFirst({
      where: {
        slug,
        locale,
        ...(includeUnpublished ? {} : { status: 'published' }),
        ...(version ? { version } : {}),
      },
      orderBy: { version: 'desc' },
    })
    
    const content = await query
    
    if (!content) return null
    
    // Process content
    content.content = await this.processContent(content.content, content.type)
    
    return ContentSchema.parse(content)
  }
  
  // Get content by ID
  async getContentById(id: string): Promise<Content | null> {
    const content = await db.content.findUnique({
      where: { id },
    })
    
    if (!content) return null
    
    content.content = await this.processContent(content.content, content.type)
    
    return ContentSchema.parse(content)
  }
  
  // List content
  async listContent(options?: {
    type?: ContentType
    status?: ContentStatus
    locale?: string
    author?: string
    tags?: string[]
    search?: string
    page?: number
    limit?: number
    orderBy?: string
    orderDir?: 'asc' | 'desc'
  }): Promise<{
    items: Content[]
    total: number
    page: number
    pages: number
  }> {
    const {
      type,
      status,
      locale,
      author,
      tags,
      search,
      page = 1,
      limit = 20,
      orderBy = 'updatedAt',
      orderDir = 'desc',
    } = options || {}
    
    const where: any = {}
    
    if (type) where.type = type
    if (status) where.status = status
    if (locale) where.locale = locale
    if (author) where.author = { id: author }
    if (tags?.length) where.tags = { hasSome: tags }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    const [items, total] = await Promise.all([
      db.content.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [orderBy]: orderDir },
      }),
      db.content.count({ where }),
    ])
    
    return {
      items: items.map(item => ContentSchema.parse(item)),
      total,
      page,
      pages: Math.ceil(total / limit),
    }
  }
  
  // Create content
  async createContent(
    data: Omit<Content, 'id' | 'version' | 'createdAt' | 'updatedAt'>
  ): Promise<Content> {
    const content = await db.content.create({
      data: {
        ...data,
        id: nanoid(),
        version: 1,
        content: await this.sanitizeContent(data.content),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    
    // Create initial revision
    await this.createRevision(content.id, {
      version: 1,
      changes: content,
      author: data.author,
      message: 'Initial version',
    })
    
    // Clear cache
    await this.clearCache(content.slug, content.locale)
    
    return ContentSchema.parse(content)
  }
  
  // Update content
  async updateContent(
    id: string,
    updates: Partial<Content>,
    author: { id: string; name: string },
    message?: string
  ): Promise<Content> {
    const existing = await db.content.findUnique({ where: { id } })
    
    if (!existing) {
      throw new Error('Content not found')
    }
    
    // Track changes
    const changes: Record<string, any> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (existing[key as keyof typeof existing] !== value) {
        changes[key] = value
      }
    }
    
    // Update content
    const updated = await db.content.update({
      where: { id },
      data: {
        ...updates,
        content: updates.content 
          ? await this.sanitizeContent(updates.content)
          : undefined,
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    })
    
    // Create revision
    await this.createRevision(id, {
      version: updated.version,
      changes,
      author,
      message: message || `Updated by ${author.name}`,
    })
    
    // Clear cache
    await this.clearCache(updated.slug, updated.locale)
    
    return ContentSchema.parse(updated)
  }
  
  // Schedule content
  async scheduleContent(
    id: string,
    scheduledAt: Date,
    author: { id: string; name: string }
  ): Promise<Content> {
    return this.updateContent(
      id,
      { 
        status: 'scheduled',
        scheduledAt,
      },
      author,
      `Scheduled for ${scheduledAt.toISOString()}`
    )
  }
  
  // Publish content
  async publishContent(
    id: string,
    author: { id: string; name: string }
  ): Promise<Content> {
    return this.updateContent(
      id,
      { 
        status: 'published',
        publishedAt: new Date(),
      },
      author,
      'Published'
    )
  }
  
  // Archive content
  async archiveContent(
    id: string,
    author: { id: string; name: string }
  ): Promise<Content> {
    return this.updateContent(
      id,
      { status: 'archived' },
      author,
      'Archived'
    )
  }
  
  // Delete content
  async deleteContent(id: string): Promise<void> {
    const content = await db.content.findUnique({ where: { id } })
    
    if (!content) return
    
    // Soft delete by archiving
    await this.archiveContent(id, { 
      id: 'system',
      name: 'System',
    })
    
    // Clear cache
    await this.clearCache(content.slug, content.locale)
  }
  
  // Get content revisions
  async getRevisions(contentId: string): Promise<ContentRevision[]> {
    const revisions = await db.contentRevision.findMany({
      where: { contentId },
      orderBy: { version: 'desc' },
    })
    
    return revisions
  }
  
  // Rollback to revision
  async rollbackToRevision(
    contentId: string,
    version: number,
    author: { id: string; name: string }
  ): Promise<Content> {
    const revision = await db.contentRevision.findFirst({
      where: { contentId, version },
    })
    
    if (!revision) {
      throw new Error('Revision not found')
    }
    
    return this.updateContent(
      contentId,
      revision.changes,
      author,
      `Rolled back to version ${version}`
    )
  }
  
  // Process content (markdown, sanitization, etc.)
  private async processContent(
    content: string,
    type: string
  ): Promise<string> {
    // Process markdown for certain content types
    if (['page', 'guide', 'tool'].includes(type)) {
      content = await marked(content)
    }
    
    // Sanitize HTML
    content = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'strong', 'b', 'em', 'i', 'u', 'del', 'ins',
        'a', 'img', 'video', 'audio',
        'ul', 'ol', 'li',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'blockquote', 'pre', 'code',
        'div', 'span',
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'target', 'rel', 'width', 'height',
      ],
      ALLOW_DATA_ATTR: false,
    })
    
    return content
  }
  
  // Sanitize content before saving
  private async sanitizeContent(content: string): Promise<string> {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    })
  }
  
  // Create content revision
  private async createRevision(
    contentId: string,
    data: Omit<ContentRevision, 'id' | 'contentId' | 'createdAt'>
  ): Promise<void> {
    await db.contentRevision.create({
      data: {
        id: nanoid(),
        contentId,
        ...data,
        createdAt: new Date(),
      },
    })
  }
  
  // Clear cache
  private async clearCache(slug: string, locale: string): Promise<void> {
    // Clear Next.js cache
    revalidatePath(`/${locale}/${slug}`)
    revalidatePath(`/${locale}`)
    
    // Clear CDN cache if configured
    if (process.env.CLOUDFLARE_ZONE_ID) {
      await fetch(
        `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            files: [
              `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/${slug}`,
            ],
          }),
        }
      )
    }
  }
  
  // Check publishing schedule
  async checkScheduledContent(): Promise<void> {
    const scheduled = await db.content.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: new Date(),
        },
      },
    })
    
    for (const content of scheduled) {
      await this.publishContent(content.id, {
        id: 'system',
        name: 'System (Scheduled)',
      })
    }
  }
}

// Cached version for use in components
export const getContent = cache(
  async (slug: string, locale: string) => {
    const service = new ContentService()
    const content = await service.getContent(slug, locale)
    
    if (!content) {
      notFound()
    }
    
    return content
  }
)
```

### 3. Rich Text Editor Component

#### Create `src/components/cms/rich-text-editor.tsx`
```typescript
'use client'

import * as React from 'react'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Separator } from '@/components/ui/separator'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Eye,
  Code2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  className,
  minHeight = '400px',
}: RichTextEditorProps) {
  const [showPreview, setShowPreview] = React.useState(false)
  const [showSource, setShowSource] = React.useState(false)
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })
  
  const addLink = React.useCallback(() => {
    const url = window.prompt('Enter URL:')
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }, [editor])
  
  const addImage = React.useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])
  
  const addTable = React.useCallback(() => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()
    }
  }, [editor])
  
  if (!editor) return null
  
  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex items-center gap-1 flex-wrap">
        {/* Text formatting */}
        <div className="flex items-center gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('strike')}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('code')}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="h-4 w-4" />
          </Toggle>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Headings */}
        <div className="flex items-center gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 1 })}
            onPressedChange={() => 
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 2 })}
            onPressedChange={() => 
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 3 })}
            onPressedChange={() => 
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Lists */}
        <div className="flex items-center gap-1">
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => 
              editor.chain().focus().toggleBulletList().run()
            }
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => 
              editor.chain().focus().toggleOrderedList().run()
            }
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('blockquote')}
            onPressedChange={() => 
              editor.chain().focus().toggleBlockquote().run()
            }
          >
            <Quote className="h-4 w-4" />
          </Toggle>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Insert */}
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={addLink}>
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={addImage}>
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={addTable}>
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* History */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1" />
        
        {/* View mode */}
        <div className="flex items-center gap-1">
          <Toggle
            size="sm"
            pressed={showSource}
            onPressedChange={setShowSource}
          >
            <Code2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={showPreview}
            onPressedChange={setShowPreview}
          >
            <Eye className="h-4 w-4" />
          </Toggle>
        </div>
      </div>
      
      {/* Editor */}
      <div className="relative" style={{ minHeight }}>
        {showSource ? (
          <textarea
            value={editor.getHTML()}
            onChange={(e) => editor.commands.setContent(e.target.value)}
            className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
            style={{ minHeight }}
          />
        ) : showPreview ? (
          <div
            className="prose prose-sm max-w-none p-4"
            dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
          />
        ) : (
          <>
            {/* Bubble menu for selected text */}
            <BubbleMenu
              editor={editor}
              tippyOptions={{ duration: 100 }}
              className="flex items-center gap-1 p-1 bg-popover border rounded-lg shadow-lg"
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-muted' : ''}
              >
                <Bold className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-muted' : ''}
              >
                <Italic className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={addLink}
                className={editor.isActive('link') ? 'bg-muted' : ''}
              >
                <LinkIcon className="h-3 w-3" />
              </Button>
            </BubbleMenu>
            
            {/* Floating menu for new lines */}
            <FloatingMenu
              editor={editor}
              tippyOptions={{ duration: 100 }}
              className="flex items-center gap-1 p-1 bg-popover border rounded-lg shadow-lg"
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={() => 
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
              >
                <Heading1 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => 
                  editor.chain().focus().toggleBulletList().run()
                }
              >
                <List className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => 
                  editor.chain().focus().toggleBlockquote().run()
                }
              >
                <Quote className="h-3 w-3" />
              </Button>
            </FloatingMenu>
            
            <EditorContent
              editor={editor}
              className="p-4 min-h-full focus:outline-none prose prose-sm max-w-none"
            />
          </>
        )}
      </div>
    </div>
  )
}
```

### 4. Content Admin Dashboard

#### Create `src/app/[locale]/admin/content/page.tsx`
```typescript
'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { 
  Plus,
  Search,
  Filter,
  Edit,
  Trash,
  Eye,
  Clock,
  Globe,
  MoreHorizontal,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import { format } from 'date-fns'
import { ContentStatus, ContentType } from '@/lib/cms/content-types'
import type { Content } from '@/lib/cms/content-types'

export default function ContentAdminPage() {
  const [contentType, setContentType] = React.useState<ContentType | 'all'>('all')
  const [status, setStatus] = React.useState<ContentStatus | 'all'>('all')
  const [locale, setLocale] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin-content', contentType, status, locale, debouncedSearch],
    queryFn: () => fetchContent({
      type: contentType === 'all' ? undefined : contentType,
      status: status === 'all' ? undefined : status,
      locale: locale === 'all' ? undefined : locale,
      search: debouncedSearch,
    }),
  })
  
  const columns: ColumnDef<Content>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{row.original.title}</p>
            <p className="text-sm text-muted-foreground">
              /{row.original.locale}/{row.original.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const statusConfig = {
          draft: { label: 'Draft', className: 'bg-gray-500' },
          review: { label: 'In Review', className: 'bg-yellow-500' },
          scheduled: { label: 'Scheduled', className: 'bg-blue-500' },
          published: { label: 'Published', className: 'bg-green-500' },
          archived: { label: 'Archived', className: 'bg-red-500' },
        }
        
        const config = statusConfig[status]
        
        return (
          <Badge className={cn('text-white', config.className)}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'locale',
      header: 'Language',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Globe className="h-3 w-3" />
          {row.original.locale.toUpperCase()}
        </div>
      ),
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }) => row.original.author.name,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {format(new Date(row.original.updatedAt), 'MMM d, yyyy')}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/content/${row.original.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link 
                href={`/${row.original.locale}/${row.original.slug}`}
                target="_blank"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
  
  const stats = React.useMemo(() => {
    if (!data?.items) return null
    
    const items = data.items
    return {
      total: items.length,
      published: items.filter(i => i.status === 'published').length,
      draft: items.filter(i => i.status === 'draft').length,
      scheduled: items.filter(i => i.status === 'scheduled').length,
    }
  }, [data])
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Manage pages, tools, FAQs, and other content
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Content
          </Link>
        </Button>
      </div>
      
      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.published}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {stats.draft}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.scheduled}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={contentType} onValueChange={setContentType as any}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="page">Pages</SelectItem>
                  <SelectItem value="tool">Tools</SelectItem>
                  <SelectItem value="faq">FAQs</SelectItem>
                  <SelectItem value="guide">Guides</SelectItem>
                  <SelectItem value="announcement">Announcements</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={status} onValueChange={setStatus as any}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger className="w-[150px]">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="ru">Russian</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Content Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data?.items || []}
            loading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}

async function fetchContent(params: any) {
  const searchParams = new URLSearchParams(params)
  const response = await fetch(`/api/admin/content?${searchParams}`)
  return response.json()
}

async function handleDelete(id: string) {
  if (!confirm('Are you sure you want to delete this content?')) return
  
  await fetch(`/api/admin/content/${id}`, {
    method: 'DELETE',
  })
  
  // Refresh data
  queryClient.invalidateQueries({ queryKey: ['admin-content'] })
}
```

### 5. Content Editor Page

#### Create `src/app/[locale]/admin/content/[id]/edit/page.tsx`
```typescript
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { RichTextEditor } from '@/components/cms/rich-text-editor'
import { ImageUploader } from '@/components/cms/image-uploader'
import { ContentStatus, ContentType } from '@/lib/cms/content-types'
import { Save, Clock, Eye, History, Globe } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'

interface ContentEditorProps {
  params: {
    id: string
    locale: string
  }
}

export default function ContentEditorPage({ params }: ContentEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isNew = params.id === 'new'
  
  const [content, setContent] = React.useState({
    type: 'page' as ContentType,
    status: 'draft' as ContentStatus,
    slug: '',
    locale: params.locale,
    title: '',
    description: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [] as string[],
      ogImage: '',
      noIndex: false,
    },
    tags: [] as string[],
    category: '',
  })
  
  // Load existing content
  const { data: existingContent } = useQuery({
    queryKey: ['content', params.id],
    queryFn: () => fetchContent(params.id),
    enabled: !isNew,
  })
  
  React.useEffect(() => {
    if (existingContent) {
      setContent(existingContent)
    }
  }, [existingContent])
  
  // Save mutation
  const saveMutation = useMutation({
    mutationFn: () => isNew ? createContent(content) : updateContent(params.id, content),
    onSuccess: (data) => {
      toast({
        title: 'Content saved',
        description: 'Your changes have been saved successfully.',
      })
      
      if (isNew) {
        router.push(`/admin/content/${data.id}/edit`)
      }
    },
    onError: () => {
      toast({
        title: 'Save failed',
        description: 'Failed to save content. Please try again.',
        variant: 'destructive',
      })
    },
  })
  
  const handleSave = () => {
    saveMutation.mutate()
  }
  
  const handlePublish = () => {
    setContent({ ...content, status: 'published' })
    saveMutation.mutate()
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isNew ? 'Create Content' : 'Edit Content'}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{content.type}</Badge>
            <Badge 
              className={cn(
                'text-white',
                content.status === 'published' && 'bg-green-500',
                content.status === 'draft' && 'bg-gray-500',
                content.status === 'scheduled' && 'bg-blue-500'
              )}
            >
              {content.status}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Globe className="h-3 w-3" />
              {content.locale.toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/${content.locale}/${content.slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={handlePublish}
            disabled={saveMutation.isPending || !content.slug}
          >
            Publish
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={content.title}
                    onChange={(e) => setContent({ ...content, title: e.target.value })}
                    placeholder="Page title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={content.slug}
                    onChange={(e) => setContent({ 
                      ...content, 
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') 
                    })}
                    placeholder="url-slug"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={content.description}
                  onChange={(e) => setContent({ ...content, description: e.target.value })}
                  placeholder="Brief description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Featured Image</Label>
                <ImageUploader
                  value={content.featuredImage}
                  onChange={(url) => setContent({ ...content, featuredImage: url })}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={content.content}
                onChange={(value) => setContent({ ...content, content: value })}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize how this content appears in search results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={content.seo.metaTitle}
                  onChange={(e) => setContent({
                    ...content,
                    seo: { ...content.seo, metaTitle: e.target.value }
                  })}
                  placeholder="SEO title (max 60 characters)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {content.seo.metaTitle.length}/60 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={content.seo.metaDescription}
                  onChange={(e) => setContent({
                    ...content,
                    seo: { ...content.seo, metaDescription: e.target.value }
                  })}
                  placeholder="SEO description (max 160 characters)"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {content.seo.metaDescription.length}/160 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Keywords</Label>
                <TagInput
                  value={content.seo.keywords}
                  onChange={(keywords) => setContent({
                    ...content,
                    seo: { ...content.seo, keywords }
                  })}
                  placeholder="Add keywords..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="noindex"
                  checked={content.seo.noIndex}
                  onCheckedChange={(checked) => setContent({
                    ...content,
                    seo: { ...content.seo, noIndex: checked }
                  })}
                />
                <Label htmlFor="noindex">
                  Prevent search engines from indexing this page
                </Label>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Search Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-lg font-medium text-blue-600 hover:underline cursor-pointer">
                  {content.seo.metaTitle || content.title || 'Page Title'}
                </h3>
                <p className="text-sm text-green-700">
                  {window.location.origin}/{content.locale}/{content.slug || 'page-url'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {content.seo.metaDescription || content.description || 'Page description will appear here...'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publishing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Content Type</Label>
                  <Select
                    value={content.type}
                    onValueChange={(value) => setContent({ 
                      ...content, 
                      type: value as ContentType 
                    })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="tool">Tool</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={content.category}
                    onChange={(e) => setContent({ ...content, category: e.target.value })}
                    placeholder="Category"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tags</Label>
                <TagInput
                  value={content.tags}
                  onChange={(tags) => setContent({ ...content, tags })}
                  placeholder="Add tags..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <ContentHistory contentId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// API functions
async function fetchContent(id: string) {
  const response = await fetch(`/api/admin/content/${id}`)
  return response.json()
}

async function createContent(content: any) {
  const response = await fetch('/api/admin/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  })
  return response.json()
}

async function updateContent(id: string, content: any) {
  const response = await fetch(`/api/admin/content/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  })
  return response.json()
}
```

## Testing & Verification

1. Test content creation and editing
2. Verify multi-language support
3. Test version history and rollback
4. Check content scheduling
5. Verify SEO metadata
6. Test rich text editor

## Success Indicators
- ✅ Content easily manageable
- ✅ Multi-language content supported
- ✅ Version history tracking
- ✅ SEO optimization built-in
- ✅ Rich text editing smooth
- ✅ Content workflow functional

## Next Steps
Proceed to Story 6.5: Backup & Disaster Recovery

## Notes
- Regular content audits
- Train content editors
- Monitor content performance
- Set up content templates
- Implement content governance