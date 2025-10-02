'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Maximize,
  ChevronDown,
  FileText,
  Search,
  Save,
  Printer,
  Scissors,
  Copy,
  Clipboard,
  Undo,
  Redo
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FontOption {
  value: string;
  label: string;
}

interface ToolbarAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  action: () => void;
}

interface ToolbarProps {
  fontFamily: string;
  fontSize: string;
  textFormatting: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
  };
  textAlignment: 'left' | 'center' | 'right' | 'justify';
  isFullscreen: boolean;
  onFontFamilyChange: (font: string) => void;
  onFontSizeChange: (size: string) => void;
  onFormatToggle: (format: 'bold' | 'italic' | 'underline') => void;
  onAlignmentChange: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
  onFullscreenToggle: () => void;
  onMenuAction?: (actionId: string) => void;
  className?: string;
}

export function Toolbar({
  fontFamily,
  fontSize,
  textFormatting,
  textAlignment,
  isFullscreen,
  onFontFamilyChange,
  onFontSizeChange,
  onFormatToggle,
  onAlignmentChange,
  onFullscreenToggle,
  onMenuAction,
  className = ''
}: ToolbarProps) {
  const [fontFamilyDropdownOpen, setFontFamilyDropdownOpen] = useState(false);
  const [fontSizeDropdownOpen, setFontSizeDropdownOpen] = useState(false);
  const [fontFamilyPosition, setFontFamilyPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [fontSizePosition, setFontSizePosition] = useState<{ top: number; left: number; width: number } | null>(null);

  const fontFamilies: FontOption[] = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Monaco', label: 'Monaco' },
    { value: 'system-ui', label: 'System Font' }
  ];

  const fontSizes: FontOption[] = [
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: '10', label: '10' },
    { value: '11', label: '11' },
    { value: '12', label: '12' },
    { value: '14', label: '14' },
    { value: '16', label: '16' },
    { value: '18', label: '18' },
    { value: '20', label: '20' },
    { value: '24', label: '24' },
    { value: '28', label: '28' },
    { value: '32', label: '32' },
    { value: '36', label: '36' },
    { value: '48', label: '48' },
    { value: '72', label: '72' }
  ];

  const formatActions: ToolbarAction[] = [
    {
      id: 'bold',
      icon: <Bold className="h-4 w-4" />,
      label: 'Bold',
      active: textFormatting.bold,
      action: () => onFormatToggle('bold')
    },
    {
      id: 'italic',
      icon: <Italic className="h-4 w-4" />,
      label: 'Italic',
      active: textFormatting.italic,
      action: () => onFormatToggle('italic')
    },
    {
      id: 'underline',
      icon: <Underline className="h-4 w-4" />,
      label: 'Underline',
      active: textFormatting.underline,
      action: () => onFormatToggle('underline')
    }
  ];

  const alignmentActions: ToolbarAction[] = [
    {
      id: 'left',
      icon: <AlignLeft className="h-4 w-4" />,
      label: 'Align Left',
      active: textAlignment === 'left',
      action: () => onAlignmentChange('left')
    },
    {
      id: 'center',
      icon: <AlignCenter className="h-4 w-4" />,
      label: 'Align Center',
      active: textAlignment === 'center',
      action: () => onAlignmentChange('center')
    },
    {
      id: 'right',
      icon: <AlignRight className="h-4 w-4" />,
      label: 'Align Right',
      active: textAlignment === 'right',
      action: () => onAlignmentChange('right')
    },
    {
      id: 'justify',
      icon: <AlignJustify className="h-4 w-4" />,
      label: 'Justify',
      active: textAlignment === 'justify',
      action: () => onAlignmentChange('justify')
    }
  ];

  // Quick action buttons
  const quickActions: ToolbarAction[] = [
    {
      id: 'new',
      icon: <FileText className="h-4 w-4" />,
      label: 'New Document',
      action: () => onMenuAction?.('file-new')
    },
    {
      id: 'find',
      icon: <Search className="h-4 w-4" />,
      label: 'Find',
      action: () => onMenuAction?.('edit-find')
    },
    {
      id: 'save',
      icon: <Save className="h-4 w-4" />,
      label: 'Save',
      action: () => onMenuAction?.('file-save-txt')
    },
    {
      id: 'print',
      icon: <Printer className="h-4 w-4" />,
      label: 'Print',
      action: () => onMenuAction?.('file-print')
    }
  ];

  // Edit actions
  const editActions: ToolbarAction[] = [
    {
      id: 'cut',
      icon: <Scissors className="h-4 w-4" />,
      label: 'Cut',
      action: () => onMenuAction?.('edit-cut')
    },
    {
      id: 'copy',
      icon: <Copy className="h-4 w-4" />,
      label: 'Copy',
      action: () => onMenuAction?.('edit-copy')
    },
    {
      id: 'paste',
      icon: <Clipboard className="h-4 w-4" />,
      label: 'Paste',
      action: () => onMenuAction?.('edit-paste')
    }
  ];

  // History actions
  const historyActions: ToolbarAction[] = [
    {
      id: 'undo',
      icon: <Undo className="h-4 w-4" />,
      label: 'Undo',
      action: () => onMenuAction?.('edit-undo')
    },
    {
      id: 'redo',
      icon: <Redo className="h-4 w-4" />,
      label: 'Redo',
      action: () => onMenuAction?.('edit-redo')
    }
  ];

  const Dropdown = ({ 
    onToggle, 
    value, 
    options, 
    placeholder,
    width = 'w-32',
    onButtonClick
  }: {
    isOpen: boolean;
    onToggle: () => void;
    value: string;
    options: FontOption[];
    onChange: (value: string) => void;
    placeholder: string;
    width?: string;
    onButtonClick?: (element: HTMLButtonElement) => void;
  }) => (
    <div className={`relative ${width}`}>
      <button
        onClick={(e) => {
          onToggle();
          onButtonClick?.(e.currentTarget);
        }}
        className="flex items-center justify-between w-full px-3 py-1.5 text-sm bg-background border border-border rounded hover:bg-accent transition-colors"
      >
        <span className="truncate">
          {options.find(opt => opt.value === value)?.label || placeholder}
        </span>
        <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
      </button>
    </div>
  );

  const ToolGroup = ({ children, className: groupClassName = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex items-center gap-1 ${groupClassName}`}>
      {children}
    </div>
  );

  const Separator = () => (
    <div className="w-px h-6 bg-border mx-2" />
  );

  const handleFontFamilyToggle = () => {
    setFontFamilyDropdownOpen(!fontFamilyDropdownOpen);
    if (fontFamilyDropdownOpen) {
      setFontFamilyPosition(null);
    }
  };

  const handleFontSizeToggle = () => {
    setFontSizeDropdownOpen(!fontSizeDropdownOpen);
    if (fontSizeDropdownOpen) {
      setFontSizePosition(null);
    }
  };

  const handleFontFamilyButtonClick = (buttonElement: HTMLButtonElement) => {
    if (!fontFamilyDropdownOpen) {
      const rect = buttonElement.getBoundingClientRect();
      setFontFamilyPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  const handleFontSizeButtonClick = (buttonElement: HTMLButtonElement) => {
    if (!fontSizeDropdownOpen) {
      const rect = buttonElement.getBoundingClientRect();
      setFontSizePosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  return (
    <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-background border-b border-border overflow-x-auto ${className}`}>
      <div className="flex items-center gap-1 sm:gap-2 min-w-max">
      
      {/* Quick Actions Group */}
      <ToolGroup>
        {quickActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={action.action}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            title={action.label}
          >
            {action.icon}
          </Button>
        ))}
      </ToolGroup>

      <Separator />

      {/* Edit Actions Group */}
      <ToolGroup>
        {editActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={action.action}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            title={action.label}
          >
            {action.icon}
          </Button>
        ))}
      </ToolGroup>

      <Separator />

      {/* History Actions Group */}
      <ToolGroup>
        {historyActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={action.action}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            title={action.label}
          >
            {action.icon}
          </Button>
        ))}
      </ToolGroup>

      <Separator />

      {/* Font Controls Group */}
      <ToolGroup>
        <Dropdown
          isOpen={fontFamilyDropdownOpen}
          onToggle={handleFontFamilyToggle}
          value={fontFamily}
          options={fontFamilies}
          onChange={onFontFamilyChange}
          placeholder="Font Family"
          width="w-24 sm:w-36"
          onButtonClick={handleFontFamilyButtonClick}
        />
        
        <Dropdown
          isOpen={fontSizeDropdownOpen}
          onToggle={handleFontSizeToggle}
          value={fontSize}
          options={fontSizes}
          onChange={onFontSizeChange}
          placeholder="Size"
          width="w-12 sm:w-16"
          onButtonClick={handleFontSizeButtonClick}
        />
      </ToolGroup>

      <Separator />

      {/* Text Formatting Group */}
      <ToolGroup>
        {formatActions.map((action) => (
          <Button
            key={action.id}
            variant={action.active ? "default" : "outline"}
            size="sm"
            onClick={action.action}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            title={action.label}
          >
            {action.icon}
          </Button>
        ))}
      </ToolGroup>

      <Separator />

      {/* Text Alignment Group */}
      <ToolGroup>
        {alignmentActions.map((action) => (
          <Button
            key={action.id}
            variant={action.active ? "default" : "outline"}
            size="sm"
            onClick={action.action}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            title={action.label}
          >
            {action.icon}
          </Button>
        ))}
      </ToolGroup>

      <Separator />

      {/* View Controls Group */}
      <ToolGroup>
        <Button
          variant={isFullscreen ? "default" : "outline"}
          size="sm"
          onClick={onFullscreenToggle}
          className="h-8 w-8 p-0"
          title="Toggle Fullscreen"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </ToolGroup>

      {/* Close dropdowns when clicking outside */}
      {(fontFamilyDropdownOpen || fontSizeDropdownOpen) && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => {
            setFontFamilyDropdownOpen(false);
            setFontSizeDropdownOpen(false);
            setFontFamilyPosition(null);
            setFontSizePosition(null);
          }}
        />
      )}
      </div>
      
      {/* Portal for font family dropdown */}
      {fontFamilyDropdownOpen && fontFamilyPosition && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] max-h-60 overflow-y-auto bg-popover border border-border rounded-md shadow-lg animate-in fade-in-0 zoom-in-95"
          style={{
            top: fontFamilyPosition.top,
            left: fontFamilyPosition.left,
            width: fontFamilyPosition.width
          }}
        >
          {fontFamilies.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onFontFamilyChange(option.value);
                setFontFamilyDropdownOpen(false);
                setFontFamilyPosition(null);
              }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors"
              style={{ fontFamily: option.value === 'system-ui' ? 'system-ui' : option.value }}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
      
      {/* Portal for font size dropdown */}
      {fontSizeDropdownOpen && fontSizePosition && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] max-h-60 overflow-y-auto bg-popover border border-border rounded-md shadow-lg animate-in fade-in-0 zoom-in-95"
          style={{
            top: fontSizePosition.top,
            left: fontSizePosition.left,
            width: fontSizePosition.width
          }}
        >
          {fontSizes.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onFontSizeChange(option.value);
                setFontSizeDropdownOpen(false);
                setFontSizePosition(null);
              }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}