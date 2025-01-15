'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { calculateTextStatistics } from '@/lib/text-utils';

export function OnlineNotepad() {
  const [content, setContent] = useState('');
  const [stats, setStats] = useState(calculateTextStatistics(''));
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load saved content on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('online-notepad-content');
    if (savedContent) {
      setContent(savedContent);
      setStats(calculateTextStatistics(savedContent));
    }
  }, []);

  // Auto-save content
  useEffect(() => {
    const saveContent = () => {
      localStorage.setItem('online-notepad-content', content);
      setLastSaved(new Date());
      setStats(calculateTextStatistics(content));
    };

    const timeoutId = setTimeout(saveContent, 1000);
    return () => clearTimeout(timeoutId);
  }, [content]);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all content?')) {
      setContent('');
      localStorage.removeItem('online-notepad-content');
      setLastSaved(null);
      setStats(calculateTextStatistics(''));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notepad.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="notepad">Notepad</Label>
          <Textarea
            id="notepad"
            placeholder="Start typing..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] font-mono"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>Characters: {stats.characters}</p>
            <p>Words: {stats.words}</p>
            <p>Lines: {stats.lines}</p>
            {lastSaved && (
              <p>Last saved: {lastSaved.toLocaleTimeString()}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" disabled={!content}>
              Download
            </Button>
            <Button onClick={handleCopy} variant="outline" disabled={!content}>
              Copy
            </Button>
            <Button onClick={handleClear} variant="outline" disabled={!content}>
              Clear
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
} 