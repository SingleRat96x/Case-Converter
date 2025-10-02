'use client';

import React, { useMemo } from 'react';
import { Check, Clock, FileText, Hash, AlignLeft } from 'lucide-react';
import { useToolTranslations } from '@/lib/i18n/hooks';

interface StatusBarProps {
  content: string;
  cursorLine?: number;
  cursorColumn?: number;
  selectionStart?: number;
  selectionEnd?: number;
  lastSaved?: Date | null;
  isAutoSaving?: boolean;
  encoding?: string;
  className?: string;
}

export function StatusBar({
  content,
  cursorLine = 1,
  cursorColumn = 1,
  selectionStart,
  selectionEnd,
  lastSaved,
  isAutoSaving = false,
  encoding = 'UTF-8',
  className = ''
}: StatusBarProps) {
  const { tool: t } = useToolTranslations('tools/miscellaneous');
  
  // Calculate text statistics (handle HTML content from Quill)
  const textStats = useMemo(() => {
    if (!content) {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        lines: 1,
        paragraphs: 0,
        selectedChars: 0,
        selectedWords: 0
      };
    }

    // Strip HTML tags to get plain text for counting
    const textContent = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    
    const words = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
    const characters = textContent.length;
    const charactersNoSpaces = textContent.replace(/\s/g, '').length;
    const lines = textContent.split('\n').length;
    const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim()).length;

    // Selection statistics
    let selectedChars = 0;
    let selectedWords = 0;
    
    if (selectionStart !== undefined && selectionEnd !== undefined && selectionStart !== selectionEnd) {
      const selectedHtml = content.substring(selectionStart, selectionEnd);
      const selectedText = selectedHtml.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
      selectedChars = selectedText.length;
      selectedWords = selectedText.trim() ? selectedText.trim().split(/\s+/).length : 0;
    }

    return {
      words,
      characters,
      charactersNoSpaces,
      lines,
      paragraphs,
      selectedChars,
      selectedWords
    };
  }, [content, selectionStart, selectionEnd]);

  const formatLastSaved = () => {
    if (!lastSaved) return t('onlineNotepad.statusLabels.neverSaved');
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return t('onlineNotepad.statusLabels.justSaved');
    if (diffMins === 1) return `1 ${t('onlineNotepad.statusLabels.minuteAgo')}`;
    if (diffMins < 60) return `${diffMins} ${t('onlineNotepad.statusLabels.minutesAgo')}`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return `1 ${t('onlineNotepad.statusLabels.hourAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('onlineNotepad.statusLabels.hoursAgo')}`;
    
    return lastSaved.toLocaleDateString();
  };

  const StatusItem = ({ 
    icon, 
    label, 
    value, 
    title 
  }: { 
    icon?: React.ReactNode; 
    label: string; 
    value: string | number; 
    title?: string;
  }) => (
    <div 
      className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-default"
      title={title}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="font-medium">{label}:</span>
      <span className="font-mono">{value}</span>
    </div>
  );

  const Separator = () => (
    <div className="hidden sm:block w-px h-4 bg-border mx-1" />
  );

  return (
    <div className={`relative z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-4 py-2 sm:py-1.5 bg-background border-t border-border text-xs gap-2 rounded-b-lg ${className}`}>
      {/* Left side - Text statistics */}
      <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1">
        <StatusItem
          icon={<FileText className="h-3 w-3" />}
          label={t('onlineNotepad.statusLabels.words')}
          value={textStats.words}
          title={`${t('onlineNotepad.statusLabels.words')}: ${textStats.words}`}
        />
        
        <Separator />
        
        <StatusItem
          icon={<Hash className="h-3 w-3" />}
          label={t('onlineNotepad.statusLabels.characters')}
          value={`${textStats.characters.toLocaleString()}/500K`}
          title={`${t('onlineNotepad.statusLabels.characters')}: ${textStats.characters.toLocaleString()} / 500,000 limit (${textStats.charactersNoSpaces.toLocaleString()} without spaces)`}
        />
        
        <Separator />
        
        <StatusItem
          icon={<AlignLeft className="h-3 w-3" />}
          label={t('onlineNotepad.statusLabels.lines')}
          value={textStats.lines}
          title={`${t('onlineNotepad.statusLabels.lines')}: ${textStats.lines}, Paragraphs: ${textStats.paragraphs}`}
        />

        {/* Selection info */}
        {textStats.selectedChars > 0 && (
          <>
            <Separator />
            <StatusItem
              label={t('onlineNotepad.statusLabels.selected')}
              value={`${textStats.selectedWords} words, ${textStats.selectedChars} chars`}
              title={`${t('onlineNotepad.statusLabels.selected')}: ${textStats.selectedWords} words, ${textStats.selectedChars} characters`}
            />
          </>
        )}
        </div>
      </div>

      {/* Right side - Position and save status */}
      <div className="flex flex-wrap items-center gap-1 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-1">
        {/* Cursor position */}
        <StatusItem
          label={t('onlineNotepad.statusLabels.line')}
          value={cursorLine}
          title={`Line ${cursorLine}, Column ${cursorColumn}`}
        />
        
        <StatusItem
          label={t('onlineNotepad.statusLabels.column')}
          value={cursorColumn}
        />
        
        <Separator />
        
        {/* Encoding */}
        <StatusItem
          label={t('onlineNotepad.statusLabels.encoding')}
          value={encoding}
          title={`File encoding: ${encoding}`}
        />
        
        <Separator />
        
        {/* Auto-save status */}
        <div className="flex items-center gap-1.5 px-2 py-1 text-xs">
          {isAutoSaving ? (
            <>
              <Clock className="h-3 w-3 text-amber-500 animate-spin" />
              <span className="text-amber-600 dark:text-amber-400">{t('onlineNotepad.statusLabels.saving')}</span>
            </>
          ) : lastSaved ? (
            <>
              <Check className="h-3 w-3 text-green-500" />
              <span className="text-muted-foreground" title={`Last saved: ${lastSaved.toLocaleString()}`}>
                {formatLastSaved()}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">{t('onlineNotepad.statusLabels.notSaved')}</span>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}