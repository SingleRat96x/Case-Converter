'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogPortal,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useToolTranslations } from '@/lib/i18n/hooks';

interface FindDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFind: (searchTerm: string, options: SearchOptions) => { found: boolean; currentMatch: number; totalMatches: number };
  onReplace?: (searchTerm: string, replaceTerm: string, options: SearchOptions) => void;
  onReplaceAll?: (searchTerm: string, replaceTerm: string, options: SearchOptions) => void;
  onFindNext?: (searchTerm: string, options: SearchOptions) => { found: boolean; currentMatch: number; totalMatches: number };
  onFindPrev?: (searchTerm: string, options: SearchOptions) => { found: boolean; currentMatch: number; totalMatches: number };
}

interface SearchOptions {
  matchCase: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

export function FindDialog({ 
  open, 
  onOpenChange, 
  onFind,
  onReplace,
  onReplaceAll,
  onFindNext,
  onFindPrev
}: FindDialogProps) {
  const { tool: t } = useToolTranslations('tools/miscellaneous');
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);

  // Reset when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setReplaceTerm('');
    }
  }, [open]);

  // Prevent body scroll when dialog is open to avoid layout shifts
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const searchOptions: SearchOptions = {
    matchCase,
    wholeWord,
    useRegex: false
  };

  const handleFind = () => {
    if (searchTerm.trim()) {
      onFind(searchTerm, searchOptions);
    }
  };

  const handleReplace = () => {
    if (searchTerm.trim() && onReplace) {
      onReplace(searchTerm, replaceTerm, searchOptions);
    }
  };

  const handleReplaceAll = () => {
    if (searchTerm.trim() && onReplaceAll) {
      onReplaceAll(searchTerm, replaceTerm, searchOptions);
    }
  };

  const handleNext = () => {
    if (searchTerm.trim() && onFindNext) {
      onFindNext(searchTerm, searchOptions);
    }
  };

  const handlePrev = () => {
    if (searchTerm.trim() && onFindPrev) {
      onFindPrev(searchTerm, searchOptions);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <div className="fixed inset-0 z-[9999] bg-black/50" />
        <div className="fixed left-1/2 top-1/2 z-[10000] w-[85vw] max-w-[320px] sm:max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-background p-4 sm:p-6 shadow-lg rounded-lg">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t('onlineNotepad.dialogs.findReplace.close')}</span>
          </button>
          
          <div className="mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">{t('onlineNotepad.dialogs.findReplace.title')}</h2>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {/* Find Input */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm text-foreground">{t('onlineNotepad.dialogs.findReplace.findLabel')}</label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('onlineNotepad.dialogs.findReplace.findPlaceholder')}
                autoFocus
                className="bg-background border-border text-foreground text-sm h-8 sm:h-10"
              />
            </div>

            {/* Replace Input */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm text-foreground">{t('onlineNotepad.dialogs.findReplace.replaceLabel')}</label>
              <Input
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                placeholder={t('onlineNotepad.dialogs.findReplace.replacePlaceholder')}
                className="bg-background border-border text-foreground text-sm h-8 sm:h-10"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={matchCase}
                  onChange={(e) => setMatchCase(e.target.checked)}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary border-border focus:ring-ring"
                />
                <span className="text-xs sm:text-sm text-foreground">{t('onlineNotepad.dialogs.findReplace.matchCase')}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wholeWord}
                  onChange={(e) => setWholeWord(e.target.checked)}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary border-border focus:ring-ring"
                />
                <span className="text-xs sm:text-sm text-foreground">{t('onlineNotepad.dialogs.findReplace.wholeWord')}</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleFind}
                  disabled={!searchTerm.trim()}
                  size="sm"
                  className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                >
                  {t('onlineNotepad.dialogs.findReplace.findNext')}
                </Button>
                <Button
                  onClick={handleReplace}
                  disabled={!searchTerm.trim()}
                  size="sm"
                  className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                >
                  {t('onlineNotepad.dialogs.findReplace.replace')}
                </Button>
                <Button
                  onClick={handleReplaceAll}
                  disabled={!searchTerm.trim()}
                  size="sm"
                  className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                >
                  {t('onlineNotepad.dialogs.findReplace.replaceAll')}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={!searchTerm.trim()}
                  size="sm"
                  className="border-border hover:bg-accent hover:text-accent-foreground shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                >
                  {t('onlineNotepad.dialogs.findReplace.findPrevious')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={!searchTerm.trim()}
                  size="sm"
                  className="border-border hover:bg-accent hover:text-accent-foreground shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8"
                >
                  {t('onlineNotepad.dialogs.findReplace.findNext')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}