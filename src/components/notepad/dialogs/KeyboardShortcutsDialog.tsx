'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';
import { useToolTranslations } from '@/lib/i18n/hooks';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const { tool: t } = useToolTranslations('tools/miscellaneous');
  
  const shortcuts = [
    { category: t('onlineNotepad.dialogs.keyboardShortcuts.categories.fileOperations'), items: [
      { key: 'Ctrl+N', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.newFile') },
      { key: 'Ctrl+O', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.openFile') },
      { key: 'Ctrl+S', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.saveTxt') },
      { key: 'Ctrl+Shift+S', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.saveMd') },
      { key: 'Ctrl+P', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.print') },
    ]},
    { category: t('onlineNotepad.dialogs.keyboardShortcuts.categories.editOperations'), items: [
      { key: 'Ctrl+Z', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.undo') },
      { key: 'Ctrl+Y', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.redo') },
      { key: 'Ctrl+X', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.cut') },
      { key: 'Ctrl+C', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.copy') },
      { key: 'Ctrl+V', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.paste') },
      { key: 'Ctrl+A', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.selectAll') },
    ]},
    { category: t('onlineNotepad.dialogs.keyboardShortcuts.categories.viewOperations'), items: [
      { key: 'F11', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.fullscreen') },
      { key: 'Ctrl+Shift+P', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.preview') },
      { key: 'F5', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.insertDateTime') },
    ]},
    { category: t('onlineNotepad.dialogs.keyboardShortcuts.categories.navigation'), items: [
      { key: 'Tab', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.tab') },
      { key: 'Esc', description: t('onlineNotepad.dialogs.keyboardShortcuts.shortcuts.escape') },
    ]},
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            {t('onlineNotepad.dialogs.keyboardShortcuts.title')}
          </DialogTitle>
          <DialogDescription>
            {t('onlineNotepad.dialogs.keyboardShortcuts.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="text-sm font-semibold text-foreground mb-3 border-b pb-1">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between py-1">
                    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t text-xs text-muted-foreground">
            <p>{t('onlineNotepad.dialogs.keyboardShortcuts.tip')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}