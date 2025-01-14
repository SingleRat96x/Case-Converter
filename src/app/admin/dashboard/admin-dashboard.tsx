'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Search, LogOut, Bold, Italic, Strikethrough, List, ListOrdered, Heading1, Heading2, Heading3, Code, Quote, Undo, Redo, Minus, LayoutGrid, Settings, Eye, EyeOff, RefreshCw, ChevronLeft, Menu as MenuIcon, Users, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { invalidateToolCache, invalidateAllCaches } from '@/lib/tools';
import type { ToolContent } from '@/lib/tools';
import { clearAuthToken, isAuthenticated } from '@/lib/auth';
import { MenuManagement } from './menu-management';
import { revalidateToolContent } from '@/lib/actions';

export function AdminDashboard() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolContent[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'tools' | 'visibility' | 'menu'>('tools');

  const editor = useEditor({
    extensions: [StarterKit],
    content: selectedTool?.long_description || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300',
      },
    },
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/admin');
      return;
    }
    fetchTools();
  }, [router]);

  const fetchTools = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('name');

      if (error) throw error;

      setTools(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching tools');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    router.push('/admin');
  };

  const handleEditTool = (tool: ToolContent) => {
    setSelectedTool(tool);
    if (editor) {
      editor.commands.setContent(tool.long_description);
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedTool || !editor) return;

    try {
      const { error } = await supabase
        .from('tools')
        .update({
          title: selectedTool.title,
          short_description: selectedTool.short_description,
          long_description: editor.getHTML(),
          show_in_index: selectedTool.show_in_index,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTool.id);

      if (error) throw error;

      // Invalidate the cache for this tool
      invalidateToolCache(selectedTool.id);

      setError('Changes saved successfully! The live page will be updated shortly.');
      fetchTools(); // Refresh the tools list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving changes');
    }
  };

  const handleVisibilityToggle = async (toolId: string, currentValue: boolean) => {
    try {
      // First update the local state optimistically
      setTools(prevTools => 
        prevTools.map(tool => 
          tool.id === toolId ? { ...tool, show_in_index: !currentValue } : tool
        )
      );

      // Then update in the database
      const { error } = await supabase
        .from('tools')
        .update({
          show_in_index: !currentValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', toolId);

      if (error) throw error;

      // First invalidate the specific tool cache
      await invalidateToolCache(toolId);
      
      // Then invalidate all caches to ensure the index page is updated
      await invalidateAllCaches();
      
      // Revalidate Next.js cache
      await revalidateToolContent(toolId);
      
      // Finally refresh the tools list to ensure we have the latest data
      await fetchTools();
      
      setError('Visibility updated successfully! Please wait a moment for the changes to take effect.');
    } catch (err) {
      // Revert the optimistic update on error
      await fetchTools();
      setError(err instanceof Error ? err.message : 'An error occurred while updating visibility');
    }
  };

  const handleClearCache = async () => {
    try {
      setIsLoading(true);
      // Make sure to await the cache invalidation
      await invalidateAllCaches();
      
      // Revalidate Next.js cache for all pages
      await revalidateToolContent('*');

      // Redirect to home page with timestamp to force fresh data
      window.open(`/?t=${Date.now()}`, '_blank');
      
      await fetchTools(); // Refresh the tools list
      setError('Cache cleared successfully! The changes will be reflected in the new tab.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while clearing the cache');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTools = tools.filter(tool => 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.short_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const EditorMenuBar = () => {
    if (!editor) return null;

    const setLineHeight = (height: string) => {
      editor.chain().focus().setParagraph().run();
      const element = editor.view.dom as HTMLElement;
      if (height === 'default') {
        element.style.lineHeight = '';
      } else {
        element.style.lineHeight = height;
      }
    };

    const setWordSpacing = (spacing: string) => {
      editor.chain().focus().setParagraph().run();
      const element = editor.view.dom as HTMLElement;
      if (spacing === 'default') {
        element.style.wordSpacing = '';
      } else {
        element.style.wordSpacing = spacing;
      }
    };

    return (
      <div className="border-b border-border p-2 mb-4 flex flex-wrap gap-1 bg-muted rounded-t-lg">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded transition-colors ${editor.isActive('bold') ? 'bg-accent' : 'hover:bg-accent'}`}
          title="Bold"
        >
          <Bold className="h-5 w-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded transition-colors ${editor.isActive('italic') ? 'bg-accent' : 'hover:bg-accent'}`}
          title="Italic"
        >
          <Italic className="h-5 w-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded transition-colors ${editor.isActive('strike') ? 'bg-accent' : 'hover:bg-accent'}`}
          title="Strikethrough"
        >
          <Strikethrough className="h-5 w-5" />
        </button>
        <div className="w-px h-6 bg-border mx-1 self-center" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-accent' : 'hover:bg-accent'}`}
          title="Heading 1"
        >
          <Heading1 className="h-5 w-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-accent' : 'hover:bg-accent'}`}
          title="Heading 2"
        >
          <Heading2 className="h-5 w-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-accent' : 'hover:bg-accent'}`}
          title="Heading 3"
        >
          <Heading3 className="h-5 w-5" />
        </button>
        <div className="w-px h-6 bg-border mx-1 self-center" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-accent' : 'hover:bg-accent'}`}
          title="Bullet List"
        >
          <List className="h-5 w-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-accent' : 'hover:bg-accent'}`}
          title="Numbered List"
        >
          <ListOrdered className="h-5 w-5" />
        </button>
        <div className="w-px h-6 bg-border mx-1 self-center" />
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded transition-colors ${editor.isActive('codeBlock') ? 'bg-accent' : 'hover:bg-accent'}`}
          title="Code Block"
        >
          <Code className="h-5 w-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded transition-colors ${editor.isActive('blockquote') ? 'bg-accent' : 'hover:bg-accent'}`}
          title="Quote"
        >
          <Quote className="h-5 w-5" />
        </button>
        <div className="w-px h-6 bg-border mx-1 self-center" />
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded transition-colors hover:bg-accent"
          title="Horizontal Line"
        >
          <Minus className="h-5 w-5" />
        </button>
        <div className="w-px h-6 bg-border mx-1 self-center" />
        <select
          onChange={(e) => setLineHeight(e.target.value)}
          className="p-2 rounded bg-background border border-input hover:bg-accent transition-colors text-sm"
          title="Line Height"
        >
          <option value="default">Line Height</option>
          <option value="1">Single</option>
          <option value="1.5">1.5</option>
          <option value="2">Double</option>
          <option value="2.5">2.5</option>
        </select>
        <select
          onChange={(e) => setWordSpacing(e.target.value)}
          className="p-2 rounded bg-background border border-input hover:bg-accent transition-colors text-sm"
          title="Word Spacing"
        >
          <option value="default">Word Spacing</option>
          <option value="normal">Normal</option>
          <option value="0.1em">Tight</option>
          <option value="0.3em">Wide</option>
          <option value="0.5em">Wider</option>
        </select>
        <div className="w-px h-6 bg-border mx-1 self-center" />
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded transition-colors hover:bg-accent"
          title="Undo"
        >
          <Undo className="h-5 w-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded transition-colors hover:bg-accent"
          title="Redo"
        >
          <Redo className="h-5 w-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Header */}
      <div className="lg:hidden bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={handleClearCache}
              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="Clear Cache"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav className="mt-4 flex gap-2">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'tools' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-accent'
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
            Tools
          </button>
          <button
            onClick={() => setActiveTab('visibility')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'visibility' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-accent'
            }`}
          >
            <Settings className="h-5 w-5" />
            Visibility
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'menu' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-accent'
            }`}
          >
            <MenuIcon className="h-5 w-5" />
            Menu
          </button>
        </nav>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Desktop Only */}
        <div className="hidden lg:block w-64 border-r border-border bg-card min-h-screen p-4">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
              <div className="flex gap-2">
                <button
                  onClick={handleClearCache}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Clear Cache"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('tools')}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'tools' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
                Tools
              </button>
              <button
                onClick={() => setActiveTab('visibility')}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'visibility' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
              >
                <Settings className="h-5 w-5" />
                Visibility Settings
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'menu' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
              >
                <MenuIcon className="h-5 w-5" />
                Menu Management
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          {error && (
            <div className={`p-4 rounded-lg mb-6 ${error.includes('success') ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
              {error}
            </div>
          )}

          {activeTab === 'menu' ? (
            <MenuManagement />
          ) : activeTab === 'visibility' ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Tool Visibility Settings</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <span className="font-medium">{tool.title}</span>
                    <button
                      onClick={() => handleVisibilityToggle(tool.id, tool.show_in_index)}
                      className={`p-2 rounded-lg transition-colors ${
                        tool.show_in_index
                          ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {tool.show_in_index ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : isEditing && selectedTool ? (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setSelectedTool(null);
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-muted hover:bg-accent rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Tools
              </button>

              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={selectedTool?.title || ''}
                      onChange={(e) => setSelectedTool(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Short Description</label>
                    <input
                      type="text"
                      value={selectedTool?.short_description || ''}
                      onChange={(e) => setSelectedTool(prev => prev ? { ...prev, short_description: e.target.value } : null)}
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Long Description</label>
                    <div className="bg-background border border-input rounded-lg overflow-hidden">
                      <EditorMenuBar />
                      <EditorContent editor={editor} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleEditTool(tool)}
                    className="text-left p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors group"
                  >
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{tool.short_description}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}