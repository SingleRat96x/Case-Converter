'use client';

import { useState, useRef, ReactNode } from 'react';
import { Upload, Image, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Universal Text Input Component
interface TextInputProps {
  title: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  minHeight?: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily?: 'sans' | 'mono';
  variant?: 'default' | 'gradient' | 'glass';
}

export function TextInput({
  title,
  value,
  onChange,
  placeholder = 'Type or paste your text here...',
  readOnly = false,
  className = '',
  minHeight = 'md',
  fontFamily = 'sans',
  variant = 'default',
}: TextInputProps) {
  const heightClasses = {
    sm: 'min-h-[200px]',
    md: 'min-h-[300px]',
    lg: 'min-h-[400px]',
    xl: 'min-h-[500px]',
  };

  const fontClasses = {
    sans: '',
    mono: 'font-mono',
  };

  const variantClasses = {
    default: 'tool-input-default',
    gradient: 'tool-input-gradient',
    glass: 'tool-input-glass',
  };

  return (
    <Card className={`tool-card-vibrant ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-foreground gradient-text-primary">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <textarea
          className={`
            tool-input-enhanced w-full p-5 text-foreground 
            placeholder:text-muted-foreground resize-none
            ${heightClasses[minHeight]} ${fontClasses[fontFamily]}
            ${readOnly ? 'bg-muted/50 cursor-default opacity-90' : 'bg-background/80'}
          `}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
        />
      </CardContent>
    </Card>
  );
}

// Universal File Upload Component
interface FileUploadProps {
  title: string;
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  preview?: string | null;
  previewAlt?: string;
  className?: string;
  variant?: 'default' | 'gradient' | 'professional';
  icon?: ReactNode;
}

export function FileUpload({
  title,
  onFileSelect,
  acceptedTypes = 'image/*',
  maxSize = 10,
  preview = null,
  previewAlt = 'Preview',
  className = '',
  variant = 'default',
  icon,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const variantClasses = {
    default: 'tool-upload-default',
    gradient: 'tool-upload-gradient',
    professional: 'tool-upload-professional',
  };

  return (
    <Card className={`tool-card-vibrant ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground gradient-text">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {!preview ? (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
              cursor-pointer hover:shadow-xl hover:scale-[1.02]
              ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border'}
              ${variantClasses[variant]}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                {icon || <Image className="h-12 w-12 text-muted-foreground" />}
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supported formats: {acceptedTypes.replace('*', 'All')} • Max
                  size: {maxSize}MB
                </p>
              </div>
              <Button
                type="button"
                className="tool-button-primary"
                onClick={e => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes}
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors">
              <img
                src={preview}
                alt={previewAlt}
                className="max-w-full h-auto rounded max-h-64 object-contain mx-auto"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full tool-button-secondary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Change File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedTypes}
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Universal Settings Panel Component
interface SettingsPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
  collapsible?: boolean;
}

export function SettingsPanel({
  title,
  children,
  className = '',
  variant = 'default',
  collapsible = false,
}: SettingsPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const variantClasses = {
    default: 'tool-settings-default',
    glass: 'tool-settings-glass',
    gradient: 'tool-settings-gradient',
  };

  return (
    <Card
      className={`tool-card-vibrant ${variantClasses[variant]} ${className}`}
    >
      <CardHeader
        className={`pb-4 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <CardTitle className="text-lg font-semibold text-foreground gradient-text flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {title}
          {collapsible && (
            <span className="ml-auto text-muted-foreground">
              {isCollapsed ? '+' : '−'}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      {(!collapsible || !isCollapsed) && (
        <CardContent className="pt-0 space-y-4">{children}</CardContent>
      )}
    </Card>
  );
}

// Universal Mode Toggle Component
interface ModeToggleProps {
  leftLabel: string;
  rightLabel: string;
  value: boolean; // true = right, false = left
  onChange: (value: boolean) => void;
  className?: string;
  variant?: 'default' | 'gradient' | 'professional';
}

export function ModeToggle({
  leftLabel,
  rightLabel,
  value,
  onChange,
  className = '',
  variant = 'default',
}: ModeToggleProps) {
  const variantClasses = {
    default: 'tool-toggle-default',
    gradient: 'tool-toggle-gradient',
    professional: 'tool-toggle-professional',
  };

  return (
    <div className={`tool-mode-toggle ${variantClasses[variant]} ${className}`}>
      <div className="flex items-center justify-center space-x-4 p-4 rounded-lg bg-muted/30">
        <button
          onClick={() => onChange(false)}
          className={`
            px-4 py-2 rounded-md font-medium transition-all duration-300
            ${
              !value
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }
          `}
        >
          {leftLabel}
        </button>

        <div className="relative">
          {value ? (
            <ToggleRight
              className="h-8 w-8 text-primary cursor-pointer hover:scale-110 transition-transform"
              onClick={() => onChange(!value)}
            />
          ) : (
            <ToggleLeft
              className="h-8 w-8 text-muted-foreground cursor-pointer hover:scale-110 transition-transform"
              onClick={() => onChange(!value)}
            />
          )}
        </div>

        <button
          onClick={() => onChange(true)}
          className={`
            px-4 py-2 rounded-md font-medium transition-all duration-300
            ${
              value
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }
          `}
        >
          {rightLabel}
        </button>
      </div>
    </div>
  );
}

// Universal Input Group (for multiple related inputs)
interface InputGroupProps {
  title: string;
  children: ReactNode;
  className?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
}

export function InputGroup({
  title,
  children,
  className = '',
  layout = 'vertical',
}: InputGroupProps) {
  const layoutClasses = {
    vertical: 'space-y-4',
    horizontal: 'flex flex-wrap gap-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  };

  return (
    <div className={`tool-input-group ${className}`}>
      <h3 className="text-sm font-medium text-foreground mb-3 gradient-text">
        {title}
      </h3>
      <div className={layoutClasses[layout]}>{children}</div>
    </div>
  );
}
