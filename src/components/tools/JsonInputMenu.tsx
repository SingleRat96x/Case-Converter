'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useToolTranslations } from '@/lib/i18n/hooks';

interface JsonInputMenuProps {
  onMenuAction: (actionId: string) => void;
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  items: { id: string; label: string; shortcut?: string; separator?: boolean }[];
}

export function JsonInputMenu({ onMenuAction, className = '' }: JsonInputMenuProps) {
  const { tool } = useToolTranslations('tools/code-data');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    {
      id: 'file',
      label: 'File',
      items: [
        { id: 'file-new', label: 'New', shortcut: 'Ctrl+N' },
        { id: 'file-open', label: 'Open File...', shortcut: 'Ctrl+O' },
        { id: 'file-save-json', label: 'Save as JSON', shortcut: 'Ctrl+S' },
        { id: 'file-save-ndjson', label: 'Save as NDJSON' },
        { id: 'file-separator-1', label: '', separator: true },
        { id: 'file-print', label: 'Print', shortcut: 'Ctrl+P' },
      ]
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { id: 'edit-undo', label: 'Undo', shortcut: 'Ctrl+Z' },
        { id: 'edit-redo', label: 'Redo', shortcut: 'Ctrl+Y' },
        { id: 'edit-separator-1', label: '', separator: true },
        { id: 'edit-cut', label: 'Cut', shortcut: 'Ctrl+X' },
        { id: 'edit-copy', label: 'Copy', shortcut: 'Ctrl+C' },
        { id: 'edit-paste', label: 'Paste', shortcut: 'Ctrl+V' },
        { id: 'edit-separator-2', label: '', separator: true },
        { id: 'edit-select-all', label: 'Select All', shortcut: 'Ctrl+A' },
        { id: 'edit-find', label: 'Find', shortcut: 'Ctrl+F' },
      ]
    },
    {
      id: 'insert',
      label: 'Insert',
      items: [
        { id: 'insert-sample-object', label: 'Sample Object' },
        { id: 'insert-sample-array', label: 'Sample Array' },
        { id: 'insert-empty-object', label: 'Empty Object {}' },
        { id: 'insert-empty-array', label: 'Empty Array []' },
      ]
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { id: 'view-word-wrap', label: 'Word Wrap' },
        { id: 'view-line-numbers', label: 'Line Numbers' },
        { id: 'view-fold-all', label: 'Fold All' },
        { id: 'view-unfold-all', label: 'Unfold All' },
      ]
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { id: 'help-keyboard-shortcuts', label: 'Keyboard Shortcuts', shortcut: 'Ctrl+?' },
        { id: 'help-json-spec', label: 'JSON Specification' },
        { id: 'help-about', label: 'About JSON Formatter' },
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
            className="px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
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
                      className="w-full px-3 py-1.5 text-sm text-left text-foreground hover:bg-accent flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-xs text-muted-foreground ml-4">{item.shortcut}</span>
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
