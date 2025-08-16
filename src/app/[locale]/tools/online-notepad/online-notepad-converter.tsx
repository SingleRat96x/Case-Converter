'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateTextStatistics } from '@/lib/text-utils';
import {
  ArrowUpDown,
  Copy,
  Download,
  Search,
  Type,
  Trash2,
  FileText,
  Wand2,
  AlignJustify,
  SortAsc,
  X,
  Replace,
  CaseSensitive,
  TextSelect,
  RotateCcw,
  Save,
  FileUp
} from 'lucide-react';

export function OnlineNotepad() {
  const [content, setContent] = useState('');
  const [stats, setStats] = useState(calculateTextStatistics(''));
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [selectedCase, setSelectedCase] = useState('none');

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

  // Text Case Transformations
  const handleCaseChange = (value: string) => {
    setSelectedCase(value);
    switch (value) {
      case 'upper':
        setContent(content.toUpperCase());
        break;
      case 'lower':
        setContent(content.toLowerCase());
        break;
      case 'capitalize':
        setContent(
          content.replace(/\b\w/g, (char) => char.toUpperCase())
        );
        break;
      case 'sentence':
        setContent(
          content.toLowerCase().replace(/(^\w|\.\s+\w)/g, (char) => char.toUpperCase())
        );
        break;
    }
  };

  // Text Transformations
  const handleReverse = () => {
    setContent(content.split('').reverse().join(''));
  };

  const handleRemoveSpaces = () => {
    setContent(content.replace(/\s+/g, ''));
  };

  const handleTrimLines = () => {
    setContent(content.split('\n').map(line => line.trim()).join('\n'));
  };

  const handleRemoveDuplicateLines = () => {
    const lines = content.split('\n');
    const uniqueLines = [...new Set(lines)];
    setContent(uniqueLines.join('\n'));
  };

  const handleSortLines = () => {
    const lines = content.split('\n');
    const sortedLines = lines.sort();
    setContent(sortedLines.join('\n'));
  };

  // Find and Replace
  const handleFindReplace = () => {
    if (!findText) return;
    const regex = new RegExp(findText, 'g');
    setContent(content.replace(regex, replaceText));
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all content?')) {
      setContent('');
      localStorage.removeItem('online-notepad-content');
      setLastSaved(null);
      setStats(calculateTextStatistics(''));
      setSelectedCase('none');
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TextSelect className="h-6 w-6" />
            Online Notepad
          </h2>
          <div className="flex gap-2">
            <Button onClick={handleDownload} variant="outline" disabled={!content}>
              <FileUp className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleCopy} variant="outline" disabled={!content}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button onClick={handleClear} variant="outline" disabled={!content} className="text-red-500 hover:text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        <Tabs defaultValue="transform" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="transform">
              <CaseSensitive className="h-4 w-4 mr-2" />
              Text Tools
            </TabsTrigger>
            <TabsTrigger value="find">
              <Replace className="h-4 w-4 mr-2" />
              Find & Replace
            </TabsTrigger>
            <TabsTrigger value="stats">
              <FileText className="h-4 w-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transform" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Select value={selectedCase} onValueChange={handleCaseChange}>
                <SelectTrigger className="w-[180px]">
                  <Type className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Change Case" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Original Case</SelectItem>
                  <SelectItem value="upper">UPPERCASE</SelectItem>
                  <SelectItem value="lower">lowercase</SelectItem>
                  <SelectItem value="capitalize">Capitalize Words</SelectItem>
                  <SelectItem value="sentence">Sentence case</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleReverse} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reverse Text
              </Button>
              <Button onClick={handleRemoveSpaces} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Remove Spaces
              </Button>
              <Button onClick={handleTrimLines} variant="outline">
                <AlignJustify className="h-4 w-4 mr-2" />
                Trim Lines
              </Button>
              <Button onClick={handleRemoveDuplicateLines} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Remove Duplicates
              </Button>
              <Button onClick={handleSortLines} variant="outline">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort Lines
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="find" className="space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="find">Find</Label>
                  <Input
                    id="find"
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    placeholder="Text to find..."
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="replace">Replace</Label>
                  <Input
                    id="replace"
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    placeholder="Replace with..."
                  />
                </div>
              </div>
              <Button onClick={handleFindReplace} disabled={!findText}>
                <Replace className="h-4 w-4 mr-2" />
                Replace All
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span>Characters: {stats.characters}</span>
              </div>
              <div className="flex items-center gap-2">
                <TextSelect className="h-4 w-4 text-gray-500" />
                <span>Words: {stats.words}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlignJustify className="h-4 w-4 text-gray-500" />
                <span>Lines: {stats.lines}</span>
              </div>
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-gray-500" />
                <span>Characters (no spaces): {stats.characters - (content.match(/\s/g)?.length || 0)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span>Paragraphs: {content.split(/\n\s*\n/).filter(Boolean).length}</span>
              </div>
              {lastSaved && (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4 text-gray-500" />
                  <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div>
          <Label htmlFor="notepad">Content</Label>
          <Textarea
            id="notepad"
            placeholder="Start typing..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] font-mono"
          />
        </div>
      </div>
    </Card>
  );
} 