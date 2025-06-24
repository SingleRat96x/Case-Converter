'use client';

import { ReactNode } from 'react';
import { Download, Copy, RefreshCw, RotateCcw, Play, Pause, Settings2, FileDown, Clipboard, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Universal Tool Button Component
interface ToolButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function ToolButton({
  children,
  onClick,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
}: ToolButtonProps) {
  const variantClasses = {
    primary: 'tool-button-primary',
    secondary: 'tool-button-secondary',
    success: 'tool-button-success',
    warning: 'tool-button-warning',
    danger: 'tool-button-danger',
    outline: 'tool-button-outline',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm h-9',
    md: 'px-6 py-3 text-sm h-11',
    lg: 'px-8 py-4 text-base h-12',
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variantClasses[variant]} ${sizeClasses[size]} 
        font-semibold transition-all duration-300 inline-flex items-center gap-2.5
        hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:shadow-none disabled:hover:scale-100 rounded-xl
        ${className}
      `}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current opacity-70" />
      ) : (
        icon && <span className="transition-transform duration-300 group-hover:scale-110">{icon}</span>
      )}
      {children}
    </Button>
  );
}

// Individual Action Buttons
interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function DownloadButton({ 
  onClick, 
  disabled = false, 
  loading = false, 
  className = '', 
  variant = 'secondary',
  size = 'md'
}: ActionButtonProps) {
  return (
    <ToolButton
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      variant={variant}
      size={size}
      icon={<Download className="h-4 w-4" />}
      className={className}
    >
      Download
    </ToolButton>
  );
}

export function CopyButton({ 
  onClick, 
  disabled = false, 
  loading = false, 
  className = '', 
  variant = 'success',
  size = 'md'
}: ActionButtonProps) {
  return (
    <ToolButton
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      variant={variant}
      size={size}
      icon={<Copy className="h-4 w-4" />}
      className={className}
    >
      Copy
    </ToolButton>
  );
}

export function ClearButton({ 
  onClick, 
  disabled = false, 
  loading = false, 
  className = '', 
  variant = 'outline',
  size = 'md'
}: ActionButtonProps) {
  return (
    <ToolButton
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      variant={variant}
      size={size}
      icon={<RefreshCw className="h-4 w-4" />}
      className={className}
    >
      Clear
    </ToolButton>
  );
}

export function SwapButton({ 
  onClick, 
  disabled = false, 
  loading = false, 
  className = '', 
  variant = 'outline',
  size = 'md'
}: ActionButtonProps) {
  return (
    <ToolButton
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      variant={variant}
      size={size}
      icon={<RotateCcw className="h-4 w-4" />}
      className={className}
    >
      Swap
    </ToolButton>
  );
}

// Action Button Group Component
interface ActionButtonGroupProps {
  onDownload?: () => void;
  onCopy?: () => void;
  onClear?: () => void;
  onSwap?: () => void;
  downloadLabel?: string;
  copyLabel?: string;
  clearLabel?: string;
  swapLabel?: string;
  downloadDisabled?: boolean;
  copyDisabled?: boolean;
  clearDisabled?: boolean;
  swapDisabled?: boolean;
  downloadLoading?: boolean;
  copyLoading?: boolean;
  clearLoading?: boolean;
  swapLoading?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDownload?: boolean;
  showCopy?: boolean;
  showClear?: boolean;
  showSwap?: boolean;
}

export function ActionButtonGroup({
  onDownload,
  onCopy,
  onClear,
  onSwap,
  downloadLabel = 'Download',
  copyLabel = 'Copy to Clipboard',
  clearLabel = 'Clear',
  swapLabel = 'Swap',
  downloadDisabled = false,
  copyDisabled = false,
  clearDisabled = false,
  swapDisabled = false,
  downloadLoading = false,
  copyLoading = false,
  clearLoading = false,
  swapLoading = false,
  layout = 'horizontal',
  size = 'md',
  className = '',
  showDownload = true,
  showCopy = true,
  showClear = true,
  showSwap = false,
}: ActionButtonGroupProps) {
  const layoutClasses = {
    horizontal: 'flex flex-wrap gap-3 justify-center',
    vertical: 'flex flex-col gap-3',
    grid: 'grid grid-cols-2 md:grid-cols-4 gap-3',
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {showDownload && onDownload && (
        <ToolButton
          onClick={onDownload}
          disabled={downloadDisabled}
          loading={downloadLoading}
          variant="secondary"
          size={size}
          icon={<Download className="h-4 w-4" />}
        >
          {downloadLabel}
        </ToolButton>
      )}
      
      {showCopy && onCopy && (
        <ToolButton
          onClick={onCopy}
          disabled={copyDisabled}
          loading={copyLoading}
          variant="success"
          size={size}
          icon={<Copy className="h-4 w-4" />}
        >
          {copyLabel}
        </ToolButton>
      )}
      
      {showSwap && onSwap && (
        <ToolButton
          onClick={onSwap}
          disabled={swapDisabled}
          loading={swapLoading}
          variant="outline"
          size={size}
          icon={<RotateCcw className="h-4 w-4" />}
        >
          {swapLabel}
        </ToolButton>
      )}
      
      {showClear && onClear && (
        <ToolButton
          onClick={onClear}
          disabled={clearDisabled}
          loading={clearLoading}
          variant="outline"
          size={size}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          {clearLabel}
        </ToolButton>
      )}
    </div>
  );
}

// Specialized Action Groups for Different Tool Types
export function TextProcessorActions({ 
  onDownload, 
  onCopy, 
  onClear,
  hasContent = false,
  className = ''
}: {
  onDownload: () => void;
  onCopy: () => void;
  onClear: () => void;
  hasContent?: boolean;
  className?: string;
}) {
  return (
    <ActionButtonGroup
      onDownload={onDownload}
      onCopy={onCopy}
      onClear={onClear}
      downloadDisabled={!hasContent}
      copyDisabled={!hasContent}
      className={className}
    />
  );
}

export function ConverterActions({ 
  onDownload, 
  onCopy, 
  onClear, 
  onSwap,
  hasContent = false,
  className = ''
}: {
  onDownload: () => void;
  onCopy: () => void;
  onClear: () => void;
  onSwap: () => void;
  hasContent?: boolean;
  className?: string;
}) {
  return (
    <ActionButtonGroup
      onDownload={onDownload}
      onCopy={onCopy}
      onClear={onClear}
      onSwap={onSwap}
      downloadDisabled={!hasContent}
      copyDisabled={!hasContent}
      showSwap={true}
      className={className}
    />
  );
}

export function GeneratorActions({ 
  onDownload, 
  onCopy, 
  onClear,
  onGenerate,
  hasContent = false,
  generating = false,
  className = ''
}: {
  onDownload: () => void;
  onCopy: () => void;
  onClear: () => void;
  onGenerate: () => void;
  hasContent?: boolean;
  generating?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-center">
        <ToolButton
          onClick={onGenerate}
          loading={generating}
          variant="primary"
          size="lg"
          icon={<Settings2 className="h-4 w-4" />}
        >
          {generating ? 'Generating...' : 'Generate'}
        </ToolButton>
      </div>
      
      {hasContent && (
        <ActionButtonGroup
          onDownload={onDownload}
          onCopy={onCopy}
          onClear={onClear}
          size="md"
        />
      )}
    </div>
  );
}

export function ImageProcessorActions({ 
  onDownload, 
  onClear,
  onProcess,
  hasImage = false,
  hasResult = false,
  processing = false,
  className = ''
}: {
  onDownload: () => void;
  onClear: () => void;
  onProcess: () => void;
  hasImage?: boolean;
  hasResult?: boolean;
  processing?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {hasImage && (
        <div className="flex justify-center">
          <ToolButton
            onClick={onProcess}
            disabled={processing}
            loading={processing}
            variant="primary"
            size="lg"
            icon={<Settings2 className="h-4 w-4" />}
          >
            {processing ? 'Processing...' : 'Process Image'}
          </ToolButton>
        </div>
      )}
      
      {hasResult && (
        <ActionButtonGroup
          onDownload={onDownload}
          onClear={onClear}
          showCopy={false}
          downloadLabel="Download Image"
          className="justify-center"
        />
      )}
    </div>
  );
}
