'use client';

import React, { useRef, useEffect, useCallback, useState, useImperativeHandle } from 'react';


interface EditorProps {
  content: string;
  onContentChange: (content: string) => void;
  fontFamily: string;
  fontSize: string;
  textFormatting: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
  };
  textAlignment: 'left' | 'center' | 'right' | 'justify';
  wordWrap: boolean;
  placeholder?: string;
  className?: string;
  onCursorPositionChange?: (line: number, column: number) => void;
  onSelectionChange?: (start: number, end: number) => void;
}

interface SearchOptions {
  matchCase: boolean;
  wholeWord: boolean;
  useRegex: boolean;
}

interface FindResult {
  found: boolean;
  currentMatch: number;
  totalMatches: number;
}

interface EditorRef {
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
  findText?: (searchTerm: string, options: SearchOptions) => FindResult;
  findNext?: (searchTerm: string, options: SearchOptions) => FindResult;
  findPrev?: (searchTerm: string, options: SearchOptions) => FindResult;
  replaceText?: (searchTerm: string, replaceTerm: string, options: SearchOptions) => boolean;
  replaceAllText?: (searchTerm: string, replaceTerm: string, options: SearchOptions) => number;
}

export const Editor = React.forwardRef<EditorRef, EditorProps>(function Editor({
  content,
  onContentChange,
  fontFamily,
  fontSize,
  textAlignment,
  wordWrap,
  placeholder = '',
  className = '',
  onCursorPositionChange,
  onSelectionChange
}, ref) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [currentFormatting, setCurrentFormatting] = useState({
    bold: false,
    italic: false,
    underline: false
  });
  const [currentAlignment, setCurrentAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [lastSearchTerm, setLastSearchTerm] = useState('');
  const [lastSearchOptions, setLastSearchOptions] = useState<SearchOptions | null>(null);
  const [allMatches, setAllMatches] = useState<{ start: number; end: number; textNode: Node; textOffset: number }[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Mount effect
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Update cursor position and selection
  const updateCursorInfo = useCallback(() => {
    if (!editorRef.current) return;

    try {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Update cursor position
        if (onCursorPositionChange) {
          const textBeforeCursor = range.startContainer.textContent?.substring(0, range.startOffset) || '';
          const lines = textBeforeCursor.split('\n');
          const currentLine = lines.length;
          const currentColumn = lines[lines.length - 1].length + 1;
          onCursorPositionChange(currentLine, currentColumn);
        }

        if (onSelectionChange) {
          onSelectionChange(range.startOffset, range.endOffset);
        }

        // Detect current formatting
        const formatting = {
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline')
        };
        setCurrentFormatting(formatting);

        // Detect current alignment
        const isCenter = document.queryCommandState('justifyCenter');
        const isRight = document.queryCommandState('justifyRight');
        const isJustify = document.queryCommandState('justifyFull');
        
        let alignment: 'left' | 'center' | 'right' | 'justify' = 'left';
        if (isCenter) alignment = 'center';
        else if (isRight) alignment = 'right';
        else if (isJustify) alignment = 'justify';
        
        setCurrentAlignment(alignment);
      }
    } catch {
      // Fallback for cursor position
      if (onCursorPositionChange) {
        onCursorPositionChange(1, 1);
      }
    }
  }, [onCursorPositionChange, onSelectionChange]);

  // Character limit for performance (500KB of text content)
  const MAX_CONTENT_LENGTH = 500000;

  // Handle content changes with character limit
  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    if (isComposing) return;
    
    const newContent = e.currentTarget.innerHTML;
    const textContent = newContent.replace(/<[^>]*>/g, ''); // Strip HTML for length check
    
    // Check if content exceeds limit
    if (textContent.length > MAX_CONTENT_LENGTH) {
      // Prevent the change by restoring previous content
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
        // Show a brief warning (you can customize this)
        console.warn(`Content limit reached: ${MAX_CONTENT_LENGTH.toLocaleString()} characters maximum`);
      }
      return;
    }
    
    onContentChange(newContent);
    updateCursorInfo();
  }, [onContentChange, isComposing, updateCursorInfo, content]);

  // Undo functionality using native browser undo
  const undo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('undo');
      setTimeout(() => {
        updateCursorInfo();
        if (editorRef.current) {
          onContentChange(editorRef.current.innerHTML);
        }
      }, 0);
    }
  }, [onContentChange, updateCursorInfo]);

  // Redo functionality using native browser redo
  const redo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('redo');
      setTimeout(() => {
        updateCursorInfo();
        if (editorRef.current) {
          onContentChange(editorRef.current.innerHTML);
        }
      }, 0);
    }
  }, [onContentChange, updateCursorInfo]);

  // Format selected text
  const formatSelectedText = useCallback((formatType: 'bold' | 'italic' | 'underline') => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(formatType, false);
      setTimeout(() => {
        updateCursorInfo();
        if (editorRef.current) {
          onContentChange(editorRef.current.innerHTML);
        }
      }, 0);
    }
  }, [updateCursorInfo, onContentChange]);

  // Apply alignment
  const applyAlignment = useCallback((alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (editorRef.current) {
      editorRef.current.focus();
      const alignCommand = alignment === 'left' ? 'justifyLeft' : 
                          alignment === 'center' ? 'justifyCenter' :
                          alignment === 'right' ? 'justifyRight' : 'justifyFull';
      document.execCommand(alignCommand, false);
      setTimeout(() => {
        updateCursorInfo();
        if (editorRef.current) {
          onContentChange(editorRef.current.innerHTML);
        }
      }, 0);
    }
  }, [updateCursorInfo, onContentChange]);

  // Select all text
  const selectAllText = useCallback(() => {
    if (editorRef.current) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
      updateCursorInfo();
    }
  }, [updateCursorInfo]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          formatSelectedText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatSelectedText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatSelectedText('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
        case 'a':
          e.preventDefault();
          selectAllText();
          break;
        case 'f':
          e.preventDefault();
          // Trigger find dialog - we'll need to pass this up to the parent
          break;
        case 'h':
          e.preventDefault();
          // Trigger find & replace dialog - we'll need to pass this up to the parent
          break;
      }
    }
  }, [formatSelectedText, undo, redo, selectAllText]);

  // Insert text at cursor
  const insertTextAtCursor = useCallback((text: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, text);
      updateCursorInfo();
    }
  }, [updateCursorInfo]);

  // Paste functionality
  const pasteFromClipboard = useCallback(async () => {
    if (editorRef.current) {
      try {
        editorRef.current.focus();
        
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
          const text = await navigator.clipboard.readText();
          
          // Check if paste would exceed limit
          const currentText = editorRef.current.textContent || '';
          if (currentText.length + text.length > MAX_CONTENT_LENGTH) {
            console.warn(`Cannot paste: Content would exceed ${MAX_CONTENT_LENGTH.toLocaleString()} character limit`);
            return;
          }
          
          document.execCommand('insertText', false, text);
        } else {
          // For fallback, we can't pre-check the length, but handleInput will catch it
          document.execCommand('paste');
        }
        
        updateCursorInfo();
      } catch {
        // If clipboard access fails, try execCommand as fallback
        try {
          document.execCommand('paste');
          updateCursorInfo();
        } catch (e) {
          console.warn('Paste operation failed:', e);
        }
      }
    }
  }, [updateCursorInfo]);

  // Helper function to find all matches
  const findAllMatches = useCallback((searchTerm: string, options: SearchOptions) => {
    if (!editorRef.current || !searchTerm) return [];

    const text = editorRef.current.textContent || '';
    const matches: { start: number; end: number; textNode: Node; textOffset: number }[] = [];
    
    let searchRegex: RegExp;
    
    try {
      if (options.useRegex) {
        const flags = options.matchCase ? 'g' : 'gi';
        searchRegex = new RegExp(searchTerm, flags);
      } else if (options.wholeWord) {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = options.matchCase ? 'g' : 'gi';
        searchRegex = new RegExp(`\\b${escapedTerm}\\b`, flags);
      } else {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = options.matchCase ? 'g' : 'gi';
        searchRegex = new RegExp(escapedTerm, flags);
      }
    } catch (e) {
      console.warn('Invalid regex pattern:', e);
      return [];
    }

    let match;
    const targetText = options.matchCase ? text : text.toLowerCase();
    
    while ((match = searchRegex.exec(targetText)) !== null) {
      // Find the corresponding text node and offset
      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      let currentPos = 0;
      let textNode = walker.nextNode();
      
      while (textNode) {
        const nodeLength = textNode.textContent?.length || 0;
        if (currentPos + nodeLength > match.index) {
          const textOffset = match.index - currentPos;
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            textNode,
            textOffset
          });
          break;
        }
        currentPos += nodeLength;
        textNode = walker.nextNode();
      }
      
      // Prevent infinite loop for zero-length matches
      if (match[0].length === 0) {
        searchRegex.lastIndex++;
      }
    }
    
    return matches;
  }, []);

  // Search and replace functionality
  const findText = useCallback((searchTerm: string, options: SearchOptions): FindResult => {
    if (!editorRef.current || !searchTerm) {
      return { found: false, currentMatch: 0, totalMatches: 0 };
    }

    // If this is a new search or different options, find all matches
    if (searchTerm !== lastSearchTerm || JSON.stringify(options) !== JSON.stringify(lastSearchOptions)) {
      const matches = findAllMatches(searchTerm, options);
      setAllMatches(matches);
      setCurrentMatchIndex(0);
      setLastSearchTerm(searchTerm);
      setLastSearchOptions(options);
      
      if (matches.length === 0) {
        return { found: false, currentMatch: 0, totalMatches: 0 };
      }
      
      // Select first match
      const firstMatch = matches[0];
      const selection = window.getSelection();
      const range = document.createRange();
      
      range.setStart(firstMatch.textNode, firstMatch.textOffset);
      range.setEnd(firstMatch.textNode, firstMatch.textOffset + (firstMatch.end - firstMatch.start));
      
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Scroll into view
      if (firstMatch.textNode && firstMatch.textNode.parentElement) {
        firstMatch.textNode.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return { found: true, currentMatch: 1, totalMatches: matches.length };
    } else {
      // Find next match
      if (allMatches.length === 0) {
        return { found: false, currentMatch: 0, totalMatches: 0 };
      }
      
      const nextIndex = (currentMatchIndex + 1) % allMatches.length;
      setCurrentMatchIndex(nextIndex);
      
      const nextMatch = allMatches[nextIndex];
      const selection = window.getSelection();
      const range = document.createRange();
      
      range.setStart(nextMatch.textNode, nextMatch.textOffset);
      range.setEnd(nextMatch.textNode, nextMatch.textOffset + (nextMatch.end - nextMatch.start));
      
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Scroll into view
      if (nextMatch.textNode && nextMatch.textNode.parentElement) {
        nextMatch.textNode.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      return { found: true, currentMatch: nextIndex + 1, totalMatches: allMatches.length };
    }
  }, [lastSearchTerm, lastSearchOptions, allMatches, currentMatchIndex, findAllMatches]);

  const findNext = useCallback((): FindResult => {
    if (allMatches.length === 0 || !editorRef.current) {
      return { found: false, currentMatch: 0, totalMatches: 0 };
    }
    
    const nextIndex = (currentMatchIndex + 1) % allMatches.length;
    setCurrentMatchIndex(nextIndex);
    
    const nextMatch = allMatches[nextIndex];
    const selection = window.getSelection();
    const range = document.createRange();
    
    range.setStart(nextMatch.textNode, nextMatch.textOffset);
    range.setEnd(nextMatch.textNode, nextMatch.textOffset + (nextMatch.end - nextMatch.start));
    
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    // Scroll into view
    if (nextMatch.textNode && nextMatch.textNode.parentElement) {
      nextMatch.textNode.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    return { found: true, currentMatch: nextIndex + 1, totalMatches: allMatches.length };
  }, [allMatches, currentMatchIndex]);

  const findPrev = useCallback((): FindResult => {
    if (allMatches.length === 0 || !editorRef.current) {
      return { found: false, currentMatch: 0, totalMatches: 0 };
    }
    
    const prevIndex = currentMatchIndex === 0 ? allMatches.length - 1 : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    
    const prevMatch = allMatches[prevIndex];
    const selection = window.getSelection();
    const range = document.createRange();
    
    range.setStart(prevMatch.textNode, prevMatch.textOffset);
    range.setEnd(prevMatch.textNode, prevMatch.textOffset + (prevMatch.end - prevMatch.start));
    
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    // Scroll into view
    if (prevMatch.textNode && prevMatch.textNode.parentElement) {
      prevMatch.textNode.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    return { found: true, currentMatch: prevIndex + 1, totalMatches: allMatches.length };
  }, [allMatches, currentMatchIndex]);

  const replaceText = useCallback((searchTerm: string, replaceTerm: string, options: SearchOptions): boolean => {
    if (!editorRef.current) return false;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      // Check if selected text matches search term
      let matches = false;
      if (options.matchCase) {
        matches = selectedText === searchTerm;
      } else {
        matches = selectedText.toLowerCase() === searchTerm.toLowerCase();
      }
      
      if (matches) {
        range.deleteContents();
        range.insertNode(document.createTextNode(replaceTerm));
        
        // Update content
        setTimeout(() => {
          if (editorRef.current) {
            onContentChange(editorRef.current.innerHTML);
          }
        }, 0);
        
        return true;
      }
    }
    
    return false;
  }, [onContentChange]);

  const replaceAllText = useCallback((searchTerm: string, replaceTerm: string, options: SearchOptions): number => {
    if (!editorRef.current || !searchTerm) return 0;

    const text = editorRef.current.textContent || '';
    let count = 0;

    if (options.useRegex) {
      try {
        const flags = options.matchCase ? 'g' : 'gi';
        const regex = new RegExp(searchTerm, flags);
        const newText = text.replace(regex, () => {
          count++;
          return replaceTerm;
        });
        
        if (count > 0) {
          editorRef.current.textContent = newText;
          onContentChange(editorRef.current.innerHTML);
        }
      } catch (e) {
        console.warn('Invalid regex pattern:', e);
        return 0;
      }
    } else {
      if (options.wholeWord) {
        const wordRegex = new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, options.matchCase ? 'g' : 'gi');
        const newText = text.replace(wordRegex, () => {
          count++;
          return replaceTerm;
        });
        
        if (count > 0) {
          editorRef.current.textContent = newText;
          onContentChange(editorRef.current.innerHTML);
        }
      } else {
        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), options.matchCase ? 'g' : 'gi');
        const newText = text.replace(regex, () => {
          count++;
          return replaceTerm;
        });
        
        if (count > 0) {
          editorRef.current.textContent = newText;
          onContentChange(editorRef.current.innerHTML);
        }
      }
    }

    return count;
  }, [onContentChange]);

  // Expose editor functions via useImperativeHandle
  useImperativeHandle(ref, () => ({
    getEditor: () => ({
      focus: () => editorRef.current?.focus(),
      getLength: () => editorRef.current?.textContent?.length || 0,
      getText: (index = 0, length) => {
        const text = editorRef.current?.textContent || '';
        return length ? text.substring(index, index + length) : text.substring(index);
      },
      setSelection: (index: number, length = 0) => {
        if (editorRef.current) {
          const selection = window.getSelection();
          const range = document.createRange();
          const textNode = editorRef.current.firstChild || editorRef.current;
          range.setStart(textNode, Math.min(index, textNode.textContent?.length || 0));
          range.setEnd(textNode, Math.min(index + length, textNode.textContent?.length || 0));
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      },
      getSelection: () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          return { index: range.startOffset, length: range.endOffset - range.startOffset };
        }
        return null;
      },
      insertText: (index: number, text: string) => {
        insertTextAtCursor(text);
      },
      format: (name: string, value: unknown) => {
        document.execCommand(name, false, String(value));
      },
      getFormat: () => ({}),
      on: () => {},
      root: editorRef.current as HTMLElement
    }),
    undoEdit: undo,
    redoEdit: redo,
    selectAllText,
    insertText: insertTextAtCursor,
    formatSelection: formatSelectedText,
    applyAlignment,
    pasteFromClipboard,
    getCurrentFormatting: () => currentFormatting,
    getCurrentAlignment: () => currentAlignment,
    findText,
    findNext,
    findPrev,
    replaceText,
    replaceAllText
  }), [undo, redo, selectAllText, insertTextAtCursor, formatSelectedText, applyAlignment, pasteFromClipboard, currentFormatting, currentAlignment, findText, findNext, findPrev, replaceText, replaceAllText]);

  // Update content when prop changes
  useEffect(() => {
    if (editorRef.current && isMounted) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content || '';
      }
    }
  }, [content, isMounted]);

  // Update cursor position on selection change
  useEffect(() => {
    if (editorRef.current && isMounted) {
      const handleSelectionChange = () => updateCursorInfo();
      document.addEventListener('selectionchange', handleSelectionChange);
      return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }
  }, [isMounted, updateCursorInfo]);

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className={`flex-1 flex flex-col ${className}`}>
        <div className="flex-1 p-4 border rounded">
          <div className="animate-pulse bg-muted-foreground/20 h-32 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full flex flex-col relative ${className}`}>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        style={{
          fontFamily: fontFamily === 'system-ui' ? 'system-ui, -apple-system, sans-serif' : fontFamily,
          fontSize: `${fontSize}px`,
          textAlign: textAlignment,
          wordWrap: wordWrap ? 'break-word' : 'normal',
          overflowWrap: wordWrap ? 'break-word' : 'normal',
          whiteSpace: wordWrap ? 'pre-wrap' : 'pre'
        }}
        className="h-full w-full p-4 border-none outline-none resize-none bg-transparent text-foreground leading-relaxed overflow-y-auto scrollbar-themed"
        data-placeholder={placeholder}
      />
      
      <style jsx>{`
        div[contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          opacity: 0.6;
          pointer-events: none;
        }
        
        div[contenteditable]:focus {
          outline: none;
          box-shadow: none;
        }
        
        /* Mobile optimization */
        @media (max-width: 640px) {
          div[contenteditable] {
            font-size: 16px !important; /* Prevent zoom on mobile */
          }
        }
      `}</style>
    </div>
  );
});