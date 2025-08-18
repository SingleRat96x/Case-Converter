# Story 2.4: Copy to Clipboard & Action Buttons

## Story Details
- **Stage**: 2 - Core Features & Shared Components
- **Priority**: High
- **Estimated Hours**: 2-3 hours
- **Dependencies**: Story 2.3 (Text Input/Output Components)

## Objective
Create a comprehensive set of action buttons for text manipulation tools including copy to clipboard, download, share, clear, and other common actions. These buttons should provide visual feedback, handle errors gracefully, and work consistently across all tools.

## Acceptance Criteria
- [ ] Copy to clipboard with success feedback
- [ ] Download in multiple formats (TXT, JSON, CSV, etc.)
- [ ] Share functionality (Web Share API)
- [ ] Clear/Reset actions with confirmation
- [ ] Bulk actions support
- [ ] Keyboard shortcuts
- [ ] Loading states for async actions
- [ ] Error handling with user feedback
- [ ] Mobile-optimized touch targets
- [ ] Accessibility compliant

## Implementation Steps

### 1. Create Action Types and Utilities

#### Create `src/types/actions.ts`
```typescript
import { LucideIcon } from 'lucide-react'

export interface ActionButton {
  id: string
  label: string
  icon?: LucideIcon
  shortcut?: string
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  onClick: () => void | Promise<void>
  disabled?: boolean
  loading?: boolean
  tooltip?: string
  confirmMessage?: string
  successMessage?: string
  errorMessage?: string
}

export interface ActionGroup {
  id: string
  label?: string
  actions: ActionButton[]
  orientation?: 'horizontal' | 'vertical'
}

export interface ShareOptions {
  title?: string
  text?: string
  url?: string
  files?: File[]
}

export interface DownloadOptions {
  filename: string
  content: string | Blob
  mimeType?: string
}

export interface CopyOptions {
  text: string
  format?: 'text' | 'html' | 'markdown'
  onSuccess?: () => void
  onError?: (error: Error) => void
}
```

### 2. Create Clipboard Utilities

#### Create `src/lib/clipboard.ts`
```typescript
import { toast } from '@/components/ui/use-toast'

export interface ClipboardResult {
  success: boolean
  error?: Error
}

export async function copyToClipboard(
  text: string,
  format: 'text' | 'html' | 'markdown' = 'text'
): Promise<ClipboardResult> {
  try {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not supported')
    }

    switch (format) {
      case 'html':
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([text], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' }),
          }),
        ])
        break
      
      case 'markdown':
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/markdown': new Blob([text], { type: 'text/markdown' }),
            'text/plain': new Blob([text], { type: 'text/plain' }),
          }),
        ])
        break
      
      default:
        await navigator.clipboard.writeText(text)
    }

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Failed to copy')
    }
  }
}

export async function readFromClipboard(): Promise<string> {
  try {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not supported')
    }

    const text = await navigator.clipboard.readText()
    return text
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to read clipboard')
  }
}

// Fallback for older browsers
export function copyToClipboardFallback(text: string): boolean {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.top = '-9999px'
  textArea.style.left = '-9999px'
  
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  
  try {
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    return successful
  } catch (err) {
    document.body.removeChild(textArea)
    return false
  }
}

export function supportsClipboardAPI(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.writeText)
}
```

### 3. Create Enhanced Copy Button

#### Update `src/components/ui/copy-button.tsx`
```typescript
'use client'

import * as React from 'react'
import { Check, Copy, AlertCircle } from 'lucide-react'
import { Button, ButtonProps } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { copyToClipboard, copyToClipboardFallback, supportsClipboardAPI } from '@/lib/clipboard'
import { useTranslations } from 'next-intl'
import { toast } from '@/components/ui/use-toast'

export interface CopyButtonProps extends Omit<ButtonProps, 'onClick'> {
  text: string
  format?: 'text' | 'html' | 'markdown'
  onCopy?: () => void
  onError?: (error: Error) => void
  showTooltip?: boolean
  successMessage?: string
  errorMessage?: string
  duration?: number
}

export function CopyButton({
  text,
  format = 'text',
  onCopy,
  onError,
  showTooltip = true,
  successMessage,
  errorMessage,
  duration = 2000,
  className,
  variant = 'outline',
  size = 'sm',
  disabled,
  children,
  ...props
}: CopyButtonProps) {
  const t = useTranslations('common.common')
  const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>('idle')
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleCopy = async () => {
    try {
      let success = false

      if (supportsClipboardAPI()) {
        const result = await copyToClipboard(text, format)
        success = result.success
        if (!success && result.error) {
          throw result.error
        }
      } else {
        // Fallback for older browsers
        success = copyToClipboardFallback(text)
        if (!success) {
          throw new Error('Failed to copy text')
        }
      }

      if (success) {
        setStatus('success')
        onCopy?.()
        
        if (successMessage) {
          toast({
            description: successMessage,
            duration: 3000,
          })
        }

        timeoutRef.current = setTimeout(() => {
          setStatus('idle')
        }, duration)
      }
    } catch (err) {
      setStatus('error')
      const error = err instanceof Error ? err : new Error('Failed to copy')
      onError?.(error)
      
      if (errorMessage) {
        toast({
          variant: 'destructive',
          description: errorMessage,
          duration: 3000,
        })
      }

      timeoutRef.current = setTimeout(() => {
        setStatus('idle')
      }, duration)
    }
  }

  const buttonContent = (
    <>
      {status === 'idle' && (
        <>
          <Copy className="h-4 w-4" />
          {children || (size !== 'icon' && t('copy'))}
        </>
      )}
      {status === 'success' && (
        <>
          <Check className="h-4 w-4" />
          {children || (size !== 'icon' && t('copied'))}
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-4 w-4" />
          {children || (size !== 'icon' && t('error'))}
        </>
      )}
    </>
  )

  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={disabled || !text}
      className={cn(
        'transition-all gap-2',
        status === 'success' && 'text-green-600 dark:text-green-400',
        status === 'error' && 'text-destructive',
        className
      )}
      {...props}
    >
      {buttonContent}
    </Button>
  )

  if (!showTooltip) {
    return button
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{t('copyToClipboard')}</p>
          {props['aria-label'] && (
            <kbd className="ml-2 text-xs">{props['aria-label']}</kbd>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

### 4. Create Download Button

#### Create `src/components/ui/download-button.tsx`
```typescript
'use client'

import * as React from 'react'
import { Download, FileText, FileJson, Table, File, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { toast } from '@/components/ui/use-toast'
import { saveAs } from 'file-saver'

export interface DownloadFormat {
  id: string
  label: string
  extension: string
  mimeType: string
  icon?: React.ComponentType<{ className?: string }>
  transform?: (content: string) => string | Blob
}

export interface DownloadButtonProps {
  content: string
  filename?: string
  formats?: DownloadFormat[]
  defaultFormat?: string
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  onDownload?: (format: DownloadFormat) => void
}

const defaultFormats: DownloadFormat[] = [
  {
    id: 'txt',
    label: 'Text File',
    extension: 'txt',
    mimeType: 'text/plain',
    icon: FileText,
  },
  {
    id: 'json',
    label: 'JSON File',
    extension: 'json',
    mimeType: 'application/json',
    icon: FileJson,
    transform: (content) => {
      try {
        return JSON.stringify({ content }, null, 2)
      } catch {
        return content
      }
    },
  },
  {
    id: 'csv',
    label: 'CSV File',
    extension: 'csv',
    mimeType: 'text/csv',
    icon: Table,
    transform: (content) => {
      // Simple CSV transformation - escape quotes and wrap in quotes
      const escaped = content.replace(/"/g, '""')
      return `"${escaped}"`
    },
  },
  {
    id: 'md',
    label: 'Markdown File',
    extension: 'md',
    mimeType: 'text/markdown',
    icon: File,
  },
]

export function DownloadButton({
  content,
  filename = 'download',
  formats = defaultFormats,
  defaultFormat,
  variant = 'outline',
  size = 'sm',
  className,
  disabled,
  onDownload,
}: DownloadButtonProps) {
  const t = useTranslations('common.common')
  const [downloading, setDownloading] = React.useState(false)
  const [lastDownloaded, setLastDownloaded] = React.useState<string | null>(null)

  const handleDownload = async (format: DownloadFormat) => {
    setDownloading(true)
    
    try {
      let blob: Blob
      
      if (format.transform) {
        const transformed = format.transform(content)
        blob = transformed instanceof Blob 
          ? transformed 
          : new Blob([transformed], { type: format.mimeType })
      } else {
        blob = new Blob([content], { type: format.mimeType })
      }

      const fullFilename = `${filename}.${format.extension}`
      saveAs(blob, fullFilename)
      
      setLastDownloaded(format.id)
      onDownload?.(format)
      
      toast({
        description: t('downloadSuccess', { filename: fullFilename }),
        duration: 3000,
      })

      // Reset the success indicator after 2 seconds
      setTimeout(() => {
        setLastDownloaded(null)
      }, 2000)
    } catch (error) {
      toast({
        variant: 'destructive',
        description: t('downloadError'),
        duration: 3000,
      })
    } finally {
      setDownloading(false)
    }
  }

  // If only one format or default format specified, download directly
  if (formats.length === 1 || defaultFormat) {
    const format = defaultFormat 
      ? formats.find(f => f.id === defaultFormat) || formats[0]
      : formats[0]

    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => handleDownload(format)}
        disabled={disabled || !content || downloading}
        className={cn('gap-2', className)}
      >
        <Download className="h-4 w-4" />
        {size !== 'icon' && t('download')}
      </Button>
    )
  }

  // Multiple formats - show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || !content || downloading}
          className={cn('gap-2', className)}
        >
          <Download className="h-4 w-4" />
          {size !== 'icon' && t('download')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{t('downloadAs')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {formats.map((format) => {
          const Icon = format.icon || File
          const isLastDownloaded = lastDownloaded === format.id
          
          return (
            <DropdownMenuItem
              key={format.id}
              onClick={() => handleDownload(format)}
              disabled={downloading}
              className="gap-2"
            >
              {isLastDownloaded ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              {format.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 5. Create Share Button

#### Create `src/components/ui/share-button.tsx`
```typescript
'use client'

import * as React from 'react'
import { Share2, Mail, MessageCircle, Link2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { toast } from '@/components/ui/use-toast'
import { copyToClipboard } from '@/lib/clipboard'

export interface ShareButtonProps {
  title?: string
  text?: string
  url?: string
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  onShare?: (method: string) => void
}

export function ShareButton({
  title = 'Check out this content',
  text = '',
  url = typeof window !== 'undefined' ? window.location.href : '',
  variant = 'outline',
  size = 'sm',
  className,
  disabled,
  onShare,
}: ShareButtonProps) {
  const t = useTranslations('common.common')
  const [justCopied, setJustCopied] = React.useState(false)

  const canUseWebShare = React.useMemo(() => {
    return typeof navigator !== 'undefined' && navigator.share
  }, [])

  const handleWebShare = async () => {
    try {
      await navigator.share({
        title,
        text,
        url,
      })
      onShare?.('web-share')
    } catch (err) {
      // User cancelled or error occurred
      if (err instanceof Error && err.name !== 'AbortError') {
        toast({
          variant: 'destructive',
          description: t('shareError'),
        })
      }
    }
  }

  const handleCopyLink = async () => {
    const result = await copyToClipboard(url)
    if (result.success) {
      setJustCopied(true)
      onShare?.('copy-link')
      toast({
        description: t('linkCopied'),
      })
      setTimeout(() => setJustCopied(false), 2000)
    }
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`${text}\n\n${url}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
    onShare?.('email')
  }

  const handleWhatsAppShare = () => {
    const shareText = encodeURIComponent(`${title}\n${text}\n${url}`)
    window.open(`https://wa.me/?text=${shareText}`, '_blank')
    onShare?.('whatsapp')
  }

  const handleTwitterShare = () => {
    const shareText = encodeURIComponent(`${title}\n${text}`)
    const shareUrl = encodeURIComponent(url)
    window.open(
      `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      '_blank'
    )
    onShare?.('twitter')
  }

  // If Web Share API is available, use it directly
  if (canUseWebShare) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleWebShare}
        disabled={disabled}
        className={cn('gap-2', className)}
      >
        <Share2 className="h-4 w-4" />
        {size !== 'icon' && t('share')}
      </Button>
    )
  }

  // Fallback to custom share menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled}
          className={cn('gap-2', className)}
        >
          <Share2 className="h-4 w-4" />
          {size !== 'icon' && t('share')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
          {justCopied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          {t('copyLink')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleEmailShare} className="gap-2">
          <Mail className="h-4 w-4" />
          {t('shareViaEmail')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsAppShare} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          {t('shareViaWhatsApp')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          {t('shareViaTwitter')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 6. Create Action Button Group

#### Create `src/components/ui/action-button-group.tsx`
```typescript
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ButtonExtended } from '@/components/ui/button-extended'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ActionButton, ActionGroup } from '@/types/actions'
import { toast } from '@/components/ui/use-toast'

interface ActionButtonGroupProps {
  actions: ActionButton[] | ActionGroup[]
  orientation?: 'horizontal' | 'vertical'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function ActionButtonGroup({
  actions,
  orientation = 'horizontal',
  size = 'default',
  className,
}: ActionButtonGroupProps) {
  const [confirmAction, setConfirmAction] = React.useState<ActionButton | null>(null)
  const [loadingActions, setLoadingActions] = React.useState<Set<string>>(new Set())

  const isActionGroup = (item: ActionButton | ActionGroup): item is ActionGroup => {
    return 'actions' in item
  }

  const handleAction = async (action: ActionButton) => {
    if (action.confirmMessage) {
      setConfirmAction(action)
      return
    }

    await executeAction(action)
  }

  const executeAction = async (action: ActionButton) => {
    setLoadingActions(prev => new Set(prev).add(action.id))

    try {
      await action.onClick()
      
      if (action.successMessage) {
        toast({
          description: action.successMessage,
          duration: 3000,
        })
      }
    } catch (error) {
      const errorMessage = action.errorMessage || 
        (error instanceof Error ? error.message : 'Action failed')
      
      toast({
        variant: 'destructive',
        description: errorMessage,
        duration: 3000,
      })
    } finally {
      setLoadingActions(prev => {
        const next = new Set(prev)
        next.delete(action.id)
        return next
      })
    }
  }

  const renderAction = (action: ActionButton) => {
    const isLoading = loadingActions.has(action.id) || action.loading
    
    const button = (
      <ButtonExtended
        key={action.id}
        variant={action.variant || 'outline'}
        size={action.size || size}
        onClick={() => handleAction(action)}
        disabled={action.disabled}
        loading={isLoading}
        className="gap-2"
      >
        {action.icon && !isLoading && <action.icon className="h-4 w-4" />}
        {action.label}
      </ButtonExtended>
    )

    if (!action.tooltip && !action.shortcut) {
      return button
    }

    return (
      <Tooltip key={action.id}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{action.tooltip || action.label}</p>
          {action.shortcut && (
            <kbd className="ml-2 text-xs opacity-70">{action.shortcut}</kbd>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  const renderGroup = (group: ActionGroup, index: number) => (
    <React.Fragment key={group.id}>
      {index > 0 && orientation === 'horizontal' && (
        <Separator orientation="vertical" className="h-8" />
      )}
      {index > 0 && orientation === 'vertical' && (
        <Separator orientation="horizontal" className="w-full" />
      )}
      <div
        className={cn(
          'flex gap-2',
          group.orientation === 'vertical' ? 'flex-col' : 'flex-row'
        )}
      >
        {group.actions.map(renderAction)}
      </div>
    </React.Fragment>
  )

  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex gap-2',
          orientation === 'vertical' ? 'flex-col' : 'flex-row items-center',
          className
        )}
      >
        {actions.map((item, index) => 
          isActionGroup(item) 
            ? renderGroup(item, index)
            : renderAction(item)
        )}
      </div>

      <AlertDialog 
        open={!!confirmAction} 
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction) {
                  executeAction(confirmAction)
                  setConfirmAction(null)
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}
```

### 7. Create Keyboard Shortcuts Hook

#### Create `src/hooks/use-keyboard-shortcuts.ts`
```typescript
'use client'

import * as React from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  action: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatches = shortcut.alt ? event.altKey : !event.altKey
        const metaMatches = shortcut.meta ? event.metaKey : true

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Utility to format shortcut for display
export function formatShortcut(shortcut: Omit<KeyboardShortcut, 'action'>): string {
  const parts: string[] = []
  
  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.alt) parts.push('Alt')
  if (shortcut.meta) parts.push('Cmd')
  
  parts.push(shortcut.key.toUpperCase())
  
  return parts.join('+')
}
```

### 8. Create Action Buttons Preset

#### Create `src/components/tools/action-buttons-preset.tsx`
```typescript
'use client'

import * as React from 'react'
import { 
  Copy, 
  Download, 
  Share2, 
  RotateCcw, 
  Trash2,
  FileUp,
  Maximize2,
  History,
} from 'lucide-react'
import { ActionButtonGroup } from '@/components/ui/action-button-group'
import { CopyButton } from '@/components/ui/copy-button'
import { DownloadButton } from '@/components/ui/download-button'
import { ShareButton } from '@/components/ui/share-button'
import { ActionButton, ActionGroup } from '@/types/actions'
import { useTranslations } from 'next-intl'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'

interface ActionButtonsPresetProps {
  content: string
  onClear?: () => void
  onReset?: () => void
  onUpload?: () => void
  onFullscreen?: () => void
  onHistory?: () => void
  additionalActions?: ActionButton[]
  enableShortcuts?: boolean
  className?: string
}

export function ActionButtonsPreset({
  content,
  onClear,
  onReset,
  onUpload,
  onFullscreen,
  onHistory,
  additionalActions = [],
  enableShortcuts = true,
  className,
}: ActionButtonsPresetProps) {
  const t = useTranslations('common.common')

  const primaryActions: ActionButton[] = [
    {
      id: 'copy',
      label: t('copy'),
      icon: Copy,
      shortcut: 'Ctrl+C',
      onClick: async () => {
        // Handled by CopyButton component
      },
      disabled: !content,
    },
    {
      id: 'download',
      label: t('download'),
      icon: Download,
      shortcut: 'Ctrl+S',
      onClick: async () => {
        // Handled by DownloadButton component
      },
      disabled: !content,
    },
    {
      id: 'share',
      label: t('share'),
      icon: Share2,
      onClick: async () => {
        // Handled by ShareButton component
      },
      disabled: !content,
    },
  ]

  const secondaryActions: ActionButton[] = []

  if (onClear) {
    secondaryActions.push({
      id: 'clear',
      label: t('clear'),
      icon: Trash2,
      variant: 'ghost',
      shortcut: 'Ctrl+Shift+C',
      onClick: onClear,
      confirmMessage: t('clearConfirm'),
      disabled: !content,
    })
  }

  if (onReset) {
    secondaryActions.push({
      id: 'reset',
      label: t('reset'),
      icon: RotateCcw,
      variant: 'ghost',
      onClick: onReset,
      confirmMessage: t('resetConfirm'),
    })
  }

  if (onUpload) {
    secondaryActions.push({
      id: 'upload',
      label: t('upload'),
      icon: FileUp,
      variant: 'ghost',
      onClick: onUpload,
    })
  }

  if (onFullscreen) {
    secondaryActions.push({
      id: 'fullscreen',
      label: t('fullscreen'),
      icon: Maximize2,
      variant: 'ghost',
      shortcut: 'F11',
      onClick: onFullscreen,
    })
  }

  if (onHistory) {
    secondaryActions.push({
      id: 'history',
      label: t('history'),
      icon: History,
      variant: 'ghost',
      onClick: onHistory,
    })
  }

  const actionGroups: ActionGroup[] = [
    {
      id: 'primary',
      actions: primaryActions,
    },
  ]

  if (secondaryActions.length > 0) {
    actionGroups.push({
      id: 'secondary',
      actions: secondaryActions,
    })
  }

  if (additionalActions.length > 0) {
    actionGroups.push({
      id: 'additional',
      actions: additionalActions,
    })
  }

  // Set up keyboard shortcuts
  const shortcuts = React.useMemo(() => {
    const allActions = [...primaryActions, ...secondaryActions, ...additionalActions]
    return allActions
      .filter(action => action.shortcut && !action.disabled)
      .map(action => {
        const parts = action.shortcut!.split('+')
        return {
          key: parts[parts.length - 1],
          ctrl: parts.includes('Ctrl'),
          shift: parts.includes('Shift'),
          alt: parts.includes('Alt'),
          meta: parts.includes('Cmd'),
          action: action.onClick,
          enabled: enableShortcuts,
        }
      })
  }, [primaryActions, secondaryActions, additionalActions, enableShortcuts])

  useKeyboardShortcuts(shortcuts)

  // Replace the default action components with our custom ones
  const renderCustomActions = () => (
    <div className={cn('flex items-center gap-2', className)}>
      <CopyButton text={content} showTooltip />
      <DownloadButton content={content} />
      <ShareButton text={content} />
      
      {secondaryActions.length > 0 && (
        <>
          <Separator orientation="vertical" className="h-8" />
          <ActionButtonGroup actions={secondaryActions} />
        </>
      )}
      
      {additionalActions.length > 0 && (
        <>
          <Separator orientation="vertical" className="h-8" />
          <ActionButtonGroup actions={additionalActions} />
        </>
      )}
    </div>
  )

  return renderCustomActions()
}
```

### 9. Create Action Buttons Story

#### Create `src/components/ui/action-buttons.stories.tsx`
```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { ActionButtonsPreset } from '@/components/tools/action-buttons-preset'
import { CopyButton } from '@/components/ui/copy-button'
import { DownloadButton } from '@/components/ui/download-button'
import { ShareButton } from '@/components/ui/share-button'

const meta = {
  title: 'UI/Action Buttons',
  component: ActionButtonsPreset,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActionButtonsPreset>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: 'Sample text content for action buttons',
    onClear: () => console.log('Clear clicked'),
    onReset: () => console.log('Reset clicked'),
  },
}

export const CopyButtonStory: Story = {
  render: () => (
    <div className="space-y-4">
      <CopyButton text="Copy this text" />
      <CopyButton text="Copy with custom message" successMessage="Text copied!" />
      <CopyButton text="" disabled />
    </div>
  ),
}

export const DownloadButtonStory: Story = {
  render: () => (
    <div className="space-y-4">
      <DownloadButton content="Download this content" />
      <DownloadButton 
        content="Download with single format" 
        formats={[{
          id: 'txt',
          label: 'Text File',
          extension: 'txt',
          mimeType: 'text/plain',
        }]}
      />
    </div>
  ),
}

export const ShareButtonStory: Story = {
  render: () => (
    <div className="space-y-4">
      <ShareButton title="Check this out" text="Amazing content" />
      <ShareButton variant="default" size="lg" />
    </div>
  ),
}
```

### 10. Update Translation Files

Add the following translations:

#### Update `src/i18n/locales/en/common.json`
```json
{
  // ... existing translations ...
  "common": {
    // ... existing common translations ...
    "copy": "Copy",
    "copied": "Copied!",
    "copyToClipboard": "Copy to clipboard",
    "download": "Download",
    "downloadAs": "Download as",
    "downloadSuccess": "Downloaded {filename}",
    "downloadError": "Download failed",
    "share": "Share",
    "shareError": "Unable to share",
    "linkCopied": "Link copied to clipboard",
    "copyLink": "Copy link",
    "shareViaEmail": "Share via Email",
    "shareViaWhatsApp": "Share via WhatsApp",
    "shareViaTwitter": "Share via Twitter",
    "clear": "Clear",
    "clearConfirm": "Are you sure you want to clear the content?",
    "reset": "Reset",
    "resetConfirm": "Are you sure you want to reset to defaults?",
    "upload": "Upload",
    "fullscreen": "Fullscreen",
    "history": "History",
    "error": "Error"
  }
}
```

## Testing & Verification

### 1. Test Copy Functionality
- Copy short text
- Copy large text (>1MB)
- Test with different formats (HTML, Markdown)
- Verify fallback for older browsers
- Check success/error feedback

### 2. Test Download Functionality
- Download as different formats
- Test filename generation
- Verify file contents
- Test with empty content
- Check large file downloads

### 3. Test Share Functionality
- Test Web Share API (mobile)
- Test fallback menu (desktop)
- Verify each share method
- Test with different content types

### 4. Test Keyboard Shortcuts
- Ctrl+C for copy
- Ctrl+S for download
- F11 for fullscreen
- Custom shortcuts

### 5. Test Accessibility
- Keyboard navigation
- Screen reader announcements
- Focus management
- ARIA labels

### 6. Test Mobile Experience
- Touch targets size
- Gesture support
- Mobile share options
- Responsive layout

## Success Indicators
- ✅ All actions provide clear feedback
- ✅ Keyboard shortcuts work correctly
- ✅ Error handling prevents crashes
- ✅ Loading states prevent double-clicks
- ✅ Confirmations for destructive actions
- ✅ Mobile-optimized interactions
- ✅ Accessible to all users
- ✅ Consistent across all tools
- ✅ Performance with large content
- ✅ Cross-browser compatibility

## Common Issues & Solutions

### Issue: Clipboard API not available
**Solution**: Fallback to document.execCommand

### Issue: Download fails on mobile
**Solution**: Use blob URLs with proper cleanup

### Issue: Share API not supported
**Solution**: Provide custom share menu

### Issue: Keyboard shortcuts conflict
**Solution**: Check for input focus before triggering

## Next Steps
Once this story is complete, proceed to Story 2.5: Character/Word Counter Components

## Notes for AI Implementation
- Test on various browsers and devices
- Ensure all actions are reversible where possible
- Add analytics tracking for action usage
- Consider adding action history
- Monitor performance with frequent actions
- Test with different content encodings