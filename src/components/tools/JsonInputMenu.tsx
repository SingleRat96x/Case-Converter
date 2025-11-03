'use client';

import React, { useState } from 'react';
import { 
  FileText, FolderOpen, Save, Printer, FileJson,
  Undo, Redo, Scissors, Copy, Clipboard, Search, TextSelect,
  Braces, Brackets,
  Eye, WrapText, ListOrdered, ChevronDown as FoldIcon, ChevronUp as UnfoldIcon,
  Keyboard, BookOpen, Info, File, Edit3, PlusSquare, HelpCircle
} from 'lucide-react';

interface JsonInputMenuProps {
  onMenuAction: (actionId: string) => void;
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  items: { id: string; label: string; shortcut?: string; separator?: boolean; icon?: React.ReactNode }[];
}

export function JsonInputMenu({ onMenuAction, className = '' }: JsonInputMenuProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    {
      id: 'file',
      label: 'File',
      icon: <File className="h-4 w-4" />,
      items: [
        { id: 'file-new', label: 'New', shortcut: 'Ctrl+N', icon: <FileText className="h-4 w-4" /> },
        { id: 'file-open', label: 'Open File...', shortcut: 'Ctrl+O', icon: <FolderOpen className="h-4 w-4" /> },
        { id: 'file-save-json', label: 'Save as JSON', shortcut: 'Ctrl+S', icon: <Save className="h-4 w-4" /> },
        { id: 'file-save-ndjson', label: 'Save as NDJSON', icon: <FileJson className="h-4 w-4" /> },
        { id: 'file-separator-1', label: '', separator: true },
        { id: 'file-print', label: 'Print', shortcut: 'Ctrl+P', icon: <Printer className="h-4 w-4" /> },
      ]
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit3 className="h-4 w-4" />,
      items: [
        { id: 'edit-undo', label: 'Undo', shortcut: 'Ctrl+Z', icon: <Undo className="h-4 w-4" /> },
        { id: 'edit-redo', label: 'Redo', shortcut: 'Ctrl+Y', icon: <Redo className="h-4 w-4" /> },
        { id: 'edit-separator-1', label: '', separator: true },
        { id: 'edit-cut', label: 'Cut', shortcut: 'Ctrl+X', icon: <Scissors className="h-4 w-4" /> },
        { id: 'edit-copy', label: 'Copy', shortcut: 'Ctrl+C', icon: <Copy className="h-4 w-4" /> },
        { id: 'edit-paste', label: 'Paste', shortcut: 'Ctrl+V', icon: <Clipboard className="h-4 w-4" /> },
        { id: 'edit-separator-2', label: '', separator: true },
        { id: 'edit-select-all', label: 'Select All', shortcut: 'Ctrl+A', icon: <TextSelect className="h-4 w-4" /> },
        { id: 'edit-find', label: 'Find', shortcut: 'Ctrl+F', icon: <Search className="h-4 w-4" /> },
      ]
    },
    {
      id: 'insert',
      label: 'Insert',
      icon: <PlusSquare className="h-4 w-4" />,
      items: [
        { id: 'insert-sample-object', label: 'Sample Object', icon: <Braces className="h-4 w-4" /> },
        { id: 'insert-sample-array', label: 'Sample Array', icon: <Brackets className="h-4 w-4" /> },
        { id: 'insert-empty-object', label: 'Empty Object {}', icon: <Braces className="h-4 w-4" /> },
        { id: 'insert-empty-array', label: 'Empty Array []', icon: <Brackets className="h-4 w-4" /> },
      ]
    },
    {
      id: 'view',
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      items: [
        { id: 'view-word-wrap', label: 'Word Wrap', icon: <WrapText className="h-4 w-4" /> },
        { id: 'view-line-numbers', label: 'Line Numbers', icon: <ListOrdered className="h-4 w-4" /> },
        { id: 'view-fold-all', label: 'Fold All', icon: <FoldIcon className="h-4 w-4" /> },
        { id: 'view-unfold-all', label: 'Unfold All', icon: <UnfoldIcon className="h-4 w-4" /> },
      ]
    },
    {
      id: 'help',
      label: 'Help',
      icon: <HelpCircle className="h-4 w-4" />,
      items: [
        { id: 'help-keyboard-shortcuts', label: 'Keyboard Shortcuts', shortcut: 'Ctrl+?', icon: <Keyboard className="h-4 w-4" /> },
        { id: 'help-json-spec', label: 'JSON Specification', icon: <BookOpen className="h-4 w-4" /> },
        { id: 'help-about', label: 'About JSON Formatter', icon: <Info className="h-4 w-4" /> },
      ]
    }
  ];

  const handleMenuClick = (menuId: string) => {
    setOpenMenu(openMenu === menuId ? null : menuId);
  };

  const handleItemClick = (itemId: string) => {
    setOpenMenu(null);
    onMenuAction(itemId);
  };

  return (
    <div className={`relative flex items-center bg-background border-b border-border ${className}`}>
      {menuItems.map((menu) => (
        <div key={menu.id} className="relative">
          <button
            onClick={() => handleMenuClick(menu.id)}
            className="px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
          >
            {menu.icon && <span className="text-muted-foreground">{menu.icon}</span>}
            {menu.label}
          </button>
          
          {openMenu === menu.id && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setOpenMenu(null)}
              />
              
              {/* Dropdown */}
              <div className="absolute left-0 top-full z-50 min-w-[200px] bg-popover border border-border rounded-md shadow-lg py-1">
                {menu.items.map((item) => {
                  if (item.separator) {
                    return (
                      <div key={item.id} className="my-1 border-t border-border" />
                    );
                  }
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className="w-full px-3 py-1.5 text-sm text-left text-foreground hover:bg-accent flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
                        <span>{item.label}</span>
                      </div>
                      {item.shortcut && (
                        <span className="text-xs text-muted-foreground">{item.shortcut}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
