'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { KeyboardShortcutsDialog } from './dialogs/KeyboardShortcutsDialog';
import { AboutDialog } from './dialogs/AboutDialog';
import { 
  File, 
  Edit3, 
  Plus, 
  Eye, 
  HelpCircle,
  FileText,
  FolderOpen,
  Save,
  Printer,
  X,
  Undo,
  Redo,
  Scissors,
  Copy,
  Clipboard,
  MousePointer,
  Calendar,
  Maximize,
  Monitor,
  WrapText,
  Info,
  Keyboard,
  Search
} from 'lucide-react';
import { useToolTranslations } from '@/lib/i18n/hooks';

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action?: () => void;
  shortcut?: string;
  separator?: boolean;
  disabled?: boolean;
}

export interface MenuCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

interface HeaderMenuProps {
  onMenuAction: (actionId: string, data?: unknown) => void;
  className?: string;
}

export function HeaderMenu({ onMenuAction, className = '' }: HeaderMenuProps) {
  const { tool: t } = useToolTranslations('tools/miscellaneous');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      // Check if click is outside the menu container and not on a portal dropdown
      const isClickOutsideMenu = menuRef.current && !menuRef.current.contains(target);
      const isClickOnPortalDropdown = target && (target as Element).closest('[data-dropdown-portal]');
      
      if (isClickOutsideMenu && !isClickOnPortalDropdown) {
        setActiveMenu(null);
        setHoveredMenu(null);
        setDropdownPosition(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveMenu(null);
        setHoveredMenu(null);
        setDropdownPosition(null);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const menuCategories: MenuCategory[] = [
    {
      id: 'file',
      label: t('onlineNotepad.menu.file'),
      icon: <File className="h-4 w-4" />,
      items: [
        {
          id: 'file-new',
          label: t('onlineNotepad.menu.new'),
          icon: <FileText className="h-4 w-4" />,
          shortcut: 'Ctrl+N',
          action: () => onMenuAction('file-new')
        },
        {
          id: 'file-open',
          label: t('onlineNotepad.menu.open'),
          icon: <FolderOpen className="h-4 w-4" />,
          shortcut: 'Ctrl+O',
          action: () => onMenuAction('file-open')
        },
        { id: 'sep1', label: '', separator: true },
        {
          id: 'file-save-txt',
          label: t('onlineNotepad.menu.saveTxt'),
          icon: <Save className="h-4 w-4" />,
          shortcut: 'Ctrl+S',
          action: () => onMenuAction('file-save-txt')
        },
        {
          id: 'file-save-md',
          label: t('onlineNotepad.menu.saveMd'),
          icon: <Save className="h-4 w-4" />,
          shortcut: 'Ctrl+Shift+S',
          action: () => onMenuAction('file-save-md')
        },
        { id: 'sep2', label: '', separator: true },
        {
          id: 'file-print',
          label: t('onlineNotepad.menu.print'),
          icon: <Printer className="h-4 w-4" />,
          shortcut: 'Ctrl+P',
          action: () => onMenuAction('file-print')
        },
        { id: 'sep3', label: '', separator: true },
        {
          id: 'file-exit',
          label: t('onlineNotepad.menu.exit'),
          icon: <X className="h-4 w-4" />,
          shortcut: 'Alt+F4',
          action: () => onMenuAction('file-exit')
        }
      ]
    },
    {
      id: 'edit',
      label: t('onlineNotepad.menu.edit'),
      icon: <Edit3 className="h-4 w-4" />,
      items: [
        {
          id: 'edit-undo',
          label: t('onlineNotepad.menu.undo'),
          icon: <Undo className="h-4 w-4" />,
          shortcut: 'Ctrl+Z',
          action: () => onMenuAction('edit-undo')
        },
        {
          id: 'edit-redo',
          label: t('onlineNotepad.menu.redo'),
          icon: <Redo className="h-4 w-4" />,
          shortcut: 'Ctrl+Y',
          action: () => onMenuAction('edit-redo')
        },
        { id: 'sep4', label: '', separator: true },
        {
          id: 'edit-cut',
          label: t('onlineNotepad.menu.cut'),
          icon: <Scissors className="h-4 w-4" />,
          shortcut: 'Ctrl+X',
          action: () => onMenuAction('edit-cut')
        },
        {
          id: 'edit-copy',
          label: t('onlineNotepad.menu.copy'),
          icon: <Copy className="h-4 w-4" />,
          shortcut: 'Ctrl+C',
          action: () => onMenuAction('edit-copy')
        },
        {
          id: 'edit-paste',
          label: t('onlineNotepad.menu.paste'),
          icon: <Clipboard className="h-4 w-4" />,
          shortcut: 'Ctrl+V',
          action: () => onMenuAction('edit-paste')
        },
        { id: 'sep5', label: '', separator: true },
        {
          id: 'edit-replace',
          label: t('onlineNotepad.menu.findReplace'),
          icon: <Search className="h-4 w-4" />,
          shortcut: 'Ctrl+F',
          action: () => onMenuAction('edit-replace')
        },
        { id: 'sep6', label: '', separator: true },
        {
          id: 'edit-select-all',
          label: t('onlineNotepad.menu.selectAll'),
          icon: <MousePointer className="h-4 w-4" />,
          shortcut: 'Ctrl+A',
          action: () => onMenuAction('edit-select-all')
        }
      ]
    },
    {
      id: 'insert',
      label: t('onlineNotepad.menu.insert'),
      icon: <Plus className="h-4 w-4" />,
      items: [
        {
          id: 'insert-datetime',
          label: t('onlineNotepad.menu.dateTime'),
          icon: <Calendar className="h-4 w-4" />,
          shortcut: 'F5',
          action: () => onMenuAction('insert-datetime')
        }
      ]
    },
    {
      id: 'view',
      label: t('onlineNotepad.menu.view'),
      icon: <Eye className="h-4 w-4" />,
      items: [
        {
          id: 'view-fullscreen',
          label: t('onlineNotepad.menu.fullscreen'),
          icon: <Maximize className="h-4 w-4" />,
          shortcut: 'F11',
          action: () => onMenuAction('view-fullscreen')
        },
        {
          id: 'view-preview',
          label: t('onlineNotepad.menu.preview'),
          icon: <Monitor className="h-4 w-4" />,
          shortcut: 'Ctrl+Shift+P',
          action: () => onMenuAction('view-preview')
        },
        { id: 'sep7', label: '', separator: true },
        {
          id: 'view-word-wrap',
          label: t('onlineNotepad.menu.wordWrap'),
          icon: <WrapText className="h-4 w-4" />,
          action: () => onMenuAction('view-word-wrap')
        }
      ]
    },
    {
      id: 'help',
      label: t('onlineNotepad.menu.help'),
      icon: <HelpCircle className="h-4 w-4" />,
      items: [
        {
          id: 'help-shortcuts',
          label: t('onlineNotepad.menu.keyboardShortcuts'),
          icon: <Keyboard className="h-4 w-4" />,
          action: () => setShowKeyboardShortcuts(true)
        },
        { id: 'sep8', label: '', separator: true },
        {
          id: 'help-about',
          label: t('onlineNotepad.menu.about'),
          icon: <Info className="h-4 w-4" />,
          action: () => setShowAbout(true)
        }
      ]
    }
  ];

  const handleMenuClick = (categoryId: string) => {
    if (activeMenu === categoryId) {
      setActiveMenu(null);
      setDropdownPosition(null);
    } else {
      setActiveMenu(categoryId);
      const buttonElement = buttonRefs.current[categoryId];
      if (buttonElement) {
        const rect = buttonElement.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom,
          left: rect.left,
          width: Math.max(rect.width, 200)
        });
      }
    }
    setHoveredMenu(null);
  };

  const handleMenuHover = (categoryId: string) => {
    if (activeMenu) {
      setActiveMenu(categoryId);
      const buttonElement = buttonRefs.current[categoryId];
      if (buttonElement) {
        const rect = buttonElement.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom,
          left: rect.left,
          width: Math.max(rect.width, 200)
        });
      }
    }
    setHoveredMenu(categoryId);
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.action && !item.disabled) {
      item.action();
    }
    setActiveMenu(null);
    setHoveredMenu(null);
    setDropdownPosition(null);
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.separator) {
      return (
        <div key={item.id} className="h-px bg-border my-1" />
      );
    }

    return (
      <div
        key={item.id}
        onClick={() => handleMenuItemClick(item)}
        className={`
          flex items-center justify-between px-3 py-2 text-sm cursor-pointer
          transition-colors duration-150
          ${item.disabled 
            ? 'text-muted-foreground cursor-not-allowed' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
          }
        `}
      >
        <div className="flex items-center gap-3">
          {item.icon && (
            <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
              {item.icon}
            </span>
          )}
          <span>{item.label}</span>
        </div>
        {item.shortcut && (
          <span className="text-xs text-muted-foreground ml-4">
            {item.shortcut}
          </span>
        )}
      </div>
    );
  };

  return (
    <div ref={menuRef} className={`relative z-[9999] ${className}`}>
      <div className="bg-background border-b border-border rounded-t-lg">
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          <div className="flex items-center min-w-max">
        {menuCategories.map((category) => (
          <div key={category.id} className="relative">
            <button
              ref={(el) => {
                buttonRefs.current[category.id] = el;
              }}
              onClick={() => handleMenuClick(category.id)}
              onMouseEnter={() => handleMenuHover(category.id)}
              className={`
                flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium whitespace-nowrap
                transition-colors duration-150
                ${activeMenu === category.id || hoveredMenu === category.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-accent/50'
                }
              `}
            >
              {category.icon}
              {category.label}
            </button>
          </div>
        ))}
          </div>
        </div>
      </div>
      
      {/* Portal for dropdown menu */}
      {activeMenu && dropdownPosition && typeof window !== 'undefined' && createPortal(
        <div 
          data-dropdown-portal
          className="fixed z-[99999] min-w-[200px] bg-popover border border-border rounded-md shadow-lg animate-in fade-in-0 zoom-in-95"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width
          }}
        >
          <div className="py-1">
            {menuCategories.find(cat => cat.id === activeMenu)?.items.map(renderMenuItem)}
          </div>
        </div>,
        document.body
      )}
      
      {/* Dialog Components */}
      <KeyboardShortcutsDialog 
        open={showKeyboardShortcuts} 
        onOpenChange={setShowKeyboardShortcuts} 
      />
      
      <AboutDialog 
        open={showAbout} 
        onOpenChange={setShowAbout} 
      />
    </div>
  );
}