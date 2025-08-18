# Story 2.3: Text Input/Output Components

## Story Details
- **Stage**: 2 - Core Features & Shared Components
- **Priority**: High
- **Estimated Hours**: 3-4 hours
- **Dependencies**: Story 2.2 (Tool Layout Template)

## Objective
Create advanced, reusable text input and output components with features like syntax highlighting, line numbers, diff view, multiple format support, and advanced editing capabilities. These components will be the core interface for all text manipulation tools.

## Acceptance Criteria
- [ ] Rich text editor with syntax highlighting
- [ ] Line numbers toggle
- [ ] Word wrap toggle
- [ ] Multiple view modes (plain, code, diff, markdown preview)
- [ ] Find and replace functionality
- [ ] Undo/redo support
- [ ] Multiple file format support
- [ ] Drag and drop file upload
- [ ] Export in multiple formats
- [ ] Accessibility compliant

## Implementation Steps

### 1. Install Additional Dependencies

```bash
# Code editor and syntax highlighting
npm install @monaco-editor/react monaco-editor
npm install @uiw/react-md-editor @uiw/react-markdown-preview
npm install diff react-diff-viewer-continued
npm install prismjs @types/prismjs

# File handling
npm install react-dropzone file-saver
npm install mammoth pdf-parse

# Additional utilities
npm install lodash.debounce @types/lodash.debounce
```

### 2. Create Text Editor Types

#### Create `src/types/text-editor.ts`
```typescript
export interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  onSelectionChange?: (selection: TextSelection) => void
  language?: string
  theme?: 'light' | 'dark' | 'auto'
  options?: TextEditorOptions
  className?: string
  readOnly?: boolean
  error?: string
}

export interface TextEditorOptions {
  lineNumbers?: boolean
  wordWrap?: boolean
  minimap?: boolean
  fontSize?: number
  tabSize?: number
  showInvisibles?: boolean
  highlightActiveLine?: boolean
  scrollBeyondLastLine?: boolean
  formatOnPaste?: boolean
  autoCloseBrackets?: boolean
}

export interface TextSelection {
  start: number
  end: number
  text: string
}

export interface TextViewMode {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType<TextViewerProps>
}

export interface TextViewerProps {
  value: string
  options?: any
  className?: string
}

export interface DiffViewerProps {
  original: string
  modified: string
  splitView?: boolean
  className?: string
}

export interface FileFormat {
  id: string
  label: string
  extensions: string[]
  mimeTypes: string[]
  icon?: React.ComponentType<{ className?: string }>
}

export interface ExportOptions {
  format: FileFormat
  filename?: string
  includeMetadata?: boolean
}
```

### 3. Create Monaco Editor Wrapper

#### Create `src/components/ui/monaco-editor.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import MonacoEditor, { Monaco } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import { cn } from '@/lib/utils'
import { TextEditorProps } from '@/types/text-editor'
import { Skeleton } from '@/components/ui/skeleton'

export function CodeEditor({
  value,
  onChange,
  onSelectionChange,
  language = 'plaintext',
  theme: editorTheme = 'auto',
  options = {},
  className,
  readOnly = false,
  error,
}: TextEditorProps) {
  const { resolvedTheme } = useTheme()
  const [isLoading, setIsLoading] = React.useState(true)
  const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null)

  const theme = React.useMemo(() => {
    if (editorTheme === 'auto') {
      return resolvedTheme === 'dark' ? 'vs-dark' : 'vs'
    }
    return editorTheme === 'dark' ? 'vs-dark' : 'vs'
  }, [editorTheme, resolvedTheme])

  const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: options.minimap ?? false },
    lineNumbers: options.lineNumbers ? 'on' : 'off',
    wordWrap: options.wordWrap ? 'on' : 'off',
    fontSize: options.fontSize ?? 14,
    tabSize: options.tabSize ?? 2,
    renderWhitespace: options.showInvisibles ? 'all' : 'none',
    renderLineHighlight: options.highlightActiveLine ? 'all' : 'none',
    scrollBeyondLastLine: options.scrollBeyondLastLine ?? false,
    formatOnPaste: options.formatOnPaste ?? true,
    autoClosingBrackets: options.autoCloseBrackets ? 'always' : 'never',
    readOnly,
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    padding: { top: 16, bottom: 16 },
  }

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor
    setIsLoading(false)

    // Set up selection change listener
    if (onSelectionChange) {
      editor.onDidChangeCursorSelection((e) => {
        const selection = editor.getSelection()
        if (selection) {
          const selectedText = editor.getModel()?.getValueInRange(selection) || ''
          onSelectionChange({
            start: editor.getModel()?.getOffsetAt(selection.getStartPosition()) || 0,
            end: editor.getModel()?.getOffsetAt(selection.getEndPosition()) || 0,
            text: selectedText,
          })
        }
      })
    }

    // Custom key bindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
      editor.getAction('editor.action.duplicateSelection')?.run()
    })
  }

  return (
    <div className={cn('relative', className)}>
      {isLoading && (
        <Skeleton className="absolute inset-0 z-10" />
      )}
      <div className={cn(
        'overflow-hidden rounded-lg border',
        error && 'border-destructive',
        isLoading && 'opacity-0'
      )}>
        <MonacoEditor
          height="400px"
          language={language}
          value={value}
          onChange={(val) => onChange(val || '')}
          theme={theme}
          options={defaultOptions}
          onMount={handleEditorDidMount}
          loading={null}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
```

### 4. Create Plain Text Editor

#### Create `src/components/ui/plain-text-editor.tsx`
```typescript
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { TextEditorProps } from '@/types/text-editor'
import { ScrollArea } from '@/components/ui/scroll-area'

export function PlainTextEditor({
  value,
  onChange,
  onSelectionChange,
  options = {},
  className,
  readOnly = false,
  error,
}: TextEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = React.useRef<HTMLDivElement>(null)
  const [lineCount, setLineCount] = React.useState(1)

  React.useEffect(() => {
    const lines = value.split('\n').length
    setLineCount(lines)
  }, [value])

  const handleSelectionChange = () => {
    if (!textareaRef.current || !onSelectionChange) return

    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const text = value.substring(start, end)

    onSelectionChange({ start, end, text })
  }

  const handleScroll = () => {
    if (!textareaRef.current || !lineNumbersRef.current) return
    lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
  }

  return (
    <div className={cn('relative flex', className)}>
      {options.lineNumbers && (
        <div
          ref={lineNumbersRef}
          className="select-none overflow-hidden border-r bg-muted/30 px-2 py-4 text-right"
          style={{
            fontSize: `${options.fontSize || 14}px`,
            lineHeight: '1.5em',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="text-muted-foreground">
              {i + 1}
            </div>
          ))}
        </div>
      )}
      
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelectionChange}
        onScroll={handleScroll}
        readOnly={readOnly}
        className={cn(
          'min-h-[400px] resize-none rounded-none border-0 p-4',
          'font-mono focus-visible:ring-0 focus-visible:ring-offset-0',
          options.wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto',
          error && 'border-destructive',
        )}
        style={{
          fontSize: `${options.fontSize || 14}px`,
          tabSize: options.tabSize || 2,
          lineHeight: '1.5em',
        }}
        spellCheck={false}
      />
    </div>
  )
}
```

### 5. Create Diff Viewer Component

#### Create `src/components/ui/diff-viewer.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued'
import { cn } from '@/lib/utils'
import { DiffViewerProps } from '@/types/text-editor'

export function DiffViewer({
  original,
  modified,
  splitView = true,
  className,
}: DiffViewerProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const highlightStyles = {
    variables: {
      light: {
        diffViewerBackground: '#ffffff',
        diffViewerColor: '#212529',
        addedBackground: '#e6ffed',
        addedColor: '#24292e',
        removedBackground: '#ffeef0',
        removedColor: '#24292e',
        wordAddedBackground: '#acf2bd',
        wordRemovedBackground: '#fdb8c0',
        addedGutterBackground: '#cdffd8',
        removedGutterBackground: '#ffdce0',
        gutterBackground: '#f7f7f7',
        gutterBackgroundDark: '#f3f1f1',
        highlightBackground: '#fffbdd',
        highlightGutterBackground: '#fff5b1',
      },
      dark: {
        diffViewerBackground: '#0d1117',
        diffViewerColor: '#c9d1d9',
        addedBackground: '#0d2f1b',
        addedColor: '#c9d1d9',
        removedBackground: '#3f1319',
        removedColor: '#c9d1d9',
        wordAddedBackground: '#1c4f2f',
        wordRemovedBackground: '#6f1824',
        addedGutterBackground: '#1c4f2f',
        removedGutterBackground: '#6f1824',
        gutterBackground: '#161b22',
        gutterBackgroundDark: '#0d1117',
        highlightBackground: '#3a3000',
        highlightGutterBackground: '#4d4000',
      },
    },
  }

  return (
    <div className={cn('overflow-auto rounded-lg border', className)}>
      <ReactDiffViewer
        oldValue={original}
        newValue={modified}
        splitView={splitView}
        compareMethod={DiffMethod.WORDS}
        styles={highlightStyles.variables[isDark ? 'dark' : 'light']}
        leftTitle="Original"
        rightTitle="Modified"
        showDiffOnly={false}
      />
    </div>
  )
}
```

### 6. Create Markdown Preview Component

#### Create `src/components/ui/markdown-preview.tsx`
```typescript
'use client'

import * as React from 'react'
import MDEditor from '@uiw/react-md-editor'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { TextViewerProps } from '@/types/text-editor'

export function MarkdownPreview({
  value,
  className,
}: TextViewerProps) {
  const { resolvedTheme } = useTheme()

  return (
    <div 
      className={cn('prose dark:prose-invert max-w-none', className)}
      data-color-mode={resolvedTheme}
    >
      <MDEditor.Markdown 
        source={value}
        style={{ 
          backgroundColor: 'transparent',
          color: 'inherit',
        }}
      />
    </div>
  )
}
```

### 7. Create File Upload Component

#### Create `src/components/ui/file-upload.tsx`
```typescript
'use client'

import * as React from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import mammoth from 'mammoth'

interface FileUploadProps {
  onFileSelect: (content: string, file: File) => void
  accept?: Record<string, string[]>
  maxSize?: number
  className?: string
  disabled?: boolean
}

export function FileUpload({
  onFileSelect,
  accept = {
    'text/*': ['.txt', '.md', '.csv', '.json', '.xml', '.html'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false,
}: FileUploadProps) {
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)

  const processFile = async (file: File) => {
    setLoading(true)
    setProgress(0)
    setError(null)

    try {
      let content = ''

      if (file.type === 'application/pdf') {
        // PDF processing would require a library like pdf.js
        throw new Error('PDF processing not implemented in this example')
      } else if (
        file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        // Process Word documents
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        content = result.value
      } else {
        // Process text files
        content = await file.text()
      }

      setProgress(100)
      onFileSelect(content, file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop: (files) => {
      if (files.length > 0) {
        processFile(files[0])
      }
    },
    accept,
    maxSize,
    multiple: false,
    disabled: disabled || loading,
  })

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative overflow-hidden rounded-lg border-2 border-dashed p-8',
          'transition-colors cursor-pointer',
          isDragActive && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-destructive'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-muted p-4">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports TXT, MD, CSV, JSON, XML, HTML, DOC, DOCX
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: {(maxSize / 1024 / 1024).toFixed(0)}MB
            </p>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="w-full max-w-xs space-y-2">
              <Progress value={progress} />
              <p className="text-center text-sm text-muted-foreground">
                Processing file...
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {acceptedFiles.length > 0 && !loading && !error && (
        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">{acceptedFiles[0].name}</p>
            <p className="text-xs text-muted-foreground">
              ({(acceptedFiles[0].size / 1024).toFixed(1)}KB)
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              acceptedFiles.length = 0
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
```

### 8. Create Advanced Text Editor with All Features

#### Create `src/components/tools/advanced-text-editor.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { 
  FileText, 
  Code, 
  Eye, 
  GitCompare,
  Settings,
  Download,
  Upload,
  Copy,
  RotateCcw,
  RotateCw,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CodeEditor } from '@/components/ui/monaco-editor'
import { PlainTextEditor } from '@/components/ui/plain-text-editor'
import { DiffViewer } from '@/components/ui/diff-viewer'
import { MarkdownPreview } from '@/components/ui/markdown-preview'
import { FileUpload } from '@/components/ui/file-upload'
import { TextCounter } from '@/components/ui/text-counter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TextEditorOptions } from '@/types/text-editor'
import { saveAs } from 'file-saver'

interface AdvancedTextEditorProps {
  value: string
  onChange: (value: string) => void
  originalValue?: string
  title?: string
  readOnly?: boolean
  showUpload?: boolean
  showModeSelector?: boolean
  defaultMode?: 'plain' | 'code' | 'preview' | 'diff'
  className?: string
}

export function AdvancedTextEditor({
  value,
  onChange,
  originalValue = '',
  title,
  readOnly = false,
  showUpload = true,
  showModeSelector = true,
  defaultMode = 'plain',
  className,
}: AdvancedTextEditorProps) {
  const t = useTranslations('common.common')
  const [mode, setMode] = React.useState(defaultMode)
  const [options, setOptions] = React.useState<TextEditorOptions>({
    lineNumbers: true,
    wordWrap: true,
    fontSize: 14,
  })
  const [history, setHistory] = React.useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = React.useState(0)

  // Update history when value changes
  React.useEffect(() => {
    if (value !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(value)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }, [value])

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      onChange(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      onChange(history[historyIndex + 1])
    }
  }

  const handleExport = (format: 'txt' | 'md' | 'json') => {
    const filename = `export.${format}`
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, filename)
  }

  const handleFileUpload = (content: string) => {
    onChange(content)
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title || (readOnly ? t('output') : t('input'))}</CardTitle>
          <div className="flex items-center gap-2">
            {/* History controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUndo}
                disabled={historyIndex === 0}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Mode selector */}
            {showModeSelector && (
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(v) => v && setMode(v as any)}
                className="hidden sm:flex"
              >
                <ToggleGroupItem value="plain" size="sm">
                  <FileText className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="code" size="sm">
                  <Code className="h-4 w-4" />
                </ToggleGroupItem>
                {originalValue && (
                  <ToggleGroupItem value="diff" size="sm">
                    <GitCompare className="h-4 w-4" />
                  </ToggleGroupItem>
                )}
                <ToggleGroupItem value="preview" size="sm">
                  <Eye className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            )}

            {/* Settings menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setOptions({ ...options, lineNumbers: !options.lineNumbers })}
                >
                  {options.lineNumbers ? 'Hide' : 'Show'} Line Numbers
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setOptions({ ...options, wordWrap: !options.wordWrap })}
                >
                  {options.wordWrap ? 'Disable' : 'Enable'} Word Wrap
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('txt')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as TXT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('md')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as MD
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {showUpload && !readOnly && !value && (
          <div className="p-6">
            <FileUpload onFileSelect={handleFileUpload} />
          </div>
        )}

        {(value || readOnly) && (
          <>
            {mode === 'plain' && (
              <PlainTextEditor
                value={value}
                onChange={onChange}
                options={options}
                readOnly={readOnly}
              />
            )}
            
            {mode === 'code' && (
              <CodeEditor
                value={value}
                onChange={onChange}
                options={options}
                readOnly={readOnly}
              />
            )}
            
            {mode === 'diff' && originalValue && (
              <DiffViewer
                original={originalValue}
                modified={value}
              />
            )}
            
            {mode === 'preview' && (
              <div className="p-6">
                <MarkdownPreview value={value} />
              </div>
            )}

            <div className="border-t bg-muted/30 px-6 py-3">
              <TextCounter text={value} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
```

### 9. Create Find & Replace Dialog

#### Create `src/components/tools/find-replace-dialog.tsx`
```typescript
'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Search, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

interface FindReplaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  text: string
  onReplace: (text: string) => void
}

export function FindReplaceDialog({
  open,
  onOpenChange,
  text,
  onReplace,
}: FindReplaceDialogProps) {
  const t = useTranslations('common.tools')
  const [find, setFind] = React.useState('')
  const [replace, setReplace] = React.useState('')
  const [caseSensitive, setCaseSensitive] = React.useState(false)
  const [wholeWord, setWholeWord] = React.useState(false)
  const [useRegex, setUseRegex] = React.useState(false)

  const handleReplace = () => {
    if (!find) return

    let pattern: RegExp
    if (useRegex) {
      pattern = new RegExp(find, caseSensitive ? 'g' : 'gi')
    } else {
      let escapedFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      if (wholeWord) {
        escapedFind = `\\b${escapedFind}\\b`
      }
      pattern = new RegExp(escapedFind, caseSensitive ? 'g' : 'gi')
    }

    const newText = text.replace(pattern, replace)
    onReplace(newText)
  }

  const handleReplaceAll = () => {
    handleReplace()
    onOpenChange(false)
  }

  const countMatches = () => {
    if (!find) return 0
    
    try {
      let pattern: RegExp
      if (useRegex) {
        pattern = new RegExp(find, caseSensitive ? 'g' : 'gi')
      } else {
        let escapedFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        if (wholeWord) {
          escapedFind = `\\b${escapedFind}\\b`
        }
        pattern = new RegExp(escapedFind, caseSensitive ? 'g' : 'gi')
      }
      
      const matches = text.match(pattern)
      return matches ? matches.length : 0
    } catch {
      return 0
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('findReplace')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="find">{t('find')}</Label>
            <Input
              id="find"
              value={find}
              onChange={(e) => setFind(e.target.value)}
              placeholder={t('findPlaceholder')}
              autoFocus
            />
            {find && (
              <p className="text-sm text-muted-foreground">
                {countMatches()} {t('matches')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="replace">{t('replaceWith')}</Label>
            <Input
              id="replace"
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              placeholder={t('replacePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="case-sensitive"
                checked={caseSensitive}
                onCheckedChange={(checked) => setCaseSensitive(!!checked)}
              />
              <Label htmlFor="case-sensitive">{t('caseSensitive')}</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="whole-word"
                checked={wholeWord}
                onCheckedChange={(checked) => setWholeWord(!!checked)}
                disabled={useRegex}
              />
              <Label htmlFor="whole-word">{t('wholeWord')}</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-regex"
                checked={useRegex}
                onCheckedChange={(checked) => setUseRegex(!!checked)}
              />
              <Label htmlFor="use-regex">{t('useRegex')}</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleReplaceAll} disabled={!find}>
              {t('replaceAll')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### 10. Update Translation Files

Add the following translations to your locale files:

#### Update `src/i18n/locales/en/common.json`
```json
{
  // ... existing translations ...
  "common": {
    // ... existing common translations ...
    "paste": "Paste",
    "upload": "Upload",
    "enterText": "Enter or paste your text here...",
    "outputWillAppearHere": "Output will appear here...",
    "options": "Options"
  },
  "tools": {
    "findReplace": "Find & Replace",
    "find": "Find",
    "findPlaceholder": "Text to find...",
    "replaceWith": "Replace with",
    "replacePlaceholder": "Replacement text...",
    "matches": "matches found",
    "caseSensitive": "Case sensitive",
    "wholeWord": "Whole word",
    "useRegex": "Use regular expressions",
    "cancel": "Cancel",
    "replaceAll": "Replace All"
  }
}
```

## Testing & Verification

### 1. Test Text Input Features
- Type text manually
- Upload various file formats (TXT, MD, DOC)
- Drag and drop files
- Test paste functionality
- Verify character limits work

### 2. Test Editor Modes
- Switch between plain, code, diff, and preview modes
- Verify syntax highlighting in code mode
- Test diff view with original content
- Check markdown preview rendering

### 3. Test Editor Options
- Toggle line numbers
- Toggle word wrap
- Change font size
- Test undo/redo functionality

### 4. Test Find & Replace
- Simple text replacement
- Case-sensitive search
- Whole word matching
- Regular expression support
- Verify match counting

### 5. Test Export Features
- Export as TXT
- Export as MD
- Export as JSON
- Verify file downloads correctly

### 6. Test Accessibility
- Keyboard navigation
- Screen reader compatibility
- Focus management
- ARIA labels

## Success Indicators
- ✅ Multiple editor modes working
- ✅ File upload supports multiple formats
- ✅ Syntax highlighting functional
- ✅ Diff view shows changes clearly
- ✅ Find & replace works with regex
- ✅ Undo/redo maintains history
- ✅ Export functionality works
- ✅ Responsive on all devices
- ✅ Accessible to all users
- ✅ Performance with large texts

## Common Issues & Solutions

### Issue: Monaco editor not loading
**Solution**: Ensure webpack is configured for Monaco worker files

### Issue: Large files cause lag
**Solution**: Implement virtualization or pagination for very large texts

### Issue: Regex errors crash find/replace
**Solution**: Wrap regex creation in try-catch blocks

### Issue: File upload fails silently
**Solution**: Add proper error handling and user feedback

## Next Steps
Once this story is complete, proceed to Story 2.4: Copy to Clipboard & Action Buttons

## Notes for AI Implementation
- Test with various file formats and sizes
- Ensure all features work across browsers
- Monitor memory usage with large texts
- Add proper loading states
- Consider adding auto-save functionality
- Test with different languages and scripts