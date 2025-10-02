'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToolTranslations } from '@/lib/i18n/hooks';
import { HeaderMenu } from '@/components/notepad/HeaderMenu';
import { Toolbar } from '@/components/notepad/Toolbar';
import { Editor } from '@/components/notepad/Editor';
import { StatusBar } from '@/components/notepad/StatusBar';
import { downloadTextAsFile } from '@/lib/utils';
import { ConfirmDialog } from '@/components/notepad/dialogs/ConfirmDialog';
import { FindDialog } from '@/components/notepad/dialogs/FindDialog';

export function OnlineNotepadEditor() {
  const { tool } = useToolTranslations('tools/miscellaneous');
  
  // Editor state
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
  // View state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Editor formatting state
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('14');
  const [wordWrap, setWordWrap] = useState(true);
  const [currentFormatting, setCurrentFormatting] = useState({
    bold: false,
    italic: false,
    underline: false
  });
  const [currentAlignment, setCurrentAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  
  // Cursor and selection state
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorColumn, setCursorColumn] = useState(1);
  const [selectionStart, setSelectionStart] = useState<number>();
  const [selectionEnd, setSelectionEnd] = useState<number>();
  
  // Dialog state
  const [showNewFileConfirm, setShowNewFileConfirm] = useState(false);
  const [showFindDialog, setShowFindDialog] = useState(false);

  // Refs
  const editorRef = useRef<{
    getEditor: () => {
      focus: () => void;
      getLength: () => number;
      getText: (index?: number, length?: number) => string;
      setSelection: (index: number, length?: number) => void;
      getSelection: () => { index: number; length: number } | null;
      insertText: (index: number, text: string) => void;
      format: (name: string, value: unknown) => void;
      getFormat: (range?: { index: number; length: number }) => Record<string, unknown>;
      on: (event: string, handler: () => void) => void;
      root: HTMLElement;
    };
    undoEdit?: () => void;
    redoEdit?: () => void;
    selectAllText?: () => void;
    insertText?: (text: string) => void;
    formatSelection?: (formatType: 'bold' | 'italic' | 'underline') => void;
    applyAlignment?: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
    pasteFromClipboard?: () => Promise<void>;
    getCurrentFormatting?: () => { bold: boolean; italic: boolean; underline: boolean };
    getCurrentAlignment?: () => 'left' | 'center' | 'right' | 'justify';
    findText?: (searchTerm: string, options: { matchCase: boolean; wholeWord: boolean; useRegex: boolean }) => { found: boolean; currentMatch: number; totalMatches: number };
    findNext?: (searchTerm: string, options: { matchCase: boolean; wholeWord: boolean; useRegex: boolean }) => { found: boolean; currentMatch: number; totalMatches: number };
    findPrev?: (searchTerm: string, options: { matchCase: boolean; wholeWord: boolean; useRegex: boolean }) => { found: boolean; currentMatch: number; totalMatches: number };
    replaceText?: (searchTerm: string, replaceTerm: string, options: { matchCase: boolean; wholeWord: boolean; useRegex: boolean }) => boolean;
    replaceAllText?: (searchTerm: string, replaceTerm: string, options: { matchCase: boolean; wholeWord: boolean; useRegex: boolean }) => number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-save functionality
  useEffect(() => {
    const savedContent = localStorage.getItem('online-notepad-content');
    const savedTime = localStorage.getItem('online-notepad-saved-time');
    const savedFontFamily = localStorage.getItem('online-notepad-font-family');
    const savedFontSize = localStorage.getItem('online-notepad-font-size');
    
    if (savedContent) {
      setContent(savedContent);
    }
    
    if (savedTime) {
      setLastSaved(new Date(savedTime));
    }
    
    if (savedFontFamily) {
      setFontFamily(savedFontFamily);
    }
    
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
  }, []);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (content !== '') {
        setIsAutoSaving(true);
        localStorage.setItem('online-notepad-content', content);
        localStorage.setItem('online-notepad-saved-time', new Date().toISOString());
        localStorage.setItem('online-notepad-font-family', fontFamily);
        localStorage.setItem('online-notepad-font-size', fontSize);
        
        setTimeout(() => {
          setLastSaved(new Date());
          setIsAutoSaving(false);
        }, 300);
      }
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [content, fontFamily, fontSize]);

  // Menu action handlers
  const handleMenuAction = (actionId: string) => {
    const textarea = editorRef.current;
    
    switch (actionId) {
      case 'file-new':
        handleNewFile();
        break;
      case 'file-open':
        handleFileOpen();
        break;
      case 'file-save-txt':
        handleSaveAs('txt');
        break;
      case 'file-save-md':
        handleSaveAs('md');
        break;
      case 'file-print':
        handlePrint();
        break;
      case 'file-exit':
        window.close();
        break;
      case 'edit-undo':
        if (textarea?.undoEdit) {
          textarea.undoEdit();
        }
        break;
      case 'edit-redo':
        if (textarea?.redoEdit) {
          textarea.redoEdit();
        }
        break;
      case 'edit-cut':
        if (textarea) {
          const quill = textarea.getEditor();
          quill.focus();
          document.execCommand('cut');
        }
        break;
      case 'edit-copy':
        if (textarea) {
          const quill = textarea.getEditor();
          quill.focus();
          document.execCommand('copy');
        }
        break;
      case 'edit-paste':
        if (textarea?.pasteFromClipboard) {
          textarea.pasteFromClipboard();
        }
        break;
      case 'edit-select-all':
        if (textarea?.selectAllText) {
          textarea.selectAllText();
        }
        break;
      case 'insert-datetime':
        if (textarea?.insertText) {
          textarea.insertText(new Date().toLocaleString());
        }
        break;
      case 'view-fullscreen':
        setIsFullScreen(!isFullScreen);
        break;
      case 'view-preview':
        setShowPreview(!showPreview);
        break;
      case 'view-word-wrap':
        setWordWrap(!wordWrap);
        break;
      case 'edit-find':
        setShowFindDialog(true);
        break;
      case 'edit-replace':
        setShowFindDialog(true);
        break;
    }
  };

  const handleNewFile = () => {
    if (content && content.trim()) {
      setShowNewFileConfirm(true);
    } else {
      createNewFile();
    }
  };

  const createNewFile = () => {
    setContent('');
    setLastSaved(null);
  };

  const handleFileOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.text';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileContent = event.target?.result as string;
          setContent(fileContent);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSaveAs = (format: 'txt' | 'md') => {
    const filename = `notepad-${new Date().toISOString().slice(0, 10)}.${format}`;
    // Convert HTML content to plain text for TXT, keep HTML for MD
    const fileContent = format === 'txt' 
      ? content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
      : content;
    downloadTextAsFile(fileContent, filename);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Online Notepad - Print</title>
            <style>
              body { 
                font-family: ${fontFamily}, sans-serif; 
                font-size: ${fontSize}px; 
                margin: 40px; 
                line-height: 1.6; 
                white-space: pre-wrap;
              }
              .header { border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
              .date { color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${tool('onlineNotepad.printTitle')}</h1>
              <div class="date">${tool('onlineNotepad.printDate')} ${new Date().toLocaleString()}</div>
            </div>
            <div>${content || ''}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleFormatToggle = (format: 'bold' | 'italic' | 'underline') => {
    const textarea = editorRef.current;
    if (textarea?.formatSelection) {
      textarea.formatSelection(format);
    }
  };

  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    const textarea = editorRef.current;
    if (textarea?.applyAlignment) {
      textarea.applyAlignment(alignment);
    }
  };

  // Search and replace handlers
  const handleFind = (searchTerm: string, options: { matchCase: boolean; wholeWord: boolean; useRegex: boolean }) => {
    if (editorRef.current?.findText) {
      const result = editorRef.current.findText(searchTerm, options);
      if (!result.found) {
        // Could show a "not found" message here
        console.log(tool('onlineNotepad.textNotFound'));
      }
      return result;
    }
    return { found: false, currentMatch: 0, totalMatches: 0 };
  };

  const handleFindNext = (searchTerm: string, options: { matchCase: boolean; wholeWord: boolean; useRegex: boolean }) => {
    if (editorRef.current?.findNext) {
      return editorRef.current.findNext(searchTerm, options);
    }
    return { found: false, currentMatch: 0, totalMatches: 0 };
  };

  const handleFindPrev = (searchTerm: string, options: { matchCase: boolean; wholeWord: boolean; useRegex: boolean }) => {
    if (editorRef.current?.findPrev) {
      return editorRef.current.findPrev(searchTerm, options);
    }
    return { found: false, currentMatch: 0, totalMatches: 0 };
  };

  const handleReplace = (searchTerm: string, replaceTerm: string, options: { matchCase: boolean; wholeWord: boolean; useRegex: boolean }) => {
    if (editorRef.current?.replaceText) {
      const replaced = editorRef.current.replaceText(searchTerm, replaceTerm, options);
      if (replaced) {
        // Find next occurrence
        editorRef.current.findText?.(searchTerm, options);
      }
    }
  };

  const handleReplaceAll = (searchTerm: string, replaceTerm: string, options: { matchCase: boolean; wholeWord: boolean; useRegex: boolean }) => {
    if (editorRef.current?.replaceAllText) {
      const count = editorRef.current.replaceAllText(searchTerm, replaceTerm, options);
      console.log(`Replaced ${count} occurrences`);
      // Could show a notification here
    }
  };

  if (isFullScreen) {
    return (
      <div 
        ref={containerRef}
        className="fixed inset-0 z-50 bg-background flex flex-col overflow-visible"
      >
        <HeaderMenu onMenuAction={handleMenuAction} />
        <Toolbar
          fontFamily={fontFamily}
          fontSize={fontSize}
          textFormatting={currentFormatting}
          textAlignment={currentAlignment}
          isFullscreen={isFullScreen}
          onFontFamilyChange={setFontFamily}
          onFontSizeChange={setFontSize}
          onFormatToggle={handleFormatToggle}
          onAlignmentChange={handleAlignmentChange}
          onFullscreenToggle={() => setIsFullScreen(false)}
          onMenuAction={handleMenuAction}
        />
        
        {showPreview ? (
          <div className="flex-1 p-6 overflow-y-auto bg-background">
            <div 
              className="prose prose-lg max-w-none text-foreground"
              style={{ 
                fontFamily: fontFamily === 'system-ui' ? 'system-ui, -apple-system, sans-serif' : fontFamily,
                fontSize: `${fontSize}px`
              }}
            >
              {content.split('\n').map((line, index) => (
                <p key={index}>{line || '\u00A0'}</p>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden relative">
            <Editor
                ref={editorRef}
                content={content}
                onContentChange={setContent}
                fontFamily={fontFamily}
                fontSize={fontSize}
                textFormatting={{ bold: false, italic: false, underline: false }}
                textAlignment={'left'}
                wordWrap={wordWrap}
                onCursorPositionChange={(line, column) => {
                  setCursorLine(line);
                  setCursorColumn(column);
                  // Update formatting state
                  if (editorRef.current?.getCurrentFormatting) {
                    setCurrentFormatting(editorRef.current.getCurrentFormatting());
                  }
                  if (editorRef.current?.getCurrentAlignment) {
                    setCurrentAlignment(editorRef.current.getCurrentAlignment());
                  }
                }}
                onSelectionChange={(start, end) => {
                  setSelectionStart(start);
                  setSelectionEnd(end);
                  // Update formatting state on selection change
                  if (editorRef.current?.getCurrentFormatting) {
                    setCurrentFormatting(editorRef.current.getCurrentFormatting());
                  }
                  if (editorRef.current?.getCurrentAlignment) {
                    setCurrentAlignment(editorRef.current.getCurrentAlignment());
                  }
                }}
                className="h-full w-full"
              />
          </div>
        )}
        
        <StatusBar
          content={content}
          cursorLine={cursorLine}
          cursorColumn={cursorColumn}
          selectionStart={selectionStart}
          selectionEnd={selectionEnd}
          lastSaved={lastSaved}
          isAutoSaving={isAutoSaving}
        />

        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={showNewFileConfirm}
          onOpenChange={setShowNewFileConfirm}
          title={tool('onlineNotepad.newFileTitle')}
          description={tool('onlineNotepad.newFileDescription')}
          confirmLabel={tool('onlineNotepad.newFileConfirm')}
          cancelLabel={tool('onlineNotepad.newFileCancel')}
          onConfirm={createNewFile}
          variant="destructive"
        />

        {/* Find and Replace Dialog */}
        <FindDialog
          open={showFindDialog}
          onOpenChange={setShowFindDialog}
          onFind={handleFind}
          onFindNext={handleFindNext}
          onFindPrev={handleFindPrev}
          onReplace={handleReplace}
          onReplaceAll={handleReplaceAll}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground">{tool('onlineNotepad.title')}</h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          {tool('onlineNotepad.description')}
        </p>
      </div>

      {/* Notepad Interface */}
      <div ref={containerRef} className="relative border border-border rounded-lg bg-background shadow-sm z-10">
        <HeaderMenu onMenuAction={handleMenuAction} />
        <Toolbar
          fontFamily={fontFamily}
          fontSize={fontSize}
          textFormatting={currentFormatting}
          textAlignment={currentAlignment}
          isFullscreen={isFullScreen}
          onFontFamilyChange={setFontFamily}
          onFontSizeChange={setFontSize}
          onFormatToggle={handleFormatToggle}
          onAlignmentChange={handleAlignmentChange}
          onFullscreenToggle={() => setIsFullScreen(true)}
          onMenuAction={handleMenuAction}
        />
        
        <div className="flex flex-col h-96 relative overflow-hidden">
          {showPreview ? (
            <div className="flex-1 p-3 sm:p-6 overflow-y-auto bg-background rounded-b-lg">
              <div 
                className="prose prose-lg max-w-none text-foreground"
                style={{ 
                  fontFamily: fontFamily === 'system-ui' ? 'system-ui, -apple-system, sans-serif' : fontFamily,
                  fontSize: `${fontSize}px`
                }}
              >
                {content.split('\n').map((line, index) => (
                  <p key={index}>{line || '\u00A0'}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden relative">
              <Editor
                  ref={editorRef}
                  content={content}
                  onContentChange={setContent}
                  fontFamily={fontFamily}
                  fontSize={fontSize}
                  textFormatting={{ bold: false, italic: false, underline: false }}
                  textAlignment={'left'}
                  wordWrap={wordWrap}
                  placeholder={tool('onlineNotepad.inputPlaceholder')}
                  onCursorPositionChange={(line, column) => {
                    setCursorLine(line);
                    setCursorColumn(column);
                    // Update formatting state
                    if (editorRef.current?.getCurrentFormatting) {
                      setCurrentFormatting(editorRef.current.getCurrentFormatting());
                    }
                    if (editorRef.current?.getCurrentAlignment) {
                      setCurrentAlignment(editorRef.current.getCurrentAlignment());
                    }
                  }}
                  onSelectionChange={(start, end) => {
                    setSelectionStart(start);
                    setSelectionEnd(end);
                    // Update formatting state on selection change
                    if (editorRef.current?.getCurrentFormatting) {
                      setCurrentFormatting(editorRef.current.getCurrentFormatting());
                    }
                    if (editorRef.current?.getCurrentAlignment) {
                      setCurrentAlignment(editorRef.current.getCurrentAlignment());
                    }
                  }}
                  className="h-full w-full"
                />
            </div>
          )}
        </div>
        
        <StatusBar
          content={content}
          cursorLine={cursorLine}
          cursorColumn={cursorColumn}
          selectionStart={selectionStart}
          selectionEnd={selectionEnd}
          lastSaved={lastSaved}
          isAutoSaving={isAutoSaving}
        />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showNewFileConfirm}
        onOpenChange={setShowNewFileConfirm}
        title="Create New File"
        description="Are you sure you want to create a new file? Any unsaved changes will be lost."
        confirmLabel="Create New"
        cancelLabel="Cancel"
        onConfirm={createNewFile}
        variant="destructive"
      />

      {/* Find and Replace Dialog */}
      <FindDialog
        open={showFindDialog}
        onOpenChange={setShowFindDialog}
        onFind={handleFind}
        onFindNext={handleFindNext}
        onFindPrev={handleFindPrev}
        onReplace={handleReplace}
        onReplaceAll={handleReplaceAll}
      />
    </div>
  );
}